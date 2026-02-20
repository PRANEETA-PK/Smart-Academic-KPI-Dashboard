import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { SubjectBarChart, SGPATrendChart, CGPALineChart } from "@/components/charts/AcademicCharts";
import PerformanceGrowthTrend from "@/components/common/PerformanceGrowthTrend";
import WhatIfCalculator from "@/components/common/WhatIfCalculator";
import { StudentAlerts } from "@/components/common/SmartAlerts";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import { useAuth } from "@/context/AuthContext";
import { students } from "@/data/mockData";
import { CalendarCheck, TrendingUp, Award, ChevronDown } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const student = students.find((s) => s.email === user?.email) || students[0];
  const [selectedSemester, setSelectedSemester] = useState(student.semesters.length - 1);

  const currentSemester = student.semesters[selectedSemester];
  const latestSGPA = currentSemester.sgpa;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, <span className="text-gradient-primary">{student.name}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {student.department} · {student.rollNumber}
            </p>
          </div>
          <AcademicReportPDF student={student} />
        </div>

        <div className="mb-6">
          <StudentAlerts student={student} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard title="Attendance" value={`${student.attendance}%`} icon={CalendarCheck} variant={student.attendance < 65 ? "destructive" : "primary"} />
          <KPICard title="Current SGPA" value={latestSGPA.toFixed(1)} icon={TrendingUp} variant="success" trend={`${currentSemester.semesterName}`} />
          <KPICard title="CGPA" value={student.cgpa.toFixed(1)} icon={Award} variant={student.cgpa < 6 ? "warning" : "primary"} />
        </div>

        <div className="mb-6 flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">Semester:</label>
          <div className="relative">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="appearance-none rounded-lg border border-input bg-card py-2 pl-3 pr-8 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary"
            >
              {student.semesters.map((sem, idx) => (
                <option key={sem.semesterName} value={idx}>{sem.semesterName}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SubjectBarChart data={currentSemester.subjects} />
          <SGPATrendChart data={student.semesters.map((s) => ({ semesterName: s.semesterName, sgpa: s.sgpa }))} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PerformanceGrowthTrend semesters={student.semesters} />
          <WhatIfCalculator semesters={student.semesters} currentCGPA={student.cgpa} />
        </div>

        <div className="mt-6">
          <CGPALineChart data={student.semesters.map((s) => ({ semesterName: s.semesterName, sgpa: s.sgpa }))} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
