const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");

exports.getOwnerAnalytics = async (req, res, next) => {
  try {

    const ownerId = req.user._id;

    /*
    |--------------------------------------------------------------------------
    | Period filter
    |--------------------------------------------------------------------------
    */

    const period = req.query.period || "30d";

    let startDate = null;
    const now = new Date();

    if (period === "today") {
      startDate = new Date(now.setHours(0,0,0,0));
    }

    if (period === "7d") {
      startDate = new Date(Date.now() - 7*24*60*60*1000);
    }

    if (period === "30d") {
      startDate = new Date(Date.now() - 30*24*60*60*1000);
    }

    if (period === "3m") {
      startDate = new Date(Date.now() - 90*24*60*60*1000);
    }

    if (period === "1y") {
      startDate = new Date(Date.now() - 365*24*60*60*1000);
    }

    /*
    |--------------------------------------------------------------------------
    | Owner rentals
    |--------------------------------------------------------------------------
    */

    const rentals = await RentalListing.find({
      rentalOwnerId: ownerId
    });

    const rentalIds = rentals.map(r => r._id);

    /*
    |--------------------------------------------------------------------------
    | Bookings (ALL statuses)
    |--------------------------------------------------------------------------
    */

    const bookingQuery = {
      rentalId: { $in: rentalIds }
    };

    if (startDate) {
      bookingQuery.startDate = { $gte: startDate };
    }

    const bookings = await Booking.find(bookingQuery).populate("rentalId");

    /*
    |--------------------------------------------------------------------------
    | Booking status breakdown
    |--------------------------------------------------------------------------
    */

    const bookingStatus = {
      confirmed: 0,
      pending: 0,
      rejected: 0,
      cancelled: 0
    };

    bookings.forEach(b => {
      if (bookingStatus[b.status] !== undefined) {
        bookingStatus[b.status]++;
      }
    });

    const bookingStatusData = [
      { name: "Confirmed", value: bookingStatus.confirmed },
      { name: "Pending", value: bookingStatus.pending },
      { name: "Rejected", value: bookingStatus.rejected },
      { name: "Cancelled", value: bookingStatus.cancelled }
    ];

    /*
    |--------------------------------------------------------------------------
    | Total bookings
    |--------------------------------------------------------------------------
    */

    const totalBookings = bookings.length;

    /*
    |--------------------------------------------------------------------------
    | Monthly revenue
    |--------------------------------------------------------------------------
    */

    const monthlyRevenueMap = {};

    bookings.forEach(b => {

      if (!b.rentalId) return;

      const month = new Date(b.startDate).toLocaleString("default", {
        month: "short"
      });

      const days =
        (new Date(b.endDate) - new Date(b.startDate)) /
        (1000 * 60 * 60 * 24);

      const revenue = days * b.rentalId.pricePerDay;

      if (!monthlyRevenueMap[month]) monthlyRevenueMap[month] = 0;

      monthlyRevenueMap[month] += revenue;
    });

    const monthlyRevenue = Object.keys(monthlyRevenueMap).map(month => ({
      month,
      revenue: monthlyRevenueMap[month]
    }));

    /*
    |--------------------------------------------------------------------------
    | Booking trends
    |--------------------------------------------------------------------------
    */

    const trendMap = {};

    bookings.forEach(b => {

      const month = new Date(b.startDate).toLocaleString("default", {
        month: "short"
      });

      if (!trendMap[month]) trendMap[month] = 0;

      trendMap[month]++;
    });

    const bookingTrends = Object.keys(trendMap).map(month => ({
      month,
      bookings: trendMap[month]
    }));

    /*
    |--------------------------------------------------------------------------
    | Upcoming rentals
    |--------------------------------------------------------------------------
    */

    const today = new Date();

    const upcomingRentals = bookings
      .filter(b => new Date(b.startDate) > today)
      .sort((a,b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0,5);

    /*
    |--------------------------------------------------------------------------
    | Most rented car
    |--------------------------------------------------------------------------
    */

    const carCounts = {};

    bookings.forEach(b => {

      if (!b.rentalId) return;

      const carId = b.rentalId._id.toString();

      if (!carCounts[carId]) {
        carCounts[carId] = {
          title: b.rentalId.title,
          count: 0
        };
      }

      carCounts[carId].count++;
    });

    let mostRentedCar = null;

    Object.values(carCounts).forEach(car => {
      if (!mostRentedCar || car.count > mostRentedCar.count) {
        mostRentedCar = car;
      }
    });

    /*
    |--------------------------------------------------------------------------
    | Fleet performance
    |--------------------------------------------------------------------------
    */

    const fleetPerformance = [];

    for (const rental of rentals) {

      const rentalBookings = bookings.filter(
        b => b.rentalId?._id.toString() === rental._id.toString()
      );

      let revenue = 0;
      let bookedDays = 0;

      rentalBookings.forEach(b => {

        const days =
          (new Date(b.endDate) - new Date(b.startDate)) /
          (1000 * 60 * 60 * 24);

        bookedDays += days;
        revenue += days * rental.pricePerDay;

      });

      let availableDays = 0;

      rental.availability.forEach(range => {

        const days =
          (new Date(range.endDate) - new Date(range.startDate)) /
          (1000 * 60 * 60 * 24);

        availableDays += days;

      });

      const utilization =
        availableDays > 0
          ? Math.round((bookedDays / availableDays) * 100)
          : 0;

      fleetPerformance.push({
        title: rental.title,
        bookings: rentalBookings.length,
        revenue,
        utilization
      });
    }

    fleetPerformance.sort((a,b) => b.revenue - a.revenue);

    /*
    |--------------------------------------------------------------------------
    | Occupancy rate
    |--------------------------------------------------------------------------
    */

    let totalBookedDays = 0;
    let totalAvailableDays = 0;

    bookings.forEach(b => {

      const days =
        (new Date(b.endDate) - new Date(b.startDate)) /
        (1000 * 60 * 60 * 24);

      totalBookedDays += days;
    });

    rentals.forEach(r => {

      r.availability.forEach(range => {

        const days =
          (new Date(range.endDate) - new Date(range.startDate)) /
          (1000 * 60 * 60 * 24);

        totalAvailableDays += days;

      });

    });

    const occupancyRate =
      totalAvailableDays > 0
        ? Math.round((totalBookedDays / totalAvailableDays) * 100)
        : 0;

    /*
    |--------------------------------------------------------------------------
    | Demand heatmap
    |--------------------------------------------------------------------------
    */

    const weekdayMap = [0,0,0,0,0,0,0];

    bookings.forEach(b => {

      let current = new Date(b.startDate);
      let end = new Date(b.endDate);

      current.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      while (current <= end) {

        const dayIndex = current.getDay();

        weekdayMap[dayIndex]++;

        current.setDate(current.getDate() + 1);
      }

    });

    const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    const demandHeatmap = dayNames.map((day,i) => ({
      day,
      demand: weekdayMap[i]
    }));

    /*
    |--------------------------------------------------------------------------
    | Revenue totals
    |--------------------------------------------------------------------------
    */

    let totalRevenue = 0;

    bookings.forEach(b => {

      if (!b.rentalId) return;

      const days =
        (new Date(b.endDate) - new Date(b.startDate)) /
        (1000 * 60 * 60 * 24);

      totalRevenue += days * b.rentalId.pricePerDay;

    });

    /*
    |--------------------------------------------------------------------------
    | Previous period revenue
    |--------------------------------------------------------------------------
    */

    let previousStart = null;
    let previousEnd = startDate;

    if (startDate) {

      const diff = Date.now() - startDate.getTime();

      previousStart = new Date(startDate.getTime() - diff);

    }

    let previousBookings = [];

    if (previousStart) {

      previousBookings = await Booking.find({
        rentalId: { $in: rentalIds },
        startDate: {
          $gte: previousStart,
          $lt: previousEnd
        }
      }).populate("rentalId");

    }

    let previousRevenue = 0;

    previousBookings.forEach(b => {

      if (!b.rentalId) return;

      const days =
        (new Date(b.endDate) - new Date(b.startDate)) /
        (1000 * 60 * 60 * 24);

      previousRevenue += days * b.rentalId.pricePerDay;

    });

    /*
    |--------------------------------------------------------------------------
    | Revenue growth
    |--------------------------------------------------------------------------
    */

    let revenueGrowth = 0;

    if (previousRevenue > 0) {

      revenueGrowth =
        ((totalRevenue - previousRevenue) / previousRevenue) * 100;

      revenueGrowth = Math.round(revenueGrowth);

    }

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    res.json({
      totalBookings,
      totalRevenue,
      revenueGrowth,
      monthlyRevenue,
      bookingTrends,
      bookingStatusData,
      upcomingRentals,
      mostRentedCar,
      fleetPerformance,
      occupancyRate,
      demandHeatmap
    });

  } catch (error) {
    next(error);
  }
};
