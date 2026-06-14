import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api/axios";
import { saveAuth } from "../utils/authStorage";
import { hasUserRole } from "../utils/userRoles";

function RouteLoading() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--gv-mut, #53608f)",
        fontFamily: "Outfit, system-ui, sans-serif",
      }}
      aria-live="polite"
      aria-busy="true"
    >
      Vérification de la session…
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const [status, setStatus] = useState("loading");
  const roleKey = roles?.join(",") ?? "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/user/me");
        if (cancelled) return;
        saveAuth(res.data);
        if (roles && !hasUserRole(res.data, ...roles)) {
          setStatus("forbidden");
          return;
        }
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roleKey]);

  if (status === "loading") return <RouteLoading />;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;
  return children;
}
