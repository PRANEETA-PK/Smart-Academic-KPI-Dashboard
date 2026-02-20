import React, { createContext, useContext, useState, useCallback } from "react";
import { User, Role } from "@/types";
import { students, faculty, credentials } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, password: string) => {
    if (email === credentials.student.email && password === credentials.student.password) {
      const s = students[0];
      setUser({ id: s.id, name: s.name, email: s.email, role: "student" });
      return { success: true, message: "Login successful" };
    }
    if (email === credentials.faculty.email && password === credentials.faculty.password) {
      const f = faculty[0];
      setUser({ id: f.id, name: f.name, email: f.email, role: "faculty" });
      return { success: true, message: "Login successful" };
    }
    if (email === credentials.admin.email && password === credentials.admin.password) {
      setUser({ id: "admin1", name: "System Admin", email: credentials.admin.email, role: "admin" });
      return { success: true, message: "Login successful" };
    }
    return { success: false, message: "Invalid email or password" };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
