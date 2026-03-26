const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const departmentSubjects = {
    'Computer Science': ["DBMS", "Operating Systems", "Computer Networks", "Algorithms", "Data Structures", "Software Engineering", "AI", "Cloud Computing"],
    'Electronic & Communication': ["Microprocessors", "VLSI Design", "Digital Electronics", "Signal Processing", "Control Systems", "Embedded Systems", "Communication Theory", "Electromagnetics"],
    'Mechanical Engineering': ["Strength of Materials", "Thermodynamics", "Manufacturing Tech", "Machine Design", "Fluid Mechanics", "Heat Transfer", "Dynamics of Machinery", "CAD/CAM"],
    'Information Technology': ["Web Technologies", "Cyber Security", "Mobile Computing", "Big Data", "Internet of Things", "Java Programming", "Distributed Systems", "Machine Learning"],
    'Civil Engineering': ["Structural Analysis", "Surveying", "Concrete Tech", "Environmental Eng", "Geotechnical Eng", "Transportation Eng", "Hydrology", "Building Construction"],
    'Not Assigned': ["Mathematics", "Physics", "Chemistry", "English", "Environmental Science", "Programming in C", "Engineering Graphics", "Soft Skills"]
};

const getRealisticSubjects = (dept, count) => {
    let pool = departmentSubjects[dept] || departmentSubjects['Not Assigned'];
    // Shuffle pool
    let shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const patchSubjects = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const students = await Student.find();
        console.log(`Patching ${students.length} students...`);

        for (const student of students) {
            let changed = false;
            const dept = student.department || 'Not Assigned';

            for (const sem of student.semesters) {
                // 1. Rename placeholders
                sem.subjects.forEach((subj, idx) => {
                    if (subj.subjectName.match(/Theory|Lab|Activity|Advanced Tech|Project/i)) {
                        const pool = departmentSubjects[dept] || departmentSubjects['Not Assigned'];
                        subj.subjectName = pool[idx % pool.length];
                        changed = true;
                    }
                });

                // 2. Ensure at least 5 subjects
                if (sem.subjects.length < 5) {
                    const needed = 5 - sem.subjects.length;
                    const existingNames = sem.subjects.map(s => s.subjectName);
                    const pool = departmentSubjects[dept] || departmentSubjects['Not Assigned'];
                    const available = pool.filter(n => !existingNames.includes(n));

                    const newSubjs = available.slice(0, needed).map(name => ({
                        subjectName: name,
                        marks: Math.floor(60 + Math.random() * 40)
                    }));

                    sem.subjects.push(...newSubjs);
                    changed = true;
                }
            }

            if (changed) {
                await student.save();
            }
        }

        console.log('Database patching complete.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

patchSubjects();
