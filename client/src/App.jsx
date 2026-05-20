import { Routes, Route, useLocation } from "react-router-dom";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import MaintenancePage from "./pages/MaintenancePage";
import KycPage from "./pages/KycPage";
import ReferralPage from "./pages/ReferralPage";
import EmergencyPage from "./pages/EmergencyPage";
import CreditCheckPage from "./pages/CreditCheckPage";
import BuyingGuidePage from "./pages/BuyingGuidePage";
import FuelTrackerPage from "./pages/FuelTrackerPage";
import AccidentAssistantPage from "./pages/AccidentAssistantPage";
import StaffManagementPage from "./pages/StaffManagementPage";

/* Paths where Navbar should not render (they have their own full-page nav) */
const NO_NAV_PREFIXES = [
  "/admin",
  "/dashboard",
  "/my-sales",
];

export default function App() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const hasSidebar = NO_NAV_PREFIXES.some((p) => pathname.startsWith(p));
  const showNav = !isHome && !hasSidebar;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#05060f] dark:text-gray-100 transition-colors duration-300">
      {showNav && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/rentals" element={<Rentals />} />
        <Route path="/rentals/:id" element={<RentalDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
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
        <Route path="/owner/analytics"     element={<ProtectedRoute roles={["rental_owner"]}><OwnerAnalytics /></ProtectedRoute>} />
        <Route path="/owner/maintenance"   element={<ProtectedRoute roles={["rental_owner"]}><MaintenancePage /></ProtectedRoute>} />

        {/* Seller */}
        <Route path="/dashboard"      element={<ProtectedRoute roles={["car_owner","admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/my-sales"       element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><MySales /></ProtectedRoute>} />
        <Route path="/my-sales/new"   element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><NewSale /></ProtectedRoute>} />
        <Route path="/my-sales/edit/:id" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><EditSale /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"         element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sales"   element={<ProtectedRoute roles={["admin"]}><AdminSales /></ProtectedRoute>} />
        <Route path="/admin/rentals" element={<ProtectedRoute roles={["admin"]}><AdminRentals /></ProtectedRoute>} />
        <Route path="/admin/users"   element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />

        {/* New feature pages */}
        <Route path="/kyc"              element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><KycPage /></ProtectedRoute>} />
        <Route path="/referral"         element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><ReferralPage /></ProtectedRoute>} />
        <Route path="/emergency"        element={<EmergencyPage />} />
        <Route path="/credit-check"     element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><CreditCheckPage /></ProtectedRoute>} />
        <Route path="/buying-guide"     element={<BuyingGuidePage />} />
        <Route path="/fuel-tracker"     element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><FuelTrackerPage /></ProtectedRoute>} />
        <Route path="/accident"         element={<AccidentAssistantPage />} />
        <Route path="/owner/staff"      element={<ProtectedRoute roles={["rental_owner"]}><StaffManagementPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
