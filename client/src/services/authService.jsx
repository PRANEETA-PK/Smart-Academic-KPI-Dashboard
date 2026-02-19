import students from "@/data/studentsData.json";
import faculty from "@/data/facultyData.json";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const credentials = {
    student: { email: "praneeta@university.edu", password: "student123" },
    faculty: { email: "rajesh@university.edu", password: "faculty123" },
    admin: { email: "admin@university.edu", password: "admin123" },
};

export const authService = {
    login: async (email, password) => {
        try {
            const response = await axios.post("/api/users/login", { email, password });
            if (response.data) {
                localStorage.setItem("user", JSON.stringify(response.data));
                return { success: true, message: "Login successful", user: response.data };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Login failed" };
        }
    },

    logout: () => {
        localStorage.removeItem("user");
    },

    googleLogin: async (idToken) => {
        try {
            const decoded = jwtDecode(idToken);
            const response = await axios.post("/api/users/google", {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                googleId: decoded.sub
            });
            if (response.data) {
                localStorage.setItem("user", JSON.stringify(response.data));
                return { success: true, user: response.data };
            }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Google Login Failed" };
        }
    }
};
