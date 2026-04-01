import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { SubjectBarChart, SGPATrendChart, CGPALineChart } from "@/components/charts/AcademicCharts";
import PerformanceGrowthTrend from "@/components/common/PerformanceGrowthTrend";
import WhatIfCalculator from "@/components/common/WhatIfCalculator";
import { StudentAlerts } from "@/components/common/SmartAlerts";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import ProjectPortfolio from "@/components/common/ProjectPortfolio";
import { useAuth } from "@/context/AuthContext";
import { CalendarCheck, TrendingUp, Award, ChevronDown, Briefcase, Building2, CheckCircle2, Clock, XCircle, AlertTriangle, FileText, BadgeIndianRupee } from "lucide-react";

const StudentDashboard = () => {
  const { token } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [selectedSemester, setSelectedSemester] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/students/dashboard`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudent(data);
          setSelectedSemester(data.semesters.length - 1);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStudentData();
  }, [token]);

  if (loading || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const currentSemester = student.semesters[selectedSemester] || { sgpa: 0, subjects: [], semesterName: "N/A" };
  const latestSGPA = currentSemester.sgpa;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Welcome back, <span className="text-gradient-primary">{student.name}</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2">
              {student.department} · {student.rollNumber}
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary italic uppercase tracking-wider">
                {student.semesters.length} / 8 Semesters Completed
              </span>
            </p>
          </div>
          <AcademicReportPDF student={student} />
        </div>

        <div className="mb-6">
          <StudentAlerts student={student} />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Semester Attendance" value={`${student.attendance}%`} icon={CalendarCheck} variant={student.attendance < 75 ? "destructive" : "primary"} trend={currentSemester.semesterName} />
          <KPICard title="Semester SGPA" value={Number(currentSemester.sgpa || 0).toFixed(2)} icon={TrendingUp} variant="success" trend={currentSemester.semesterName} />
          <KPICard title="Cumulative CGPA" value={Number(student.cgpa).toFixed(2)} icon={Award} variant={student.cgpa < 7 ? "warning" : "primary"} />
          <KPICard title="Active Backlogs" value={student.backlogs || 0} icon={AlertTriangle} variant={student.backlogs > 0 ? "destructive" : "success"} trend={student.backlogs > 0 ? "Needs Attention" : "Clear"} />
        </div>

        {/* Feature: Placement Tracker (Dynamic based on year) */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-display text-lg font-semibold">Placement Tracker</h3>
              <p className="text-xs text-muted-foreground">Available for 3rd & 4th year students</p>
            </div>
          </div>

          <div className="p-6">
            {student.yearOfStudy < 3 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-muted-foreground">No Placement Data Found</h4>
                <p className="max-w-xs text-sm text-muted-foreground mt-2">Placements typically begin in the 6th semester (Year 3). Stay focused on your academics!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {student.placementData && student.placementData.length > 0 ? (
                  student.placementData.map((p: any, idx: number) => (
                    <div key={idx} className="group relative rounded-xl border border-border bg-background p-4 transition-all hover:border-primary/50 hover:shadow-glow-soft">
                      <div className="mb-3 flex items-center justify-between">
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === 'Selected' ? 'bg-success/10 text-success' :
                          p.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                          }`}>
                          {p.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground">{p.companyName}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{p.role}</p>

                      {p.package && (
                        <div className="mb-3 flex items-center gap-1 text-sm font-medium text-success">
                          <BadgeIndianRupee className="h-4 w-4" />
                          <span>{p.package}</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                          <span>Hiring Rounds</span>
                          <span>{p.roundsCleared} / {p.totalRounds} Cleared</span>
                        </div>
                        <div className="flex gap-1">
                          {Array.from({ length: p.totalRounds }).map((_, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full ${i < p.roundsCleared ? "bg-primary" : "bg-muted"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground py-8 italic">No placements attended yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="mb-6 font-display text-xl font-bold text-card-foreground">Academic Summary</h3>
          <div className="space-y-3">
            {student.semesters.map((sem: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedSemester(idx)}
                className={`flex w-full items-center justify-between rounded-xl p-4 transition-all hover:translate-x-1 ${selectedSemester === idx
                    ? "bg-primary/10 border-l-4 border-l-primary"
                    : "bg-muted/30 hover:bg-muted/50"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display font-semibold">{sem.semesterName}</span>
                  <span className="text-xs text-muted-foreground">{sem.subjects.length} subjects</span>
                </div>
                <div className={`rounded-lg px-3 py-1 text-sm font-bold ${sem.sgpa >= 9 ? "bg-success/20 text-success" :
                    sem.sgpa >= 7.5 ? "bg-primary/20 text-primary" :
                      "bg-warning/20 text-warning"
                  }`}>
                  {Number(sem.sgpa).toFixed(1)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h3 className="font-display text-xl font-bold">Academic Insights</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Viewing:</span>
            <span className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-bold text-primary">{currentSemester.semesterName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <SGPATrendChart
              data={student.semesters.map((s: any) => ({ semesterName: s.semesterName, sgpa: s.sgpa }))}
              onSelectSemester={setSelectedSemester}
              selectedIndex={selectedSemester}
            />
          </div>
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <SubjectBarChart data={currentSemester.subjects} />
          </div>
        </div>

        {/* Detailed Coursework Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-in">
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-6">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-display text-lg font-semibold">Detailed Coursework - {currentSemester.semesterName}</h3>
              <p className="text-xs text-muted-foreground">Comprehensive view of subject grades, marks, and credits</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Subject Code</th>
                  <th className="px-6 py-4 font-semibold">Subject Name</th>
                  <th className="px-6 py-4 font-semibold text-center">Credits</th>
                  <th className="px-6 py-4 font-semibold text-center">Marks</th>
                  <th className="px-6 py-4 font-semibold text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {currentSemester.subjects.map((sub: any, i: number) => (
                  <tr key={i} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium text-muted-foreground">{sub.code || 'N/A'}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{sub.subjectName || sub.name}</td>
                    <td className="px-6 py-4 text-center">{sub.credits || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                        {sub.marks}/100
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        ['O', 'A+', 'A'].includes(sub.grade) ? 'bg-success/20 text-success' :
                        ['B+', 'B', 'C'].includes(sub.grade) ? 'bg-warning/20 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {sub.grade || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PerformanceGrowthTrend semesters={student.semesters} />
          <WhatIfCalculator semesters={student.semesters} currentCGPA={student.cgpa} />
        </div>

        <ProjectPortfolio student={student} onProjectAdded={(updatedStudent: any) => setStudent(updatedStudent)} />

        <div className="mt-8">
          <CGPALineChart data={student.semesters.map((s: any) => ({ semesterName: s.semesterName, sgpa: s.sgpa }))} />
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
