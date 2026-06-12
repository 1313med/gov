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
import MechanicPricesPage from "./pages/MechanicPricesPage";
import CarWorthPage from "./pages/CarWorthPage";
import TravelReadyPage from "./pages/TravelReadyPage";
import CommunityIntelPage from "./pages/CommunityIntelPage";
import AffordCarPage from "./pages/AffordCarPage";
import StaffManagementPage from "./pages/StaffManagementPage";
import SavedPage from "./pages/SavedPage";
import EstimatePage from "./pages/EstimatePage";
import PriceAlertsPage from "./pages/PriceAlertsPage";
import GaragePage from "./pages/GaragePage";
import AddCarPage from "./pages/AddCarPage";
import EditGarageItemPage from "./pages/EditGarageItemPage";
import OwnerListingViewsPage from "./pages/OwnerListingViewsPage";
import VerifyCinPage from "./pages/VerifyCinPage";
import ProfileDocumentsPage from "./pages/ProfileDocumentsPage";
import ConditionChecklistPage from "./pages/ConditionChecklistPage";
import DocScannerPage from "./pages/DocScannerPage";
import CityLandingPage from "./pages/CityLandingPage";
import SellCarPage from "./pages/SellCarPage";
import SeoHead from "./components/SeoHead";
import { parseSeoPath } from "./seo/seoPaths";

const NO_NAV_PREFIXES = [
  "/admin",
  "/dashboard",
  "/my-sales",
  "/my-fleet",
  "/my-rentals",
  "/owner",
  "/add-rental",
  "/owner-bookings",
];

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
];

const LANG_PREFIXES = ["", "en", "ar"];

function localizedPath(prefix, path) {
  if (!prefix) return path;
  return path === "/" ? `/${prefix}` : `/${prefix}${path}`;
}

function publicRoutes(defs) {
  return LANG_PREFIXES.flatMap((prefix) =>
    defs.map(({ path, element }) => (
      <Route key={`${prefix || "fr"}${path}`} path={localizedPath(prefix, path)} element={element} />
    ))
  );
}

export default function App() {
  const { pathname } = useLocation();
  const { basePath } = parseSeoPath(pathname);
  const isHome = basePath === "/";
  const hasSidebar = NO_NAV_PREFIXES.some((p) => basePath.startsWith(p));
  const isAuth =
    AUTH_PATHS.includes(basePath) ||
    basePath.startsWith("/reset-password") ||
    basePath.startsWith("/verify-email");
  const showNav = !isHome && !hasSidebar && !isAuth;

  const publicPages = [
    { path: "/", element: <Home /> },
    { path: "/cars", element: <Cars /> },
    { path: "/cars/:id", element: <CarDetails /> },
    { path: "/rentals", element: <Rentals /> },
    { path: "/rentals/:id", element: <RentalDetails /> },
    { path: "/buying-guide", element: <BuyingGuidePage /> },
    { path: "/mechanic-prices", element: <MechanicPricesPage /> },
    { path: "/community", element: <CommunityIntelPage /> },
    { path: "/afford-car", element: <AffordCarPage /> },
    { path: "/emergency", element: <EmergencyPage /> },
    { path: "/vendre-ma-voiture", element: <SellCarPage /> },
  ];

  const cityRoutes = LANG_PREFIXES.flatMap((prefix) => [
    <Route
      key={`${prefix || "fr"}-rental-city`}
      path={localizedPath(prefix, "/location-voiture/:citySlug")}
      element={<CityLandingPage mode="rental" />}
    />,
    <Route
      key={`${prefix || "fr"}-sale-city`}
      path={localizedPath(prefix, "/location-voiture-occasion/:citySlug")}
      element={<CityLandingPage mode="sale" />}
    />,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#05060f] dark:text-gray-100 transition-colors duration-300">
      <SeoHead />
      {showNav && <Navbar />}

      <Routes>
        {publicRoutes(publicPages)}

        {cityRoutes}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/seller/:id" element={<SellerProfile />} />

        <Route path="/messages" element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Messages /></ProtectedRoute>} />
        <Route path="/profile"  element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={["customer","seller","rental_owner","admin"]}><Notifications /></ProtectedRoute>} />

        <Route path="/my-bookings" element={<ProtectedRoute roles={["customer"]}><MyBookings /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><SavedPage /></ProtectedRoute>} />
        <Route path="/estimate" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><EstimatePage /></ProtectedRoute>} />
        <Route path="/price-alerts" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><PriceAlertsPage /></ProtectedRoute>} />
        <Route path="/verify-cin" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><VerifyCinPage /></ProtectedRoute>} />
        <Route path="/profile-documents" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><ProfileDocumentsPage /></ProtectedRoute>} />

        <Route path="/my-fleet"        element={<ProtectedRoute roles={["rental_owner"]}><MyFleet /></ProtectedRoute>} />
        <Route path="/my-rentals"     element={<ProtectedRoute roles={["rental_owner"]}><MyRentals /></ProtectedRoute>} />
        <Route path="/owner-bookings"       element={<ProtectedRoute roles={["rental_owner"]}><OwnerBookings /></ProtectedRoute>} />
        <Route path="/owner/bookings-list"  element={<ProtectedRoute roles={["rental_owner"]}><OwnerBookingsList /></ProtectedRoute>} />
        <Route path="/add-rental"     element={<ProtectedRoute roles={["rental_owner"]}><AddRental /></ProtectedRoute>} />
        <Route path="/owner/analytics"     element={<ProtectedRoute roles={["rental_owner"]}><OwnerAnalytics /></ProtectedRoute>} />
        <Route path="/owner/maintenance"   element={<ProtectedRoute roles={["rental_owner"]}><MaintenancePage /></ProtectedRoute>} />
        <Route path="/owner/listing-views" element={<ProtectedRoute roles={["rental_owner"]}><OwnerListingViewsPage /></ProtectedRoute>} />
        <Route path="/owner/condition-checklist/:bookingId" element={<ProtectedRoute roles={["rental_owner"]}><ConditionChecklistPage /></ProtectedRoute>} />

        <Route path="/garage" element={<ProtectedRoute roles={["car_owner","admin"]}><GaragePage /></ProtectedRoute>} />
        <Route path="/garage/add" element={<ProtectedRoute roles={["car_owner","admin"]}><AddCarPage /></ProtectedRoute>} />
        <Route path="/garage/edit/:field" element={<ProtectedRoute roles={["car_owner","admin"]}><EditGarageItemPage /></ProtectedRoute>} />
        <Route path="/garage/documents" element={<ProtectedRoute roles={["car_owner","admin"]}><DocScannerPage /></ProtectedRoute>} />

        <Route path="/dashboard"      element={<ProtectedRoute roles={["car_owner","admin"]}><Dashboard /></ProtectedRoute>} />
        <Route path="/my-sales"       element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><MySales /></ProtectedRoute>} />
        <Route path="/my-sales/new"   element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><NewSale /></ProtectedRoute>} />
        <Route path="/my-sales/edit/:id" element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><EditSale /></ProtectedRoute>} />

        <Route path="/admin"         element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/sales"   element={<ProtectedRoute roles={["admin"]}><AdminSales /></ProtectedRoute>} />
        <Route path="/admin/rentals" element={<ProtectedRoute roles={["admin"]}><AdminRentals /></ProtectedRoute>} />
        <Route path="/admin/users"   element={<ProtectedRoute roles={["admin"]}><AdminUsers /></ProtectedRoute>} />

        <Route path="/kyc"              element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><KycPage /></ProtectedRoute>} />
        <Route path="/referral"         element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><ReferralPage /></ProtectedRoute>} />
        <Route path="/credit-check"     element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><CreditCheckPage /></ProtectedRoute>} />
        <Route path="/fuel-tracker"     element={<ProtectedRoute roles={["customer","car_owner","rental_owner","admin"]}><FuelTrackerPage /></ProtectedRoute>} />
        <Route path="/car-worth"        element={<ProtectedRoute roles={["car_owner","customer","rental_owner","admin"]}><CarWorthPage /></ProtectedRoute>} />
        <Route path="/travel-ready"     element={<ProtectedRoute roles={["car_owner","admin"]}><TravelReadyPage /></ProtectedRoute>} />
        <Route path="/accident"         element={<AccidentAssistantPage />} />
        <Route path="/owner/staff"      element={<ProtectedRoute roles={["rental_owner"]}><StaffManagementPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
