import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home2.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MySales from "./pages/MySales";
import Cars from "./pages/Cars";
import Rentals from "./pages/Rentals";
import Navbar from "./components/Navbar";
import CarDetails from "./pages/CarDetails";
import NewSale from "./pages/NewSale";
import EditSale from "./pages/EditSale";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSales from "./pages/admin/AdminSales";
import AdminRentals from "./pages/admin/AdminRentals";
import AdminUsers from "./pages/admin/AdminUsers";
import SellerProfile from "./pages/SellerProfile";
import RentalDetails from "./pages/RentalDetails";
import MyRentals from "./pages/MyRentals";
import MyBookings from "./pages/MyBookings";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerBookingsList from "./pages/OwnerBookingsList";
import AddRental from "./pages/AddRental";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import MyFleet from "./pages/MyFleet";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/rentals/:id" element={<RentalDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller/:id" element={<SellerProfile />} />

        {/* Authenticated – any role */}
        <Route path="/messages" element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Messages /></ProtectedRoute>} />
        <Route path="/profile"  element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Profile /></ProtectedRoute>} />

        {/* Notifications accessible to all logged-in roles */}
        <Route path="/notifications" element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Notifications /></ProtectedRoute>} />

        {/* Customer */}
        <Route path="/my-bookings" element={<ProtectedRoute roles={["customer"]}><MyBookings /></ProtectedRoute>} />

        {/* Rental owner */}
        <Route path="/my-fleet"        element={<ProtectedRoute roles={["rental_owner"]}><MyFleet /></ProtectedRoute>} />
        <Route path="/my-rentals"     element={<ProtectedRoute roles={["rental_owner"]}><MyRentals /></ProtectedRoute>} />
        <Route path="/owner-bookings"       element={<ProtectedRoute roles={["rental_owner"]}><OwnerBookings /></ProtectedRoute>} />
        <Route path="/owner/bookings-list"  element={<ProtectedRoute roles={["rental_owner"]}><OwnerBookingsList /></ProtectedRoute>} />
        <Route path="/add-rental"     element={<ProtectedRoute roles={["rental_owner"]}><AddRental /></ProtectedRoute>} />
        <Route path="/owner/analytics" element={<ProtectedRoute roles={["rental_owner"]}><OwnerAnalytics /></ProtectedRoute>} />

        {/* Seller */}
        <Route path="/dashboard"      element={<ProtectedRoute roles={["seller","admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/my-sales"       element={<ProtectedRoute roles={["seller","admin"]}><MySales /></ProtectedRoute>} />
        <Route path="/my-sales/new"   element={<ProtectedRoute roles={["seller","admin"]}><NewSale /></ProtectedRoute>} />
        <Route path="/my-sales/edit/:id" element={<ProtectedRoute roles={["seller","admin"]}><EditSale /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"         element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sales"   element={<ProtectedRoute roles={["admin"]}><AdminSales /></ProtectedRoute>} />
        <Route path="/admin/rentals" element={<ProtectedRoute roles={["admin"]}><AdminRentals /></ProtectedRoute>} />
        <Route path="/admin/users"   element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
