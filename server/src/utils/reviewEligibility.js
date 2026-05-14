/** Start of local calendar day for a date (noon-safe: uses Y/M/D components). */
function startOfLocalDay(d) {
  const x = new Date(d);
  return new Date(x.getFullYear(), x.getMonth(), x.getDate(), 0, 0, 0, 0);
}

/** True when "today" (local) is on or after the last rental day (local day of booking end). */
function isOnOrAfterLastRentalDay(endDate) {
  if (endDate == null) return false;
  const todayStart = startOfLocalDay(new Date());
  const lastRentalDayStart = startOfLocalDay(new Date(endDate));
  return todayStart.getTime() >= lastRentalDayStart.getTime();
}

/**
 * Customer may post a public rental listing review (or trip feedback that syncs to reviews)
 * only for their own booking in confirmed / completed / expired state, and not before the
 * last day of the rental (checkout day) in local time.
 */
function canCustomerLeaveRentalListingReview(booking) {
  if (!booking) return false;
  if (!["confirmed", "completed", "expired"].includes(booking.status)) return false;
  return isOnOrAfterLastRentalDay(booking.endDate);
}

module.exports = {
  startOfLocalDay,
  isOnOrAfterLastRentalDay,
  canCustomerLeaveRentalListingReview,
};
