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

const projectSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    domain: { type: String, required: true },
    githubUrl: { type: String, required: true },
    liveUrl: { type: String },
    status: { type: String, enum: ['Completed', 'In Progress'], default: 'Completed' },
    approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    submissionDate: { type: Date, default: Date.now }
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
        yearOfStudy: { type: Number, default: 1 },
        backlogs: { type: Number, default: 0 },
        placementData: [
            {
                companyName: { type: String, required: true },
                role: { type: String },
                status: { type: String, enum: ['Applied', 'In Progress', 'Selected', 'Rejected'], default: 'Applied' },
                roundsCleared: { type: Number, default: 0 },
                totalRounds: { type: Number, default: 3 },
                package: { type: String },
                date: { type: Date, default: Date.now }
            }
        ],
        semesters: [semesterSchema],
        projects: [projectSchema],
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
