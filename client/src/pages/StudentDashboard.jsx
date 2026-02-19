import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/layout/Sidebar";
import KPICard from "@/components/common/KPICard";
import SubjectMarksChart from "@/components/charts/SubjectMarksChart";
import SGPATrendChart from "@/components/charts/SGPATrendChart";
import CGPALineChart from "@/components/charts/CGPALineChart";
import PerformanceGrowthTrend from "@/components/common/PerformanceGrowthTrend";
import { StudentAlerts } from "@/components/common/SmartAlerts";
import AIInsights from "@/components/common/AIInsights";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import { useAuth } from "@/context/AuthContext";
import { studentService } from "@/services/studentService";
import { BookOpen, GraduationCap, TrendingUp, AlertTriangle, Users, Loader2 } from "lucide-react";

const StudentDashboard = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user?.email) {
                const data = await studentService.getStudentByEmail(user.email);
                setStudent(data);
                setLoading(false);
            }
        };
        fetchStudentData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <p className="text-muted-foreground">Student data not found.</p>
            </div>
        );
    }

    const semesters = student.semesters || [];
    const latestSem = semesters[semesters.length - 1] || { subjects: [], semesterName: "N/A", sgpa: 0 };

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background w-full">
                <Sidebar className="border-r">
                    <SidebarHeader className="h-16 flex items-center justify-center border-b">
                        <span className="text-lg font-bold text-primary">Academic Compass</span>
                    </SidebarHeader>
                    <SidebarContent className="p-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton isActive>
                                    <BookOpen className="h-4 w-4" />
                                    <span>Overview</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <TrendingUp className="h-4 w-4" />
                                    <span>Performance</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1">
                    <Navbar />
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
                            <div>
                                <h1 className="font-display text-2xl font-bold text-foreground">Welcome back, {student.name.split(" ")[0]}!</h1>
                                <p className="text-muted-foreground">{student.department} · {student.rollNumber}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="md:hidden" />
                                <AcademicReportPDF student={student} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KPICard title="Current CGPA" value={student.cgpa.toFixed(2)} icon={GraduationCap} variant={student.cgpa >= 8 ? "success" : "primary"} trend="+0.2 from last sem" />
                            <KPICard title="Latest SGPA" value={latestSem.sgpa.toFixed(2)} icon={TrendingUp} variant="default" trend="Semester 5" />
                            <KPICard title="Attendance" value={`${student.attendance}%`} icon={Users} variant={student.attendance >= 75 ? "success" : "destructive"} trend={student.attendance < 75 ? "Below 75%" : "Good Standing"} />
                            <KPICard title="Active Backlogs" value={0} icon={AlertTriangle} variant="success" trend="All Clear" />
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                <SGPATrendChart data={semesters} />
                                <SubjectMarksChart data={latestSem.subjects} semesterName={latestSem.semesterName} />
                                <CGPALineChart data={semesters} />
                            </div>
                            <div className="space-y-6">
                                <AIInsights student={student} />
                                <StudentAlerts student={student} />
                                <PerformanceGrowthTrend semesters={semesters} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default StudentDashboard;
