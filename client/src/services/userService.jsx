import axios from "axios";

const userService = {
    getNotifications: async () => {
        try {
            const response = await axios.get("/api/users/notifications");
            return response.data;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            throw error;
        }
    },

    markAsRead: async (notificationId) => {
        try {
            const response = await axios.put(`/api/users/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }
};

export default userService;
