import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Role } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = { student: "/student", faculty: "/faculty", admin: "/admin" };
    return <Navigate to={redirectMap[user.role] || "/login"} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
