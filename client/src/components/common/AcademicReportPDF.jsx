import React from "react";
import { FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AcademicReportPDF = ({ student }) => {
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(75, 168, 180);
        doc.rect(0, 0, pageWidth, 35, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Academic Performance Report", pageWidth / 2, 18, { align: "center" });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Smart Academic KPI Dashboard System", pageWidth / 2, 28, { align: "center" });

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Student Information", 14, 48);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const details = [
            ["Name", student.name],
            ["Roll Number", student.rollNumber],
            ["Department", student.department],
            ["Email", student.email],
            ["Attendance", `${student.attendance}%`],
            ["CGPA", student.cgpa.toFixed(2)],
        ];

        let y = 56;
        details.forEach(([label, value]) => {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(100, 116, 139);
            doc.text(`${label}:`, 14, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59);
            doc.text(value, 60, y);
            y += 7;
        });

        y += 4;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Risk Assessment", 14, y);
        y += 8;
        doc.setFontSize(10);

        const riskLevel = student.cgpa < 6 || student.attendance < 65 ? "At Risk" :
            student.cgpa < 7 ? "Monitor" : "Good Standing";
        const riskColor = riskLevel === "At Risk" ? [220, 38, 38] : riskLevel === "Monitor" ? [217, 159, 24] : [22, 163, 74];

        doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
        doc.roundedRect(14, y - 5, 50, 8, 2, 2, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text(riskLevel, 39, y, { align: "center" });

        y += 16;
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.text("Semester-wise Performance", 14, y);
        y += 6;

        const semHeaders = [["Semester", "SGPA", "Change"]];
        const semRows = student.semesters.map((sem, i) => {
            const prev = i > 0 ? student.semesters[i - 1].sgpa : sem.sgpa;
            const change = i === 0 ? "—" : `${((sem.sgpa - prev) / prev * 100).toFixed(1)}%`;
            return [sem.semesterName, sem.sgpa.toFixed(2), change];
        });

        autoTable(doc, {
            startY: y,
            head: semHeaders,
            body: semRows,
            theme: "grid",
            headStyles: { fillColor: [75, 168, 180], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [240, 253, 250] },
            styles: { fontSize: 9, cellPadding: 4 },
        });

        const latestSem = student.semesters[student.semesters.length - 1];
        const tableEnd = doc.lastAutoTable?.finalY || y + 40;
        let sy = tableEnd + 12;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(`Subject Details — ${latestSem.semesterName}`, 14, sy);
        sy += 6;

        autoTable(doc, {
            startY: sy,
            head: [["Subject", "Marks", "Status"]],
            body: latestSem.subjects.map((sub) => [
                sub.subjectName,
                sub.marks.toString(),
                sub.marks >= 80 ? "Excellent" : sub.marks >= 60 ? "Good" : sub.marks >= 50 ? "Average" : "Below Average",
            ]),
            theme: "grid",
            headStyles: { fillColor: [75, 168, 180], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [240, 253, 250] },
            styles: { fontSize: 9, cellPadding: 4 },
        });

        const tableEnd2 = doc?.lastAutoTable?.finalY || sy + 40;
        let ry = tableEnd2 + 12;

        if (ry > 260) { doc.addPage(); ry = 20; }

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Performance Remarks", 14, ry);
        ry += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const remarks = [];
        if (student.cgpa >= 9) remarks.push("Outstanding academic performance. Eligible for distinction.");
        else if (student.cgpa >= 8) remarks.push("Very good academic performance. Keep up the excellent work.");
        else if (student.cgpa >= 7) remarks.push("Good performance. Room for improvement in specific areas.");
        else if (student.cgpa >= 6) remarks.push("Satisfactory performance. Focus on weaker subjects to improve overall CGPA.");
        else remarks.push("Needs significant improvement. Academic counseling recommended.");

        if (student.attendance < 75) remarks.push("Attendance is below 75% — immediate improvement required.");
        if (student.semesters.length >= 2) {
            const last = student.semesters[student.semesters.length - 1].sgpa;
            const prev = student.semesters[student.semesters.length - 2].sgpa;
            if (last > prev) remarks.push(`Positive trend: SGPA improved by ${((last - prev) / prev * 100).toFixed(1)}% in latest semester.`);
            else if (last < prev) remarks.push(`Warning: SGPA declined by ${((prev - last) / prev * 100).toFixed(1)}% in latest semester.`);
        }

        remarks.forEach((r) => {
            doc.text(`• ${r}`, 14, ry, { maxWidth: pageWidth - 28 });
            ry += 7;
        });

        const totalPages = doc.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFillColor(240, 240, 240);
            doc.rect(0, doc.internal.pageSize.getHeight() - 14, pageWidth, 14, "F");
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Generated on ${new Date().toLocaleDateString()} · Page ${p} of ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 5, { align: "center" });
        }

        doc.save(`${student.name.replace(/\s+/g, "_")}_Academic_Report.pdf`);
    };

    return (
        <button
            onClick={generatePDF}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-card transition-all hover:bg-primary/90 hover:shadow-glow"
        >
            <FileDown className="h-4 w-4" />
            Download Report (PDF)
        </button>
    );
};

export default AcademicReportPDF;
