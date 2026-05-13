/**
 * Match rental createBooking: UTC calendar days inclusive, offers applied.
 * @returns {{ days: number, totalAmount: number, appliedOffer: object|null }}
 */
function computeBookingTotalForRental(rental, start, end) {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const days = Math.max(1, Math.floor((endUTC - startUTC) / MS_PER_DAY) + 1);

  let totalAmount = days * rental.pricePerDay;
  let appliedOffer = null;
  const now = new Date();
  const activeOffers = (rental.offers || []).filter(
    (o) => o.isActive && days >= o.minDays && (!o.expiresAt || new Date(o.expiresAt) > now)
  );

  let bestSaving = 0;
  for (const offer of activeOffers) {
    let saving = 0;
    if (offer.type === "free_days") {
      saving = offer.freeExtraDays * rental.pricePerDay;
    } else if (offer.type === "percent_discount") {
      saving = totalAmount * (offer.discountPercent / 100);
    }
    if (saving > bestSaving) {
      bestSaving = saving;
      appliedOffer = offer;
    }
  }
  if (appliedOffer) totalAmount = Math.max(0, totalAmount - bestSaving);

  return { days, totalAmount, appliedOffer };
}

module.exports = { computeBookingTotalForRental };
