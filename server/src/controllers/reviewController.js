const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Booking = require("../models/Booking");

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

  res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
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

  // Gate: rental reviews require a completed booking by this user
  if (targetModel === "RentalListing") {
    const hasCompleted = await Booking.findOne({
      customerId: req.user._id,
      rentalId:   targetId,
      status:     "completed",
      deletedAt:  null,
    });
    if (!hasCompleted) {
      res.status(403);
      throw new Error("You can only review a rental after completing a booking");
    }
  }

  const existing = await Review.findOne({
    authorId: req.user._id,
    targetId,
    targetModel,
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
