import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home2.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import HomeNav from "./components/layout/HomeNav";
import HomeSiteFooter from "./components/layout/HomeSiteFooter";
import SeoHead from "./components/SeoHead";
import { parseSeoPath } from "./seo/seoPaths";
import { useTheme } from "./context/ThemeContext";
import "./styles/home-shell.css";

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
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const MarketplaceHubPage = lazy(() => import("./pages/seo/MarketplaceHubPage"));
const ProgrammaticFacetPage = lazy(() => import("./pages/seo/ProgrammaticFacetPage"));
const BrandHubPage = lazy(() => import("./pages/seo/BrandHubPage"));
const AirportLandingPage = lazy(() => import("./pages/seo/AirportLandingPage"));
const ProHubPage = lazy(() => import("./pages/pro/ProPage.jsx").then((m) => ({ default: m.ProHubPage })));
const ProPage = lazy(() => import("./pages/pro/ProPage.jsx"));
const BlogHubPage = lazy(() => import("./pages/blog/BlogHubPage"));
const BlogArticlePage = lazy(() => import("./pages/blog/BlogArticlePage"));
const AboutPage = lazy(() => import("./pages/trust/TrustPages.jsx").then((m) => ({ default: m.AboutPage })));
const TeamPage = lazy(() => import("./pages/trust/TrustPages.jsx").then((m) => ({ default: m.TeamPage })));
const ReviewsPage = lazy(() => import("./pages/trust/TrustPages.jsx").then((m) => ({ default: m.ReviewsPage })));
const PartnersPage = lazy(() => import("./pages/trust/TrustPages.jsx").then((m) => ({ default: m.PartnersPage })));
const CaseStudiesPage = lazy(() => import("./pages/trust/TrustPages.jsx").then((m) => ({ default: m.CaseStudiesPage })));
const SaleListingRoute = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.SaleListingRoute })));
const RentalListingRoute = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.RentalListingRoute })));
const LegacySaleRedirect = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.LegacySaleRedirect })));
const LegacyRentalRedirect = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.LegacyRentalRedirect })));
const LegacyCitySaleRedirect = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.LegacyCitySaleRedirect })));
const LegacyCarsHubRedirect = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.LegacyCarsHubRedirect })));
const LegacyRentalsHubRedirect = lazy(() => import("./pages/seo/ListingRoutes.jsx").then((m) => ({ default: m.LegacyRentalsHubRedirect })));
const BuyerAssistantPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.BuyerAssistantPage })));
const TcoCalculatorPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.TcoCalculatorPage })));
const ComparisonsHubPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.ComparisonsHubPage })));
const ComparisonDetailPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.ComparisonDetailPage })));
const ContentClusterHubPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.ContentClusterHubPage })));
const ContentClusterTopicPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.ContentClusterTopicPage })));
const QuestionsHubPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.QuestionsHubPage })));
const QuestionDetailPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.QuestionDetailPage })));
const OwnershipHubPage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.OwnershipHubPage })));
const OwnershipTimelinePage = lazy(() => import("./pages/seo/EcosystemPages").then((m) => ({ default: m.OwnershipTimelinePage })));

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
  const { dark } = useTheme();
  const isHome = basePath === "/";
  const hasSidebar = NO_NAV_PREFIXES.some((p) => basePath.startsWith(p));
  const showShell = !hasSidebar;
  const shellClass = `hx-shell${dark ? " dark" : ""}`;

  const publicPages = [
    { path: "/", element: <Home /> },
    { path: "/location-voiture", element: <MarketplaceHubPage intent="rental" /> },
    { path: "/voiture-occasion", element: <MarketplaceHubPage intent="sale" /> },
    { path: "/cars", element: <Cars /> },
    { path: "/cars/:id", element: <LegacySaleRedirect /> },
    { path: "/acheter/:listingSlug", element: <SaleListingRoute /> },
    { path: "/rentals", element: <Rentals /> },
    { path: "/rentals/:id", element: <LegacyRentalRedirect /> },
    { path: "/louer/:listingSlug", element: <RentalListingRoute /> },
    { path: "/marque/:brandSlug", element: <BrandHubPage /> },
    { path: "/marque/:brandSlug/:modelSlug", element: <BrandHubPage /> },
    { path: "/pro", element: <ProHubPage /> },
    { path: "/pro/:pageSlug", element: <ProPage /> },
    { path: "/blog", element: <BlogHubPage /> },
    { path: "/blog/:clusterSlug/:articleSlug", element: <BlogArticlePage /> },
    { path: "/a-propos", element: <AboutPage /> },
    { path: "/equipe", element: <TeamPage /> },
    { path: "/avis", element: <ReviewsPage /> },
    { path: "/partenaires", element: <PartnersPage /> },
    { path: "/etudes-de-cas", element: <CaseStudiesPage /> },
    { path: "/buying-guide", element: <BuyingGuidePage /> },
    { path: "/mechanic-prices", element: <MechanicPricesPage /> },
    { path: "/community", element: <CommunityIntelPage /> },
    { path: "/afford-car", element: <AffordCarPage /> },
    { path: "/emergency", element: <EmergencyPage /> },
    { path: "/vendre-ma-voiture", element: <SellCarPage /> },
    { path: "/conditions-utilisation", element: <TermsPage /> },
    { path: "/politique-confidentialite", element: <PrivacyPage /> },
  ];

  const seoFacetRoutes = LANG_PREFIXES.flatMap((prefix) => [
    <Route
      key={`${prefix || "fr"}-rental-facet-model`}
      path={localizedPath(prefix, "/location-voiture/:citySlug/:brandSlug/:modelSlug")}
      element={<ProgrammaticFacetPage intent="rental" />}
    />,
    <Route
      key={`${prefix || "fr"}-sale-facet-model`}
      path={localizedPath(prefix, "/voiture-occasion/:citySlug/:brandSlug/:modelSlug")}
      element={<ProgrammaticFacetPage intent="sale" />}
    />,
    <Route
      key={`${prefix || "fr"}-rental-facet`}
      path={localizedPath(prefix, "/location-voiture/:citySlug/:facetSlug")}
      element={<ProgrammaticFacetPage intent="rental" />}
    />,
    <Route
      key={`${prefix || "fr"}-sale-facet`}
      path={localizedPath(prefix, "/voiture-occasion/:citySlug/:facetSlug")}
      element={<ProgrammaticFacetPage intent="sale" />}
    />,
    <Route
      key={`${prefix || "fr"}-airport-cat`}
      path={localizedPath(prefix, "/location-voiture-aeroport/:airportSlug/:categorySlug")}
      element={<AirportLandingPage />}
    />,
    <Route
      key={`${prefix || "fr"}-airport`}
      path={localizedPath(prefix, "/location-voiture-aeroport/:airportSlug")}
      element={<AirportLandingPage />}
    />,
  ]);

  const ecosystemRoutes = LANG_PREFIXES.flatMap((prefix) => [
    <Route key={`${prefix || "fr"}-assistant`} path={localizedPath(prefix, "/assistant-achat")} element={<BuyerAssistantPage />} />,
    <Route key={`${prefix || "fr"}-tco`} path={localizedPath(prefix, "/cout-possession/:brandSlug/:modelSlug")} element={<TcoCalculatorPage />} />,
    <Route key={`${prefix || "fr"}-comparer`} path={localizedPath(prefix, "/comparer")} element={<ComparisonsHubPage />} />,
    <Route key={`${prefix || "fr"}-comparer-slug`} path={localizedPath(prefix, "/comparer/:slug")} element={<ComparisonDetailPage />} />,
    <Route key={`${prefix || "fr"}-assurance`} path={localizedPath(prefix, "/assurance")} element={<ContentClusterHubPage clusterSlug="assurance" />} />,
    <Route key={`${prefix || "fr"}-assurance-topic`} path={localizedPath(prefix, "/assurance/:topicSlug")} element={<ContentClusterTopicPage clusterSlug="assurance" />} />,
    <Route key={`${prefix || "fr"}-financement`} path={localizedPath(prefix, "/financement")} element={<ContentClusterHubPage clusterSlug="financement" />} />,
    <Route key={`${prefix || "fr"}-financement-topic`} path={localizedPath(prefix, "/financement/:topicSlug")} element={<ContentClusterTopicPage clusterSlug="financement" />} />,
    <Route key={`${prefix || "fr"}-demarches`} path={localizedPath(prefix, "/demarches")} element={<ContentClusterHubPage clusterSlug="demarches" />} />,
    <Route key={`${prefix || "fr"}-demarches-topic`} path={localizedPath(prefix, "/demarches/:topicSlug")} element={<ContentClusterTopicPage clusterSlug="demarches" />} />,
    <Route key={`${prefix || "fr"}-questions`} path={localizedPath(prefix, "/questions")} element={<QuestionsHubPage />} />,
    <Route key={`${prefix || "fr"}-questions-slug`} path={localizedPath(prefix, "/questions/:slug")} element={<QuestionDetailPage />} />,
    <Route key={`${prefix || "fr"}-possession`} path={localizedPath(prefix, "/possession")} element={<OwnershipHubPage />} />,
    <Route key={`${prefix || "fr"}-possession-topic`} path={localizedPath(prefix, "/possession/:topicSlug")} element={<OwnershipTimelinePage />} />,
  ]);

  const cityRoutes = LANG_PREFIXES.flatMap((prefix) => [
    <Route
      key={`${prefix || "fr"}-rental-city`}
      path={localizedPath(prefix, "/location-voiture/:citySlug")}
      element={<CityLandingPage mode="rental" />}
    />,
    <Route
      key={`${prefix || "fr"}-sale-city`}
      path={localizedPath(prefix, "/voiture-occasion/:citySlug")}
      element={<CityLandingPage mode="sale" />}
    />,
    <Route
      key={`${prefix || "fr"}-legacy-sale-city`}
      path={localizedPath(prefix, "/location-voiture-occasion/:citySlug")}
      element={<LegacyCitySaleRedirect />}
    />,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#05060f] dark:text-gray-100 transition-colors duration-300">
      <SeoHead />
      {showShell && (
        <div className={shellClass}>
          <HomeNav />
        </div>
      )}

      <div className={showShell && !isHome ? "hx-shell-body-offset" : ""}>
      <Suspense fallback={null}>
        <Routes>
          {publicRoutes(publicPages)}

          {seoFacetRoutes}

          {cityRoutes}

          {ecosystemRoutes}

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
      {showShell && !isHome && (
        <div className={shellClass}>
          <HomeSiteFooter />
        </div>
      )}
    </div>
  );
}
