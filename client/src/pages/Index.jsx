import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role === "admin") return <Navigate to="/admin" replace />;
    if (user?.role === "faculty") return <Navigate to="/faculty" replace />;
    return <Navigate to="/student" replace />;
};

export default Index;
