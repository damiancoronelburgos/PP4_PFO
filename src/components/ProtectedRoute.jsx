import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../middlewares/auth";

export default function ProtectedRoute({ children, allow = [] }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!isAuthenticated() || !token) return <Navigate to="/" replace />;
  if (allow.length && !allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}