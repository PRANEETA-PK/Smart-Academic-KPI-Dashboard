const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Student = require('./models/studentModel');
const connectDB = require('./config/db');

dotenv.config({ path: path.join(__dirname, '.env') });
connectDB();

const midTierCompanies = [
    "Zoho", "Freshworks", "Razorpay", "Cred", "Groww",
    "Slice", "Zeta", "InMobi", "Mu Sigma", "Fractal Analytics",
    "BrowserStack", "Postman", "Unacademy", "Swiggy", "Zomato",
    "BigBasket", "Mindtree", "Mphasis", "Hexaware", "Persistent Systems",
    "Cybage", "KPIT Technologies", "Zensar Technologies", "Birlasoft",
    "ValueLabs", "Coforge", "Happiest Minds", "Sonata Software", "Tavisca", "CitiusTech",
    "Mindcurv", "Lentra", "Darwinbox", "Yellow.ai", "Gupshup", "Pharmeasy", "Nykaa"
];

const roles = ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "QA Engineer", "DevOps Intern"];
const statuses = ["Applied", "In Progress", "Selected", "Rejected"];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generatePlacementData = (count) => {
    const data = [];
    const usedCompanies = new Set();

    while (data.length < count) {
        const company = getRandomElement(midTierCompanies);
        if (!usedCompanies.has(company)) {
            usedCompanies.add(company);
            const status = getRandomElement(statuses);
            const totalRounds = 3 + Math.floor(Math.random() * 3);
            const roundsCleared = status === "Selected" ? totalRounds : Math.floor(Math.random() * totalRounds);

            data.push({
                companyName: company,
                role: getRandomElement(roles),
                status: status,
                roundsCleared: roundsCleared,
                totalRounds: totalRounds,
                package: (8 + Math.random() * 4).toFixed(1) + " LPA",
                date: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
            });
        }
        if (usedCompanies.size === midTierCompanies.length) usedCompanies.clear();
    }
    return data;
};

const updatePlacements = async () => {
    try {
        const students = await Student.find({});
        console.log(`🔍 Processing ${students.length} students...`);

        for (const student of students) {
            // Assign random semester count between 6 and 8 to showcase the request
            // We want some to be 6, and some to be 7 or 8.
            const targetSemCount = Math.random() > 0.5 ? 7 : 6;

            // If they have fewer semesters, add dummy ones
            if (student.semesters.length < targetSemCount) {
                while (student.semesters.length < targetSemCount) {
                    const nextSem = student.semesters.length + 1;
                    student.semesters.push({
                        semesterName: `Sem ${nextSem}`,
                        sgpa: (7 + Math.random() * 2.5).toFixed(2),
                        subjects: [
                            { subjectName: "Advanced Tech I", marks: 80 + Math.floor(Math.random() * 15) },
                            { subjectName: "Project Lab", marks: 85 + Math.floor(Math.random() * 10) }
                        ]
                    });
                }
            }

            const semCount = student.semesters.length;
            let placementCount = 0;

            if (semCount === 6) {
                placementCount = 2; // "one or two companies"
            } else if (semCount >= 7) {
                placementCount = 20 + Math.floor(Math.random() * 5); // "minimum 20 companies"
            }

            student.placementData = generatePlacementData(placementCount);
            student.yearOfStudy = Math.ceil(semCount / 2);

            await student.save();
            console.log(`✅ ${student.name}: ${semCount} Sems | ${placementCount} Placements (${student.yearOfStudy} Year)`);
        }

        console.log(`\n🎉 All students updated with professional placement data!`);
        process.exit();
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
};

updatePlacements();
