const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");
const Review = require("../models/Review");
const {
  getUserRoles,
  getPrimaryRole,
  normalizeRoleSlug,
  hasUserRole,
} = require("../utils/userRoles");
const { getCityNameFromSlug, getCitySlugFromName, cityNameMatchesSlug } = require("../utils/citySlugs");
const { buildAgencyPath, buildDealerPath } = require("../utils/seoSlugs");
const {
  toPublicProfessionalCard,
  toPublicSellerProfile,
  isVerifiedIdentity,
} = require("../utils/publicProfile");

// ── SALE FAVORITES ─────────────────────────────────────────────────────────

exports.addFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(req.params.id)) user.favorites.push(req.params.id);
  await user.save();
  res.json({ favorites: user.favorites });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter((fav) => fav.toString() !== req.params.id);
  await user.save();
  res.json({ favorites: user.favorites });
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.json(user.favorites);
});

// ── RENTAL FAVORITES ───────────────────────────────────────────────────────

exports.addRentalFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.rentalFavorites.includes(req.params.id)) user.rentalFavorites.push(req.params.id);
  await user.save();
  res.json({ rentalFavorites: user.rentalFavorites });
});

exports.removeRentalFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.rentalFavorites = user.rentalFavorites.filter((f) => f.toString() !== req.params.id);
  await user.save();
  res.json({ rentalFavorites: user.rentalFavorites });
});

exports.getRentalFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("rentalFavorites");
  res.json(user.rentalFavorites);
});

// ── PROFILE ────────────────────────────────────────────────────────────────

exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const json = user.toObject();
  json.roles = getUserRoles(user);
  json.role = getPrimaryRole(user);
  res.json(json);
});

/** Add a capability role (customer is always present). Body: { role: "car_owner" | "rental_owner" } */
exports.addMyRole = asyncHandler(async (req, res) => {
  const slug = normalizeRoleSlug(req.body.role);
  if (!["car_owner", "rental_owner"].includes(slug)) {
    res.status(400);
    throw new Error("Only car_owner or rental_owner can be added");
  }
  const user = await User.findById(req.user._id);
  const next = new Set(getUserRoles(user));
  next.add(slug);
  user.roles = [...next];
  user.role = getPrimaryRole(user);
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  const json = updated.toObject();
  json.roles = getUserRoles(updated);
  json.role = getPrimaryRole(updated);
  res.json(json);
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { name, city, bio, avatar, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name)   user.name   = name;
  if (city)   user.city   = city;
  if (bio !== undefined)    user.bio    = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (email !== undefined)  user.email  = email;

  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

// ── DRIVER LICENSE ─────────────────────────────────────────────────────────

exports.updateDriverLicense = asyncHandler(async (req, res) => {
  const { number, expiryDate, imageUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!number || !imageUrl) {
    res.status(400);
    throw new Error("License number and image are required");
  }

  user.driverLicense = {
    number:     number.trim(),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    imageUrl,
    verified:   false, // reset verification when re-uploaded
  };
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

exports.updateNationalId = asyncHandler(async (req, res) => {
  const { number, imageUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!number || !imageUrl) {
    res.status(400);
    throw new Error("National ID number and image are required");
  }

  user.nationalId = {
    number:   number.trim(),
    imageUrl,
    verified: false,
  };
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

// ── SELLER PROFILE (PUBLIC) ────────────────────────────────────────────────

async function reviewStatsForUser(userId) {
  const reviews = await Review.find({ targetId: userId, targetModel: "User" })
    .populate("authorId", "name avatar")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  const total = reviews.length;
  const avgRating =
    total > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;
  return { reviews, avgRating, total };
}

function rentalCategoriesFromFleet(rentals) {
  const cats = new Set();
  for (const r of rentals) {
    if (r.fuel) cats.add(String(r.fuel));
    if (r.gearbox) cats.add(String(r.gearbox));
    if (Number(r.seats) >= 7) cats.add("7+ places");
    else if (Number(r.seats) >= 5) cats.add("5 places");
  }
  return [...cats].slice(0, 8);
}

async function enrichProfessional(user, kind, fleetSize) {
  const stats = await reviewStatsForUser(user._id);
  const citySlug = getCitySlugFromName(user.city) || "casablanca";
  const path =
    kind === "agency"
      ? buildAgencyPath(citySlug, user.name, user._id)
      : buildDealerPath(citySlug, user.name, user._id);
  return toPublicProfessionalCard(user, {
    fleetSize,
    path,
    citySlug,
    avgRating: stats.avgRating,
    reviewCount: stats.total,
    verified: isVerifiedIdentity(user),
  });
}

exports.listAgencies = asyncHandler(async (req, res) => {
  const citySlug = req.query.city || null;
  const cityName = citySlug ? getCityNameFromSlug(citySlug) : null;

  const ownerIds = await RentalListing.distinct("rentalOwnerId", {
    status: "approved",
    deletedAt: null,
  });

  const users = await User.find({
    _id: { $in: ownerIds },
    deletedAt: null,
  })
    .select("name phone email city bio avatar nationalId driverLicense roles role")
    .limit(200)
    .lean();

  const filtered = cityName
    ? users.filter((u) => cityNameMatchesSlug(u.city, citySlug))
    : users;

  const agencies = await Promise.all(
    filtered.map(async (u) => {
      const fleetSize = await RentalListing.countDocuments({
        rentalOwnerId: u._id,
        status: "approved",
        deletedAt: null,
      });
      if (fleetSize < 1) return null;
      return enrichProfessional(u, "agency", fleetSize);
    })
  );

  res.json({ agencies: agencies.filter(Boolean) });
});

exports.listDealers = asyncHandler(async (req, res) => {
  const citySlug = req.query.city || null;
  const cityName = citySlug ? getCityNameFromSlug(citySlug) : null;

  const sellerIds = await SaleListing.distinct("sellerId", {
    status: "approved",
    deletedAt: null,
  });

  const users = await User.find({
    _id: { $in: sellerIds },
    deletedAt: null,
  })
    .select("name phone email city bio avatar nationalId driverLicense roles role")
    .limit(200)
    .lean();

  const filtered = cityName
    ? users.filter((u) => cityNameMatchesSlug(u.city, citySlug))
    : users;

  const dealers = await Promise.all(
    filtered.map(async (u) => {
      const inventory = await SaleListing.countDocuments({
        sellerId: u._id,
        status: "approved",
        deletedAt: null,
      });
      if (inventory < 1) return null;
      return enrichProfessional(u, "dealer", inventory);
    })
  );

  res.json({ dealers: dealers.filter(Boolean) });
});

exports.getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id).select(
    "name phone email city role roles bio avatar nationalId driverLicense businessProfile"
  );
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  const [listings, rentalListings, reviewData] = await Promise.all([
    SaleListing.find({ sellerId: seller._id, status: "approved" }).sort({ createdAt: -1 }),
    RentalListing.find({ rentalOwnerId: seller._id, status: "approved" }).sort({ createdAt: -1 }),
    reviewStatsForUser(seller._id),
  ]);

  const citySlug = getCitySlugFromName(seller.city) || "casablanca";
  const isAgency = rentalListings.length > 0 && hasUserRole(seller, "rental_owner");
  const isDealer = listings.length > 0 && hasUserRole(seller, "car_owner");
  const kind = isAgency ? "agency" : isDealer ? "dealer" : "seller";

  const relatedQuery = {
    _id: { $ne: seller._id },
    deletedAt: null,
    city: seller.city ? new RegExp(seller.city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : /.*/,
  };

  let related = [];
  if (kind === "agency") {
    const ids = await RentalListing.distinct("rentalOwnerId", {
      status: "approved",
      deletedAt: null,
      rentalOwnerId: { $ne: seller._id },
    });
    const users = await User.find({ _id: { $in: ids.slice(0, 20) }, ...relatedQuery })
      .select("name city avatar")
      .limit(6)
      .lean();
    related = await Promise.all(
      users.map(async (u) => {
        const fleetSize = await RentalListing.countDocuments({
          rentalOwnerId: u._id,
          status: "approved",
          deletedAt: null,
        });
        return enrichProfessional(u, "agency", fleetSize);
      })
    );
  } else if (kind === "dealer") {
    const ids = await SaleListing.distinct("sellerId", {
      status: "approved",
      deletedAt: null,
      sellerId: { $ne: seller._id },
    });
    const users = await User.find({ _id: { $in: ids.slice(0, 20) }, ...relatedQuery })
      .select("name city avatar")
      .limit(6)
      .lean();
    related = await Promise.all(
      users.map(async (u) => {
        const inventory = await SaleListing.countDocuments({
          sellerId: u._id,
          status: "approved",
          deletedAt: null,
        });
        return enrichProfessional(u, "dealer", inventory);
      })
    );
  }

  const bp = seller.businessProfile || {};
  const openingHours = bp.openingHours || "Lun–Sam 9h–19h";
  const address = bp.address || (seller.city ? `${seller.city}, Maroc` : "Maroc");

  const { computeReputation } = require("./intelligenceController");
  const reputation = await computeReputation(seller._id);

  res.json({
    seller: toPublicSellerProfile(seller),
    kind,
    citySlug,
    agencyPath: isAgency ? buildAgencyPath(citySlug, seller.name, seller._id) : null,
    dealerPath: isDealer ? buildDealerPath(citySlug, seller.name, seller._id) : null,
    listings,
    rentalListings,
    fleetSize: rentalListings.length,
    inventoryCount: listings.length,
    rentalCategories: rentalCategoriesFromFleet(rentalListings),
    openingHours,
    address,
    reviews: reviewData.reviews.map((r) => ({ ...r, verified: Boolean(r.bookingId) })),
    avgRating: reviewData.avgRating,
    reviewCount: reviewData.total,
    verified: isVerifiedIdentity(seller),
    reputation,
    related: related.filter(Boolean),
  });
});
