import { useEffect, useState } from "react";
import { getOwnerAnalytics } from "../api/analytics";
import OwnerBookingCalendar from "../components/analytics/OwnerBookingCalendar";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from "recharts";

import {
  Car,
  Calendar,
  TrendingUp,
  DollarSign
} from "lucide-react";

export default function OwnerAnalytics() {

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchAnalytics = async () => {
      try {

        const data = await getOwnerAnalytics();
        setAnalytics(data);

      } catch (error) {
        console.error("Analytics error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-10 text-center text-gray-500">
        No analytics data
      </div>
    );
  }

  const occupancyChart = [
    { name: "occupancy", value: analytics.occupancyRate }
  ];

  return (

    <div className="p-8 min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 space-y-10">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">

          <div>
            <p className="text-gray-500 text-sm">
              Total Bookings
            </p>

            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {analytics.totalBookings}
            </p>
          </div>

          <div className="bg-indigo-100 p-3 rounded-xl">
            <Calendar className="text-indigo-600"/>
          </div>

        </div>


        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">

          <div>
            <p className="text-gray-500 text-sm">
              Occupancy Rate
            </p>

            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {analytics.occupancyRate}%
            </p>
          </div>

          <div className="bg-emerald-100 p-3 rounded-xl">
            <TrendingUp className="text-emerald-600"/>
          </div>

        </div>


        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">

          <div>
            <p className="text-gray-500 text-sm">
              Most Rented Car
            </p>

            <p className="text-lg font-semibold mt-2">
              {analytics.mostRentedCar?.title || "N/A"}
            </p>
          </div>

          <div className="bg-sky-100 p-3 rounded-xl">
            <Car className="text-sky-600"/>
          </div>

        </div>


        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">

          <div>
            <p className="text-gray-500 text-sm">
              Upcoming Rentals
            </p>

            <p className="text-3xl font-bold text-blue-600 mt-2">
              {analytics.upcomingRentals?.length || 0}
            </p>
          </div>

          <div className="bg-blue-100 p-3 rounded-xl">
            <DollarSign className="text-blue-600"/>
          </div>

        </div>

      </div>
      {/* CALENDAR */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

        <h2 className="text-lg font-semibold mb-4">
          Booking Calendar
        </h2>

        <OwnerBookingCalendar/>

      </div>


      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* REVENUE */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 col-span-2">

          <h2 className="text-lg font-semibold mb-4">
            Monthly Revenue
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <AreaChart data={analytics.monthlyRevenue || []}>

              <defs>

                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>

                </linearGradient>

              </defs>

              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3"/>
              <XAxis dataKey="month"/>
              <YAxis/>
              <Tooltip/>

              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#revenueGradient)"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>


        {/* OCCUPANCY RADIAL */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center justify-center">

          <h2 className="text-lg font-semibold mb-4">
            Occupancy
          </h2>

          <RadialBarChart
            width={250}
            height={250}
            innerRadius="70%"
            outerRadius="100%"
            data={occupancyChart}
            startAngle={90}
            endAngle={-270}
          >

            <RadialBar
              minAngle={15}
              dataKey="value"
              fill="#10b981"
              cornerRadius={10}
            />

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-3xl font-bold"
            >
              {analytics.occupancyRate}%
            </text>

          </RadialBarChart>

        </div>

      </div>


      {/* BOOKING TREND */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

        <h2 className="text-lg font-semibold mb-4">
          Booking Trends
        </h2>

        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={analytics.bookingTrends || []}>

            <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3"/>
            <XAxis dataKey="month"/>
            <YAxis/>
            <Tooltip/>

            <Line
              type="monotone"
              dataKey="bookings"
              stroke="#22c55e"
              strokeWidth={3}
              dot={{ r:4 }}
              activeDot={{ r:7 }}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      


      {/* DATA SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* UPCOMING RENTALS */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

          <h2 className="text-lg font-semibold mb-4">
            Upcoming Rentals
          </h2>

          <div className="space-y-3">

            {analytics.upcomingRentals?.map((booking)=>(
              <div
                key={booking._id}
                className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
              >

                <p className="font-semibold">
                  {booking.rentalId?.title}
                </p>

                <p className="text-sm text-gray-500">

                  {new Date(booking.startDate).toLocaleDateString()}
                  {" - "}
                  {new Date(booking.endDate).toLocaleDateString()}

                </p>

              </div>
            ))}

          </div>

        </div>


        {/* FLEET PERFORMANCE */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

          <h2 className="text-lg font-semibold mb-4">
            Fleet Performance
          </h2>

          <table className="w-full">

            <thead className="text-sm text-gray-500 border-b">
              <tr>
                <th className="text-left py-2">Car</th>
                <th className="text-left py-2">Revenue</th>
                <th className="text-left py-2">Bookings</th>
                <th className="text-left py-2">Utilization</th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {analytics.fleetPerformance?.map((car,i)=>(
                <tr key={i} className="hover:bg-gray-50">

                  <td className="py-3 font-semibold">
                    {car.title}
                  </td>

                  <td className="py-3 text-indigo-600 font-medium">
                    ${car.revenue}
                  </td>

                  <td className="py-3">
                    {car.bookings}
                  </td>

                  <td className="py-3">
                    {car.utilization}%
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>


  {/* HEATMAP */}
<div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">

  <h2 className="text-lg font-semibold mb-6">
    Demand Heatmap
  </h2>

  <div className="grid grid-cols-7 gap-3">

    {analytics.demandHeatmap?.map((d, i) => {
      let color = "bg-gray-200";

      if (d.demand >= 5) color = "bg-emerald-500";
      else if (d.demand >= 3) color = "bg-emerald-400";
      else if (d.demand >= 1) color = "bg-emerald-300";

      return (
        <div
          key={i}
          className={`${color} text-white rounded-xl h-14 flex items-center justify-center font-semibold`}
        >
          {d.day} {d.demand}
        </div>
      );
    })}

  </div>

</div>
</div>
  );
}