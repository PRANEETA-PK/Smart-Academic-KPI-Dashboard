import React, { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = useCallback(async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        setUser(null);
    }, []);

    const googleLogin = useCallback(async (idToken) => {
        const result = await authService.googleLogin(idToken);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, googleLogin, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
