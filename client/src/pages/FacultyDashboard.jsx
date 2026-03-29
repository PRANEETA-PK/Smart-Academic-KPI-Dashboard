import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { FacultyAlerts } from "@/components/common/SmartAlerts";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import { Users, TrendingUp, AlertTriangle, Search, ArrowUpDown, Code, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const FacultyDashboard = () => {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [pendingProjects, setPendingProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const [data, projectsData] = await Promise.all([
                    studentService.getAllStudents(),
                    studentService.getPendingProjects()
                ]);
                setStudents(Array.isArray(data) ? data : []);
                setPendingProjects(Array.isArray(projectsData) ? projectsData : []);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = useMemo(() => {
        if (!Array.isArray(students)) return [];
        let list = [...students].filter(
            (s) => (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                (s.email?.toLowerCase() || "").includes(search.toLowerCase())
        );
        list.sort((a, b) => {
            const valA = a[sortKey] ?? "";
            const valB = b[sortKey] ?? "";
            if (typeof valA === "string" && typeof valB === "string") return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
            return sortDir === "asc" ? (Number(valA) || 0) - (Number(valB) || 0) : (Number(valB) || 0) - (Number(valA) || 0);
        });
        return list;
    }, [students, search, sortKey, sortDir]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const atRiskStudents = students.filter((s) => s.cgpa < 6 || s.attendance < 65);
    const avgCGPA = students.length > 0 ? (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2) : "0.00";

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    };

    const getRiskBadge = (s) => {
        if (s.cgpa < 6 || s.attendance < 65)
            return <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">At Risk</span>;
        if (s.cgpa < 7)
            return <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">Monitor</span>;
        return <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Good</span>;
    };

    const handleProjectStatusUpdate = async (studentId, projectId, newStatus) => {
        try {
            await studentService.updateProjectStatus(studentId, projectId, { approvalStatus: newStatus });
            toast.success(`Project ${newStatus} Successfully`);
            setPendingProjects(prev => prev.filter(p => p.projectId !== projectId));
        } catch (error) {
            toast.error("Failed to update project status");
        }
    };

    const sgpaDistribution = [
        { range: "< 5.0", count: students.filter((s) => s.cgpa < 5).length },
        { range: "5.0-6.0", count: students.filter((s) => s.cgpa >= 5 && s.cgpa < 6).length },
        { range: "6.0-7.0", count: students.filter((s) => s.cgpa >= 6 && s.cgpa < 7).length },
        { range: "7.0-8.0", count: students.filter((s) => s.cgpa >= 7 && s.cgpa < 8).length },
        { range: "8.0-9.0", count: students.filter((s) => s.cgpa >= 8 && s.cgpa < 9).length },
        { range: "9.0-10", count: students.filter((s) => s.cgpa >= 9).length },
    ];

    const riskPieData = [
        { name: "At Risk", value: atRiskStudents.length },
        { name: "Safe", value: students.length - atRiskStudents.length },
    ];
    const PIE_COLORS = ["hsl(0 72% 55%)", "hsl(184 42% 50%)"];

    const reportStudent = selectedStudent ? students.find((s) => s.id === selectedStudent) : null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mb-8 animate-fade-in">
                    <h1 className="font-display text-2xl font-bold text-foreground">Faculty Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Computer Science Department Overview</p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <KPICard title="Total Students" value={students.length} icon={Users} variant="primary" />
                    <KPICard title="Average CGPA" value={avgCGPA} icon={TrendingUp} variant="success" />
                    <KPICard title="At-risk Students" value={atRiskStudents.length} icon={AlertTriangle} variant="destructive" trend="CGPA < 6 or Attendance < 65%" />
                </div>

                <div className="mb-8">
                    <FacultyAlerts students={students} />
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow">
                        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">CGPA Distribution</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={sgpaDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
                                <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)" }} />
                                <Bar dataKey="count" fill="hsl(184 42% 50%)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow">
                        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Risk Analytics</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {riskPieData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {pendingProjects.length > 0 && (
                    <div className="mb-8 rounded-xl border border-destructive/20 bg-card p-5 shadow-card shadow-destructive/10 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-destructive/80"></div>
                        <div className="mb-4 flex items-center gap-2">
                            <Code className="h-5 w-5 text-destructive" />
                            <h3 className="font-display text-base font-semibold text-card-foreground">Pending Project Approvals</h3>
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse shadow-md">
                                {pendingProjects.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingProjects.map((proj, idx) => (
                                <div key={proj.projectId || proj._id || `proj-${idx}`} className="flex flex-col justify-between rounded-xl border border-border bg-background p-5 shadow-card hover:shadow-glow-soft transition-all">
                                    <div>
                                        <div className="mb-3 flex items-center justify-between">
                                            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-primary tracking-wider">
                                                {proj.domain}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-semibold">
                                                {new Date(proj.submissionDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-foreground mb-1">{proj.title}</h4>
                                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 font-medium">
                                            <Users className="h-3.5 w-3.5" /> {proj.studentName}
                                        </p>
                                        {proj.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{proj.description}</p>}
                                        
                                        <div className="mb-6 flex items-center gap-3 border-t border-border pt-4">
                                            <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
                                                Code<ExternalLink className="h-3 w-3" /> 
                                            </a>
                                            {proj.liveUrl && (
                                                <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors">
                                                    Demo<ExternalLink className="h-3 w-3" /> 
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleProjectStatusUpdate(proj.studentId, proj.projectId, 'Approved')} className="inline-flex flex-1 items-center justify-center rounded-md text-xs font-medium bg-success text-success-foreground hover:bg-success/90 h-9 gap-2 transition-colors">
                                            <CheckCircle2 className="h-4 w-4" /> Approve
                                        </button>
                                        <button onClick={() => handleProjectStatusUpdate(proj.studentId, proj.projectId, 'Rejected')} className="inline-flex flex-1 items-center justify-center rounded-md border border-destructive bg-transparent hover:bg-destructive/10 text-destructive text-xs font-medium h-9 gap-2 transition-colors">
                                            <XCircle className="h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rounded-xl border border-border bg-card shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                        <h3 className="font-display text-base font-semibold text-card-foreground">Student Performance</h3>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <select
                                    value={selectedStudent || ""}
                                    onChange={(e) => setSelectedStudent(e.target.value || null)}
                                    className="appearance-none rounded-lg border border-input bg-background py-2 pl-3 pr-8 text-sm outline-none transition-colors focus:border-primary"
                                >
                                    <option value="">Select for PDF…</option>
                                    {students.map((s, idx) => (
                                        <option key={s.id || s._id || `opt-${idx}`} value={s.id || s._id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            {reportStudent && <AcademicReportPDF student={reportStudent} />}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="rounded-lg border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/50">
                                    {[["Name", "name"], ["Email", "email"], ["Attendance", "attendance"], ["SGPA", "sgpa"], ["CGPA", "cgpa"], ["Status", "status"]].map(([label, key]) => (
                                        <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            {key === "name" || key === "cgpa" || key === "attendance" ? (
                                                <button onClick={() => toggleSort(key)} className="flex items-center gap-1 hover:text-foreground">
                                                    {label} <ArrowUpDown className="h-3 w-3" />
                                                </button>
                                            ) : label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((s, idx) => (
                                    <tr key={s.id || s._id || `row-${idx}`} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.email}</td>
                                        <td className="px-5 py-3.5 text-sm text-foreground">
                                            <span className={(s.attendance || 0) < 65 ? "font-semibold text-destructive" : ""}>{s.attendance || 0}%</span>
                                        </td>
                                        <td className="px-5 py-3.5 text-sm text-foreground">
                                            {s.semesters && s.semesters.length > 0 ? (s.semesters[s.semesters.length - 1]?.sgpa || 0).toFixed(1) : "N/A"}
                                        </td>
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{(s.cgpa || 0).toFixed(1)}</td>
                                        <td className="px-5 py-3.5">{getRiskBadge(s)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FacultyDashboard;
