import { Navigate } from "react-router-dom";
import { loadAuth } from "../utils/authStorage";

export default function ProtectedRoute({ children, roles }) {
  const auth = loadAuth();

  if (!auth?.token) return <Navigate to="/login" replace />;

  if (roles && !roles.includes((auth.role || "").toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
}
