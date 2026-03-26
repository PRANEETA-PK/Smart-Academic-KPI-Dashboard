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
import PlacementDetails from "@/components/common/PlacementDetails";
import { useAuth } from "@/context/AuthContext";
import { studentService } from "@/services/studentService";
import { BookOpen, GraduationCap, TrendingUp, AlertTriangle, Users, Loader2 } from "lucide-react";

const StudentDashboard = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchStudentData = async () => {
            if (user?.email) {
                const data = await studentService.getStudentByEmail(user.email);
                setStudent(data);
            }
            setLoading(false);
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
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-center space-y-4 p-8 rounded-2xl border border-border bg-card shadow-card max-w-sm w-full mx-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 mx-auto">
                        <AlertTriangle className="h-7 w-7 text-destructive" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">Session Expired</h2>
                    <p className="text-sm text-muted-foreground">
                        Your session is outdated or no student profile was found. Please log in again.
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem("user");
                            window.location.href = "/login";
                        }}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    const semesters = student.semesters || [];
    const latestSem = semesters[semesters.length - 1] || { subjects: [], semesterName: "N/A", sgpa: 0 };
    const yearOfStudy = student.yearOfStudy || Math.ceil(semesters.length / 2) || 1;

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
                                <SidebarMenuButton
                                    isActive={activeTab === "overview"}
                                    onClick={() => setActiveTab("overview")}
                                >
                                    <BookOpen className="h-4 w-4" />
                                    <span>Overview</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    isActive={activeTab === "performance"}
                                    onClick={() => setActiveTab("performance")}
                                >
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
                                <p className="text-muted-foreground">{student.department} · {student.rollNumber} · Year {yearOfStudy}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <SidebarTrigger className="md:hidden" />
                                <AcademicReportPDF student={student} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <KPICard title="Current CGPA" value={student.cgpa.toFixed(2)} icon={GraduationCap} variant={student.cgpa >= 8 ? "success" : "primary"} trend="+0.2 from last sem" />
                            <KPICard title="Latest SGPA" value={latestSem.sgpa.toFixed(2)} icon={TrendingUp} variant="default" trend={latestSem.semesterName} />
                            <KPICard title="Attendance" value={`${student.attendance}%`} icon={Users} variant={student.attendance >= 75 ? "success" : "destructive"} trend={student.attendance < 75 ? "Below 75%" : "Good Standing"} />
                            <KPICard title="Active Backlogs" value={student.backlogs || 0} icon={AlertTriangle} variant={student.backlogs > 0 ? "destructive" : "success"} trend={student.backlogs > 0 ? "Priority Fix" : "All Clear"} />
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                {activeTab === "overview" ? (
                                    <>
                                        <SubjectMarksChart data={latestSem.subjects} semesterName={latestSem.semesterName} />
                                        <AIInsights student={student} />
                                    </>
                                ) : (
                                    <>
                                        <SGPATrendChart data={semesters} />
                                        <CGPALineChart data={semesters} />
                                        <PlacementDetails student={student} />
                                    </>
                                )}
                            </div>
                            <div className="space-y-6">
                                <StudentAlerts student={student} />
                                {activeTab === "overview" && <PerformanceGrowthTrend semesters={semesters} />}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default StudentDashboard;
