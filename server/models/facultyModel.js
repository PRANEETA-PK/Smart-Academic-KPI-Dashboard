const mongoose = require('mongoose');

const syllabusProgressSchema = mongoose.Schema({
    subject: { type: String, required: true },
    lessonsPlanned: { type: Number, required: true },
    lessonsCompleted: { type: Number, default: 0 },
});

const facultySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        department: { type: String, required: true },
        designation: { type: String },
        syllabusProgress: [syllabusProgressSchema],
    },
    {
        timestamps: true,
    }
);

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
