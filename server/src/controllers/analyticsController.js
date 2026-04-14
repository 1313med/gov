const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");
const Maintenance = require("../models/Maintenance");
const { suggestPrice } = require("../utils/pricingEngine");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPeriodStart(period) {
  const now = Date.now();
  switch (period) {
    case "today": {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    case "7d":  return new Date(now - 7  * 86400000);
    case "3m":  return new Date(now - 90 * 86400000);
    case "1y":  return new Date(now - 365 * 86400000);
    case "30d":
    default:    return new Date(now - 30 * 86400000);
  }
}

function daysBetween(a, b) {
  return Math.max(0, (new Date(b) - new Date(a)) / 86400000);
}

// ---------------------------------------------------------------------------
// GET /api/analytics/owner  (main dashboard data)
// ---------------------------------------------------------------------------
exports.getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId  = req.user._id;
    const period   = req.query.period || "30d";
    const startDate = getPeriodStart(period);
    const now       = new Date();

    // 1. Owner's active rentals
    const rentals = await RentalListing.find({ rentalOwnerId: ownerId, deletedAt: null });
    const rentalIds = rentals.map((r) => r._id);
    if (!rentalIds.length) {
      return res.json(emptyAnalytics());
    }

    // 2. All bookings in period (single query — eliminates N+1)
    const bookings = await Booking.find({
      rentalId: { $in: rentalIds },
      startDate: { $gte: startDate },
      deletedAt: null,
    }).populate("rentalId", "title pricePerDay");

    // 3. Previous period bookings (for growth calculation)
    const periodMs = now - startDate;
    const prevStart = new Date(startDate - periodMs);
    const prevBookings = await Booking.find({
      rentalId: { $in: rentalIds },
      startDate: { $gte: prevStart, $lt: startDate },
      deletedAt: null,
    }).populate("rentalId", "pricePerDay");

    // 4. Maintenance costs in period
    const maintenanceCosts = await Maintenance.aggregate([
      { $match: { rentalId: { $in: rentalIds }, date: { $gte: startDate }, deletedAt: null } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalMaintenanceCost = maintenanceCosts[0]?.total || 0;

    // --------------- Revenue using stored totalAmount ---------------
    const confirmedOrCompleted = bookings.filter(
      (b) => b.status === "confirmed" || b.status === "completed"
    );

    let totalRevenue = 0;
    confirmedOrCompleted.forEach((b) => {
      totalRevenue += b.totalAmount || 0;
    });

    let previousRevenue = 0;
    prevBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .forEach((b) => { previousRevenue += b.totalAmount || 0; });

    const netProfit = totalRevenue - totalMaintenanceCost;
    const revenueGrowth = previousRevenue > 0
      ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    // --------------- Period days for avgDailyRevenue ---------------
    const periodDays = Math.max(1, daysBetween(startDate, now));
    const avgDailyRevenue = Math.round(totalRevenue / periodDays);

    // --------------- Booking status breakdown ---------------
    const statusCounts = { confirmed: 0, pending: 0, rejected: 0, cancelled: 0, completed: 0 };
    bookings.forEach((b) => { if (statusCounts[b.status] !== undefined) statusCounts[b.status]++; });

    const bookingStatusData = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // --------------- Monthly revenue (aggregated in JS — data already loaded) ---------------
    const monthlyRevenueMap = {};
    const trendMap = {};

    confirmedOrCompleted.forEach((b) => {
      const month = new Date(b.startDate).toLocaleString("default", { month: "short" });
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + (b.totalAmount || 0);
      trendMap[month] = (trendMap[month] || 0) + 1;
    });

    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue }));
    const bookingTrends  = Object.entries(trendMap).map(([month, count]) => ({ month, bookings: count }));

    // --------------- Upcoming rentals ---------------
    const upcomingRentals = bookings
      .filter((b) => new Date(b.startDate) > now && b.status === "confirmed")
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);

    // --------------- Most rented car ---------------
    const carCounts = {};
    bookings.forEach((b) => {
      if (!b.rentalId) return;
      const id = b.rentalId._id.toString();
      if (!carCounts[id]) carCounts[id] = { title: b.rentalId.title, count: 0 };
      carCounts[id].count++;
    });
    const mostRentedCar = Object.values(carCounts).sort((a, b) => b.count - a.count)[0] || null;

    // --------------- Fleet performance (pure in-memory, all data loaded) ---------------
    const fleetPerformance = rentals.map((rental) => {
      const rentalBookings = bookings.filter(
        (b) => b.rentalId?._id.toString() === rental._id.toString() &&
               (b.status === "confirmed" || b.status === "completed")
      );

      let revenue = 0;
      let bookedDays = 0;
      rentalBookings.forEach((b) => {
        revenue += b.totalAmount || 0;
        bookedDays += daysBetween(b.startDate, b.endDate);
      });

      const utilization = periodDays > 0 ? Math.min(100, Math.round((bookedDays / periodDays) * 100)) : 0;

      return {
        title:     rental.title,
        rentalId:  rental._id,
        bookings:  rentalBookings.length,
        revenue,
        utilization,
        pricePerDay: rental.pricePerDay,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // --------------- Occupancy rate (fleet-wide) ---------------
    let totalBookedDays = 0;
    confirmedOrCompleted.forEach((b) => { totalBookedDays += daysBetween(b.startDate, b.endDate); });
    const totalCapacityDays = rentals.length * periodDays;
    const occupancyRate = totalCapacityDays > 0
      ? Math.min(100, Math.round((totalBookedDays / totalCapacityDays) * 100))
      : 0;

    // --------------- Demand heatmap (day of week) ---------------
    const weekdayMap = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach((b) => {
      let current = new Date(b.startDate);
      current.setHours(0, 0, 0, 0);
      const end = new Date(b.endDate);
      while (current <= end) {
        weekdayMap[current.getDay()]++;
        current.setDate(current.getDate() + 1);
      }
    });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const demandHeatmap = dayNames.map((day, i) => ({ day, demand: weekdayMap[i] }));

    res.json({
      totalBookings:   bookings.length,
      totalRevenue,
      netProfit,
      totalMaintenanceCost,
      revenueGrowth,
      avgDailyRevenue,
      monthlyRevenue,
      bookingTrends,
      bookingStatusData,
      upcomingRentals,
      mostRentedCar,
      fleetPerformance,
      occupancyRate,
      demandHeatmap,
      previousRevenue,
    });
  } catch (error) { next(error); }
};

// ---------------------------------------------------------------------------
// GET /api/analytics/owner/insights  (smart recommendations)
// ---------------------------------------------------------------------------
exports.getOwnerInsights = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const period  = req.query.period || "30d";
    const startDate = getPeriodStart(period);
    const now = new Date();
    const periodDays = Math.max(1, daysBetween(startDate, now));

    const rentals = await RentalListing.find({ rentalOwnerId: ownerId, deletedAt: null });
    const rentalIds = rentals.map((r) => r._id);
    const insights = [];

    if (!rentalIds.length) return res.json({ insights: [] });

    const bookings = await Booking.find({
      rentalId: { $in: rentalIds },
      startDate: { $gte: startDate },
      status: { $in: ["confirmed", "completed"] },
      deletedAt: null,
    });

    // Weekend vs weekday demand
    const weekdayCount = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach((b) => {
      let cur = new Date(b.startDate);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(b.endDate);
      while (cur <= end) {
        weekdayCount[cur.getDay()]++;
        cur.setDate(cur.getDate() + 1);
      }
    });
    const weekendDemand  = (weekdayCount[0] + weekdayCount[6]) / 2 || 0;
    const weekdayDemand  = (weekdayCount[1] + weekdayCount[2] + weekdayCount[3] + weekdayCount[4] + weekdayCount[5]) / 5 || 0;
    const weekendRatio   = weekdayDemand > 0 ? weekendDemand / weekdayDemand : 0;

    // Per-car analysis
    for (const rental of rentals) {
      const carBookings = bookings.filter(
        (b) => b.rentalId.toString() === rental._id.toString()
      );

      const bookedDays = carBookings.reduce((acc, b) => acc + daysBetween(b.startDate, b.endDate), 0);
      const occupancy  = Math.min(100, Math.round((bookedDays / periodDays) * 100));
      const revenue    = carBookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);

      // Insight: Zero bookings
      if (carBookings.length === 0) {
        insights.push({
          type:    "alert",
          carId:   rental._id,
          carTitle: rental.title,
          title:   `"${rental.title}" has 0 bookings this period`,
          action:  `Consider lowering the price (currently ${rental.pricePerDay} MAD/day) or adding a promotional offer.`,
          potentialRevenueGain: null,
        });
        continue;
      }

      // Insight: Low occupancy (< 25%)
      if (occupancy < 25) {
        const { suggestedPrice } = suggestPrice(rental.pricePerDay, { occupancyRate: occupancy });
        const priceDiff = rental.pricePerDay - suggestedPrice;
        insights.push({
          type:    "warning",
          carId:   rental._id,
          carTitle: rental.title,
          title:   `"${rental.title}" has only ${occupancy}% occupancy`,
          action:  `Lower price from ${rental.pricePerDay} to ${suggestedPrice} MAD/day (−${priceDiff} MAD). Estimated revenue increase: +${Math.round(priceDiff * periodDays * 0.3)} MAD if occupancy reaches 40%.`,
          potentialRevenueGain: Math.round(priceDiff * periodDays * 0.3),
        });
      }

      // Insight: Weekend surcharge opportunity
      if (weekendRatio > 1.5 && occupancy >= 30) {
        const { suggestedPrice: weekendPrice } = suggestPrice(rental.pricePerDay, { weekendDemandRatio: weekendRatio });
        if (weekendPrice > rental.pricePerDay) {
          insights.push({
            type:    "opportunity",
            carId:   rental._id,
            carTitle: rental.title,
            title:   `High weekend demand for "${rental.title}"`,
            action:  `Weekend bookings are ${Math.round(weekendRatio * 100 - 100)}% above weekday average. Add a weekend surcharge: suggest ${weekendPrice} MAD/day on weekends.`,
            potentialRevenueGain: Math.round((weekendPrice - rental.pricePerDay) * 8), // ~8 weekend days/month
          });
        }
      }

      // Insight: High performer — suggest premium pricing
      if (occupancy >= 70) {
        const { suggestedPrice: premiumPrice } = suggestPrice(rental.pricePerDay, { occupancyRate: occupancy });
        if (premiumPrice > rental.pricePerDay) {
          insights.push({
            type:    "opportunity",
            carId:   rental._id,
            carTitle: rental.title,
            title:   `"${rental.title}" is in high demand (${occupancy}% occupancy)`,
            action:  `You can raise the price to ${premiumPrice} MAD/day (+${premiumPrice - rental.pricePerDay} MAD). High demand supports a premium.`,
            potentialRevenueGain: Math.round((premiumPrice - rental.pricePerDay) * bookedDays),
          });
        }
      }

      // Insight: Maintenance due soon
      const nextMaintenance = await Maintenance.findOne({
        rentalId: rental._id,
        nextServiceDate: { $lte: new Date(Date.now() + 14 * 86400000) }, // within 14 days
        deletedAt: null,
      }).sort({ nextServiceDate: 1 });

      if (nextMaintenance) {
        const daysUntil = Math.ceil(daysBetween(now, nextMaintenance.nextServiceDate));
        insights.push({
          type:     "maintenance",
          carId:    rental._id,
          carTitle: rental.title,
          title:    `Maintenance due for "${rental.title}" in ${daysUntil} day(s)`,
          action:   `Service type: ${nextMaintenance.type}. Due: ${new Date(nextMaintenance.nextServiceDate).toLocaleDateString()}. Block the calendar to avoid booking conflicts.`,
          potentialRevenueGain: null,
        });
      }
    }

    // Sort: alerts first, then warnings, then opportunities
    const order = { alert: 0, maintenance: 1, warning: 2, opportunity: 3 };
    insights.sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));

    res.json({ insights });
  } catch (error) { next(error); }
};

// ---------------------------------------------------------------------------
// Helper — empty analytics response when owner has no rentals
// ---------------------------------------------------------------------------
function emptyAnalytics() {
  return {
    totalBookings: 0,
    totalRevenue: 0,
    netProfit: 0,
    totalMaintenanceCost: 0,
    revenueGrowth: 0,
    avgDailyRevenue: 0,
    monthlyRevenue: [],
    bookingTrends: [],
    bookingStatusData: [],
    upcomingRentals: [],
    mostRentedCar: null,
    fleetPerformance: [],
    occupancyRate: 0,
    demandHeatmap: [],
    previousRevenue: 0,
  };
}
