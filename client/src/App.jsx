import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home2.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import MySales from "./pages/MySales";
import Cars from "./pages/Cars";
import Navbar from "./components/Navbar";
import CarDetails from "./pages/CarDetails";
import NewSale from "./pages/NewSale";
import EditSale from "./pages/EditSale";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSales from "./pages/admin/AdminSales";


export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Seller Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["seller", "admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Seller Listings */}
        <Route
          path="/my-sales"
          element={
            <ProtectedRoute roles={["seller", "admin"]}>
              <MySales />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-sales/new"
          element={
            <ProtectedRoute roles={["seller", "admin"]}>
              <NewSale />
            </ProtectedRoute>
          }
        />
        <Route
  path="/notifications"
  element={
    <ProtectedRoute roles={["seller", "admin"]}>
      <Notifications />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/sales"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminSales />
    </ProtectedRoute>
  }
/>


        <Route
          path="/my-sales/edit/:id"
          element={
            <ProtectedRoute roles={["seller", "admin"]}>
              <EditSale />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
