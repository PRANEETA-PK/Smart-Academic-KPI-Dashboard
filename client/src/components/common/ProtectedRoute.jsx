import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        const redirectMap = { student: "/student", faculty: "/faculty", admin: "/admin" };
        return <Navigate to={redirectMap[user.role] || "/login"} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
