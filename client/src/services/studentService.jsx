import axios from "axios";

export const studentService = {
    getAllStudents: async () => {
        try {
            const response = await axios.get("/api/students");
            return response.data;
        } catch (error) {
            console.error("Error fetching students:", error);
            return [];
        }
    },

    getStudentByEmail: async (email) => {
        try {
            // Updated to use the specific dashboard endpoint which filters by authenticated user's email
            const response = await axios.get("/api/students/dashboard");
            return response.data;
        } catch (error) {
            console.error("Error fetching student by email:", error);
            return null;
        }
    },

    getStudentById: async (id) => {
        try {
            const response = await axios.get(`/api/students/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching student by ID:", error);
            return null;
        }
    }
};
