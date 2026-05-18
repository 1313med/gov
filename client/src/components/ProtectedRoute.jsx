import { Navigate } from "react-router-dom";
import { loadAuth } from "../utils/authStorage";
import { hasUserRole } from "../utils/userRoles";

export default function ProtectedRoute({ children, roles }) {
  const auth = loadAuth();

  if (!auth?._id) return <Navigate to="/login" replace />;

  if (roles && !hasUserRole(auth, ...roles)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
