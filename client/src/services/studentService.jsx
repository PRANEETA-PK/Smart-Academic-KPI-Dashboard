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
    },

    bulkUpload: async (studentsData) => {
        try {
            const response = await axios.post("/api/students/bulk", studentsData);
            return response.data;
        } catch (error) {
            console.error("Error in bulk upload:", error);
            throw error;
        }
    },

    getPendingProjects: async () => {
        try {
            const response = await axios.get("/api/students/projects/pending");
            return response.data;
        } catch (error) {
            console.error("Error fetching pending projects:", error);
            return [];
        }
    },

    updateProjectStatus: async (studentId, projectId, statusData) => {
        try {
            const response = await axios.put(`/api/students/projects/${studentId}/${projectId}/status`, statusData);
            return response.data;
        } catch (error) {
            console.error("Error updating project status:", error);
            throw error;
        }
    }
};
