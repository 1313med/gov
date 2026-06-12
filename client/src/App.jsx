import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home2.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import SeoHead from "./components/SeoHead";
import { parseSeoPath } from "./seo/seoPaths";

const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const MySales = lazy(() => import("./pages/MySales"));
const Cars = lazy(() => import("./pages/Cars"));
const Rentals = lazy(() => import("./pages/Rentals"));
const CarDetails = lazy(() => import("./pages/CarDetails"));
const NewSale = lazy(() => import("./pages/NewSale"));
const EditSale = lazy(() => import("./pages/EditSale"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSales = lazy(() => import("./pages/admin/AdminSales"));
const AdminRentals = lazy(() => import("./pages/admin/AdminRentals"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const SellerProfile = lazy(() => import("./pages/SellerProfile"));
const RentalDetails = lazy(() => import("./pages/RentalDetails"));
const MyRentals = lazy(() => import("./pages/MyRentals"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const OwnerBookings = lazy(() => import("./pages/OwnerBookings"));
const OwnerBookingsList = lazy(() => import("./pages/OwnerBookingsList"));
const AddRental = lazy(() => import("./pages/AddRental"));
const OwnerAnalytics = lazy(() => import("./pages/OwnerAnalytics"));
const MyFleet = lazy(() => import("./pages/MyFleet"));
const Messages = lazy(() => import("./pages/Messages"));
const Profile = lazy(() => import("./pages/Profile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const MaintenancePage = lazy(() => import("./pages/MaintenancePage"));
const KycPage = lazy(() => import("./pages/KycPage"));
const ReferralPage = lazy(() => import("./pages/ReferralPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const CreditCheckPage = lazy(() => import("./pages/CreditCheckPage"));
const BuyingGuidePage = lazy(() => import("./pages/BuyingGuidePage"));
const FuelTrackerPage = lazy(() => import("./pages/FuelTrackerPage"));
const AccidentAssistantPage = lazy(() => import("./pages/AccidentAssistantPage"));
const MechanicPricesPage = lazy(() => import("./pages/MechanicPricesPage"));
const CarWorthPage = lazy(() => import("./pages/CarWorthPage"));
const TravelReadyPage = lazy(() => import("./pages/TravelReadyPage"));
const CommunityIntelPage = lazy(() => import("./pages/CommunityIntelPage"));
const AffordCarPage = lazy(() => import("./pages/AffordCarPage"));
const StaffManagementPage = lazy(() => import("./pages/StaffManagementPage"));
const SavedPage = lazy(() => import("./pages/SavedPage"));
const EstimatePage = lazy(() => import("./pages/EstimatePage"));
const PriceAlertsPage = lazy(() => import("./pages/PriceAlertsPage"));
const GaragePage = lazy(() => import("./pages/GaragePage"));
const AddCarPage = lazy(() => import("./pages/AddCarPage"));
const EditGarageItemPage = lazy(() => import("./pages/EditGarageItemPage"));
const OwnerListingViewsPage = lazy(() => import("./pages/OwnerListingViewsPage"));
const VerifyCinPage = lazy(() => import("./pages/VerifyCinPage"));
const ProfileDocumentsPage = lazy(() => import("./pages/ProfileDocumentsPage"));
const ConditionChecklistPage = lazy(() => import("./pages/ConditionChecklistPage"));
const DocScannerPage = lazy(() => import("./pages/DocScannerPage"));
const CityLandingPage = lazy(() => import("./pages/CityLandingPage"));
const SellCarPage = lazy(() => import("./pages/SellCarPage"));

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

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
}
