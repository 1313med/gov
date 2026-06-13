const PriceSnapshot = require("../models/PriceSnapshot");

async function recordPriceSnapshot(listing, intent, event = "listed") {
  if (!listing?.brand || !listing?.model || !listing?._id) return;
  const price = intent === "rental" ? listing.pricePerDay : listing.price;
  if (!price || price <= 0) return;

  await PriceSnapshot.create({
    brand: String(listing.brand).trim(),
    model: String(listing.model).trim(),
    year: listing.year || null,
    city: listing.city || null,
    intent,
    price,
    mileage: listing.mileage || null,
    listingId: listing._id,
    event,
    recordedAt: new Date(),
  }).catch(() => {});
}

module.exports = { recordPriceSnapshot };
