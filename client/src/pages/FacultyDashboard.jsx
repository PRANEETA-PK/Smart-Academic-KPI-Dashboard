import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { FacultyAlerts } from "@/components/common/SmartAlerts";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import { studentService } from "@/services/studentService";
import { Users, TrendingUp, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const FacultyDashboard = () => {
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState("asc");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await studentService.getAllStudents();
                setStudents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch students:", err);
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
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
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
                                {filteredStudents.map((s) => (
                                    <tr key={s.id || s._id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
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
