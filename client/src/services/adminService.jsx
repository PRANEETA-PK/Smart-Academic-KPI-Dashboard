import axios from "axios";

export const adminService = {
    getStats: async () => {
        try {
            const response = await axios.get("/api/admin/stats");
            return response.data;
        } catch (error) {
            console.error("Error fetching admin stats:", error);
            return null;
        }
    },

    getAllUsers: async () => {
        try {
            const response = await axios.get("/api/admin/users");
            return response.data;
        } catch (error) {
            console.error("Error fetching all users:", error);
            return [];
        }
    },

    getAuditLogs: async () => {
        try {
            const response = await axios.get("/api/admin/audit-logs");
            return response.data;
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            return [];
        }
    },

    updateUserStatus: async (userId, data) => {
        try {
            const response = await axios.put(`/api/admin/users/${userId}/status`, data);
            return response.data;
        } catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    },

    deleteUser: async (userId) => {
        try {
            const response = await axios.delete(`/api/admin/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    },

    createFaculty: async (data) => {
        try {
            const response = await axios.post("/api/admin/faculty", data);
            return response.data;
        } catch (error) {
            console.error("Error creating faculty:", error);
            throw error;
        }
    },

    sendNotification: async (data) => {
        try {
            const response = await axios.post("/api/admin/notify-individual", data);
            return response.data;
        } catch (error) {
            console.error("Error sending notification:", error);
            throw error;
        }
    },

    notifyRiskStudents: async (studentIds) => {
        try {
            const response = await axios.post("/api/admin/notify-risk", { studentIds });
            return response.data;
        } catch (error) {
            console.error("Error notifying risk students:", error);
            throw error;
        }
    }
};
