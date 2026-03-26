const mongoose = require('mongoose');
const Student = require('./models/studentModel');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const academicPool = {
    'Computer Science': [
        ["Math I", "Physics", "Chemistry", "C Programming", "English"],
        ["Math II", "Digital Logic", "Data Structures", "Object Oriented Programming", "Environmental Science"],
        ["Discrete Mathematics", "Operating Systems", "DBMS", "Computer Organization", "Data Communication"],
        ["Design of Algorithms", "Software Engineering", "Java Programming", "Theory of Computation", "Statistics"],
        ["Computer Networks", "Artificial Intelligence", "Web Development", "Microprocessors", "Computer Graphics"],
        ["Compiler Design", "Cloud Computing", "Distributed Systems", "Cryptography", "Mobile App Development"],
        ["Big Data Analytics", "Machine Learning", "Cyber Security", "Internet of Things", "Soft Computing"],
        ["Natural Language Processing", "Blockchain Technology", "Data Mining", "Quantum Computing", "Final Year Project"]
    ],
    'Electronic & Communication': [
        ["Math I", "Physics", "Chemistry", "C Programming", "English"],
        ["Math II", "Network Analysis", "Electronic Devices", "Digital Systems", "Environmental Science"],
        ["Signals & Systems", "Analog Circuits", "Microcontrollers", "EM Waves", "Math III"],
        ["Control Systems", "Communication Theory", "Digital Signal Processing", "Antennas", "Linear ICs"],
        ["VLSI Design", "Embedded Systems", "Wireless Communication", "Optical Fiber", "Computer Architecture"],
        ["Digital VLSI", "Radar Systems", "Satellite Communication", "Microwave Engineering", "CMOS Design"],
        ["RF Design", "Mobile Communication", "Nano Electronics", "Information Theory", "ASIC Design"],
        ["Advanced DSP", "VLSI Testing", "IoT Sensor Networks", "Multimedia Comm", "Final Year Project"]
    ],
    'Mechanical Engineering': [
        ["Math I", "Physics", "Chemistry", "Engineering Graphics", "English"],
        ["Math II", "Applied Mechanics", "Thermodynamics", "Materials Science", "Environmental Science"],
        ["Mechanics of Solids", "Fluid Mechanics", "Kinematics", "Manufacturing Tech I", "Math III"],
        ["Thermal Engineering", "Dynamics of Machines", "Machine Design I", "Manufacturing Tech II", "Metrology"],
        ["Heat Transfer", "Machine Design II", "Turbo Machinery", "Industrial Engineering", "Fluid Power"],
        ["Mechatronics", "CAD/CAM", "Operations Research", "Automotive Engineering", "Refrigeration"],
        ["Robotics", "Finite Element Analysis", "Power Plant Engineering", "Composite Materials", "Total Quality Mgmt"],
        ["Gas Dynamics", "Renewable Energy", "Vibration Analysis", "Supply Chain Mgmt", "Final Year Project"]
    ],
    'Information Technology': [
        ["Math I", "Physics", "Chemistry", "C Programming", "English"],
        ["Math II", "Digital Systems", "Data Structures", "Python Programming", "Environmental Science"],
        ["Discrete Structures", "Operating Systems", "DBMS", "Web Technologies I", "Computer Architecture"],
        ["Design of Algorithms", "Software Engineering", "Java Programming", "Computer Networks", "Probability & Stats"],
        ["Web Technologies II", "Artificial Intelligence", "Information Security", "Cyber Laws", "IT Project Mgmt"],
        ["Cloud Computing", "Data Analytics", "E-Commerce", "Software Testing", "Distributed Computing"],
        ["Mobile Computing", "Machine Learning", "ERP Systems", "Digital Marketing", "Service Oriented Architecture"],
        ["Deep Learning", "Virtual Reality", "IT Infrastructure", "Data Warehousing", "Final Year Project"]
    ],
    'Civil Engineering': [
        ["Math I", "Physics", "Chemistry", "Engineering Mechanics", "English"],
        ["Math II", "Surveying I", "Building Materials", "Solid Mechanics", "Environmental Science"],
        ["Surveying II", "Fluid Mechanics", "Concrete Technology", "Structural Analysis I", "Engineering Geology"],
        ["Hydraulics", "Structural Analysis II", "Soil Mechanics I", "Building Planning", "Transportation Eng I"],
        ["Design of Steel Structures", "Soil Mechanics II", "Transportation Eng II", "Hydrology", "Environmental Eng I"],
        ["Reinforced Concrete Design", "Irrigation Engineering", "Environmental Eng II", "Foundation Eng", "Construction Mgmt"],
        ["Advanced Structures", "Water Resources", "Estimating & Costing", "Pavement Design", "Remote Sensing"],
        ["Bridge Engineering", "Earthquake Engineering", "Prestressed Concrete", "Urban Planning", "Final Year Project"]
    ]
};

const getSemesterSubjects = (dept, semIndex) => {
    const pool = academicPool[dept] || academicPool['Computer Science'];
    const idx = Math.min(semIndex, pool.length - 1);
    return pool[idx].map(name => ({
        subjectName: name,
        marks: Math.floor(65 + Math.random() * 30) // Realistic variance
    }));
};

const patchRealisticData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const students = await Student.find();
        console.log(`Rewriting academic history for ${students.length} students...`);

        for (const student of students) {
            const dept = student.department || 'Computer Science';

            // Rebuild semesters from scratch to ensure complete consistency
            const originalCount = student.semesters.length;
            const newSemesters = [];

            for (let i = 0; i < originalCount; i++) {
                const semName = `Semester ${i + 1}`;
                const subjects = getSemesterSubjects(dept, i);
                const sgpa = (subjects.reduce((sum, s) => sum + s.marks, 0) / (subjects.length * 10)).toFixed(2);

                newSemesters.push({
                    semesterName: semName,
                    subjects: subjects,
                    sgpa: parseFloat(sgpa)
                });
            }

            student.semesters = newSemesters;
            student.cgpa = (newSemesters.reduce((sum, s) => sum + s.sgpa, 0) / newSemesters.length).toFixed(2);
            await student.save();
        }

        console.log('Database successfully patched with realistic semester history.');
        process.exit();
    } catch (err) {
        console.error('Error during patching:', err);
        process.exit(1);
    }
};

patchRealisticData();
