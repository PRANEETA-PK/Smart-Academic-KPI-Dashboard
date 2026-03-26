import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, User } from "lucide-react";
import NotificationCenter from "./NotificationCenter";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl shadow-glow-soft">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <span className="font-display text-lg font-bold text-foreground">
                        Academic KPI
                    </span>
                </div>

                <nav className="flex items-center gap-1">
                    {user?.role === "student" && (
                        <>
                            <button
                                onClick={() => navigate("/student")}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/student")
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </button>
                            <button
                                onClick={() => navigate("/student/profile")}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/student/profile")
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <User className="h-4 w-4" />
                                Profile
                            </button>
                        </>
                    )}
                    {user?.role === "faculty" && (
                        <button
                            onClick={() => navigate("/faculty")}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/faculty")
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </button>
                    )}
                    {user?.role === "admin" && (
                        <button
                            onClick={() => navigate("/admin")}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive("/admin")
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </button>
                    )}

                    <div className="ml-2 pl-2 border-l border-muted-foreground/20 flex items-center gap-2">
                        <NotificationCenter />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
