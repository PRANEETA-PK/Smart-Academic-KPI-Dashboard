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
    "ValueLabs", "Coforge", "Happiest Minds", "Sonata Software", "Tavisca", "CitiusTech"
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
            const totalRounds = 3 + Math.floor(Math.random() * 3); // 3 to 5 rounds
            const roundsCleared = status === "Selected" ? totalRounds : Math.floor(Math.random() * totalRounds);

            data.push({
                companyName: company,
                role: getRandomElement(roles),
                status: status,
                roundsCleared: roundsCleared,
                totalRounds: totalRounds,
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) // Within last 30 days
            });
        }

        // If we ran out of unique companies (unlikely with 30), just stop or allow duplicates
        if (usedCompanies.size === midTierCompanies.length && data.length < count) {
            usedCompanies.clear();
        }
    }
    return data;
};

const updatePlacements = async () => {
    try {
        const students = await Student.find({});
        console.log(`🔍 Found ${students.length} students. Processing...`);

        let updatedCount = 0;

        for (const student of students) {
            const semCount = student.semesters ? student.semesters.length : 0;
            let placementCount = 0;

            if (semCount === 6) {
                placementCount = 1 + Math.floor(Math.random() * 2); // 1 or 2
            } else if (semCount >= 7) {
                placementCount = 20 + Math.floor(Math.random() * 5); // 20 to 24
            }

            if (placementCount > 0) {
                student.placementData = generatePlacementData(placementCount);
                await student.save();
                updatedCount++;
                console.log(`✅ Updated ${student.name} (${semCount} semesters) with ${placementCount} companies.`);
            }
        }

        console.log(`\n🎉 Success! Updated ${updatedCount} students.`);
        process.exit();
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
};

updatePlacements();
