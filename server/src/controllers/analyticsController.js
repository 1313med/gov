const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");

exports.getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

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
    | Confirmed bookings
    |--------------------------------------------------------------------------
    */

    const bookings = await Booking.find({
      rentalId: { $in: rentalIds },
      status: { $in: ["confirmed", "pending"] }
    }).populate("rentalId");

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
        b => b.rentalId._id.toString() === rental._id.toString()
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
| Demand heatmap (weekday demand)
|--------------------------------------------------------------------------
*/

const weekdayMap = [0,0,0,0,0,0,0]; // Sun → Sat

bookings.forEach(b => {

  let current = new Date(b.startDate);
  let end = new Date(b.endDate);

  // remove time portion
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
    | Response
    |--------------------------------------------------------------------------
    */

    res.json({
      totalBookings,
      monthlyRevenue,
      bookingTrends,
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