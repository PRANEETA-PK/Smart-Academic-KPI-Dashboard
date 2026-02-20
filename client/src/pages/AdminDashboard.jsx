import React from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { Users, BookOpen, GraduationCap, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const AdminDashboard = () => {
    // Mock data for Admin Dashboard
    const yearlyPerformance = [
        { year: "2020", avgCGPA: 7.8 },
        { year: "2021", avgCGPA: 7.9 },
        { year: "2022", avgCGPA: 8.1 },
        { year: "2023", avgCGPA: 8.0 },
        { year: "2024", avgCGPA: 8.2 },
    ];

    const departmentStats = [
        { dept: "CS", students: 120, avg: 8.2 },
        { dept: "IT", students: 100, avg: 7.9 },
        { dept: "ECE", students: 90, avg: 7.8 },
        { dept: "EEE", students: 80, avg: 7.5 },
        { dept: "Mech", students: 110, avg: 7.4 },
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                <div className="mb-8 animate-fade-in">
                    <h1 className="font-display text-2xl font-bold text-foreground">Administrative Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Institutional Overview & Analytics</p>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KPICard title="Total Students" value={500} icon={Users} variant="primary" trend="+5% from last year" />
                    <KPICard title="Total Faculty" value={45} icon={BookOpen} variant="default" trend="Stable" />
                    <KPICard title="Avg Institutional CGPA" value={7.96} icon={GraduationCap} variant="success" trend="+0.12" />
                    <KPICard title="Placement Rate" value="92%" icon={TrendingUp} variant="success" trend="+2%" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow">
                        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Yearly API Performance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={yearlyPerformance}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
                                <XAxis dataKey="year" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <YAxis domain={[6, 10]} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)" }} />
                                <Line type="monotone" dataKey="avgCGPA" stroke="hsl(184 42% 50%)" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow">
                        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Department-wise Performance</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={departmentStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
                                <XAxis dataKey="dept" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)" }} />
                                <Bar dataKey="avg" fill="hsl(0 72% 55%)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5 text-primary" />
                        <h3 className="font-display text-lg font-bold text-card-foreground">System Alerts</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-warning/10 px-4 py-3 text-warning">
                            <span className="text-sm font-medium">Mechanical Dept. attendance average dropped below 70%.</span>
                            <button className="text-xs font-bold underline hover:no-underline">View Details</button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-3 text-success">
                            <span className="text-sm font-medium">Computer Science Dept. achieved 98% placement rate.</span>
                            <button className="text-xs font-bold underline hover:no-underline">View Details</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
