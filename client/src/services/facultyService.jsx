import faculty from "@/data/facultyData.json";

export const facultyService = {
    getAllFaculty: () => {
        return faculty;
    },

    getFacultyByEmail: (email) => {
        return faculty.find(f => f.email === email);
    }
};
