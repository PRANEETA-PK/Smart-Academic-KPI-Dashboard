const mongoose = require('mongoose');

const subjectSchema = mongoose.Schema({
    subjectName: { type: String, required: true }, // Changed from 'name'
    marks: { type: Number, required: true },
    code: { type: String }, // Made optional
    credits: { type: Number }, // Made optional
    grade: { type: String },
});

const semesterSchema = mongoose.Schema({
    semesterName: { type: String, required: true },
    sgpa: { type: Number, required: true },
    subjects: [subjectSchema],
});

const studentSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true }, // Added email
        rollNumber: { type: String, required: true, unique: true },
        department: { type: String, required: true },
        batch: { type: String }, // Made optional
        cgpa: { type: Number, default: 0 },
        attendance: { type: Number, default: 0 },
        semesters: [semesterSchema],
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
