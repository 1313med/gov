const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const { canCustomerLeaveRentalListingReview } = require("../utils/reviewEligibility");

// GET /api/reviews/:targetModel/:targetId/me/eligibility (auth — can I write a rental review?)
exports.getMyRentalReviewWriteEligibility = asyncHandler(async (req, res) => {
  const { targetModel, targetId } = req.params;
  if (targetModel !== "RentalListing") {
    return res.json({ eligible: false, code: "not_rental" });
  }
  const bookings = await Booking.find({
    customerId: req.user._id,
    rentalId: targetId,
    status: { $in: ["confirmed", "completed", "expired"] },
    deletedAt: null,
  })
    .select("status endDate")
    .lean();

  if (!bookings.length) {
    return res.json({ eligible: false, code: "no_rental" });
  }
  const eligible = bookings.some((b) => canCustomerLeaveRentalListingReview(b));
  if (!eligible) {
    return res.json({ eligible: false, code: "before_last_day" });
  }
  return res.json({ eligible: true, code: "ok" });
});

// GET /api/reviews/:targetModel/:targetId
exports.getReviews = asyncHandler(async (req, res) => {
  const { targetModel, targetId } = req.params;
  const reviews = await Review.find({ targetId, targetModel })
    .populate("authorId", "name avatar")
    .sort({ createdAt: -1 });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  res.json({
    reviews: reviews.map((r) => ({
      ...r.toObject(),
      verified: Boolean(r.bookingId),
    })),
    avgRating: Math.round(avgRating * 10) / 10,
    total: reviews.length,
  });
});

// POST /api/reviews/:targetModel/:targetId
exports.createReview = asyncHandler(async (req, res) => {
  const { targetModel, targetId } = req.params;
  const { rating, comment } = req.body;

  if (!["SaleListing", "RentalListing", "User"].includes(targetModel)) {
    res.status(400);
    throw new Error("Invalid target model");
  }

  if (!rating || rating < 1 || rating > 5) {
    res.status(400);
    throw new Error("Rating must be between 1 and 5");
  }

  // Gate: rental reviews — only the renter, only this listing, only from last rental day onward (local)
  if (targetModel === "RentalListing") {
    const bookings = await Booking.find({
      customerId: req.user._id,
      rentalId: targetId,
      status: { $in: ["confirmed", "completed", "expired"] },
      deletedAt: null,
    }).lean();
    const eligible = bookings.some((b) => canCustomerLeaveRentalListingReview(b));
    if (!eligible) {
      res.status(403);
      throw new Error(
        bookings.length === 0
          ? "You can only review a car you have rented on this listing."
          : "Reviews open on the last day of your rental (checkout day). You cannot post a review before then."
      );
    }
  }

  // Do not overwrite trip-feedback reviews when using the generic “write a review” form
  const existing = await Review.findOne({
    authorId: req.user._id,
    targetId,
    targetModel,
    bookingId: null,
  });

  if (existing) {
    // Update existing review
    existing.rating = rating;
    existing.comment = comment || existing.comment;
    await existing.save();
    return res.json(existing);
  }

  const review = await Review.create({
    authorId: req.user._id,
    targetId,
    targetModel,
    rating,
    comment,
  });

  const populated = await review.populate("authorId", "name avatar");
  res.status(201).json(populated);
});

// DELETE /api/reviews/:id
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error("Review not found");
  }
  if (
    review.authorId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }
  await review.deleteOne();
  res.json({ message: "Review deleted" });
});
