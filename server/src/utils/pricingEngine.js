/**
 * Dynamic Pricing Engine
 * Suggests an adjusted daily price based on demand signals.
 *
 * @param {number} basePrice  - Current price per day
 * @param {object} factors    - Signals that influence price
 * @param {Date}   [factors.date]             - Target date (for weekend detection)
 * @param {number} [factors.daysUntilBooking] - Lead time in days
 * @param {number} [factors.occupancyRate]    - Fleet occupancy 0–100
 * @param {number} [factors.weekendDemandRatio] - Weekend vs weekday demand (e.g. 1.8 = 80% more)
 * @returns {{ suggestedPrice: number, adjustments: Array<{reason:string, delta:number}> }}
 */
function suggestPrice(basePrice, factors = {}) {
  let multiplier = 1.0;
  const adjustments = [];

  // Weekend premium
  if (factors.date) {
    const day = new Date(factors.date).getDay();
    if (day === 0 || day === 6) {
      multiplier += 0.20;
      adjustments.push({ reason: "Weekend demand", delta: +20 });
    }
  }

  // Last-minute discount (< 3 days lead time)
  if (typeof factors.daysUntilBooking === "number") {
    if (factors.daysUntilBooking < 3) {
      multiplier -= 0.15;
      adjustments.push({ reason: "Last-minute availability", delta: -15 });
    } else if (factors.daysUntilBooking > 30) {
      // Early bird — slight premium for advance bookings
      multiplier += 0.05;
      adjustments.push({ reason: "Advance booking", delta: +5 });
    }
  }

  // High demand (occupancy above 75%)
  if (typeof factors.occupancyRate === "number") {
    if (factors.occupancyRate >= 75) {
      multiplier += 0.15;
      adjustments.push({ reason: "High fleet occupancy", delta: +15 });
    } else if (factors.occupancyRate < 25) {
      multiplier -= 0.10;
      adjustments.push({ reason: "Low fleet occupancy", delta: -10 });
    }
  }

  // High weekend-to-weekday demand ratio
  if (typeof factors.weekendDemandRatio === "number") {
    if (factors.weekendDemandRatio > 1.5) {
      multiplier += 0.10;
      adjustments.push({ reason: "High weekend-to-weekday ratio", delta: +10 });
    }
  }

  const suggestedPrice = Math.round(basePrice * multiplier);

  return { suggestedPrice, adjustments };
}

module.exports = { suggestPrice };
