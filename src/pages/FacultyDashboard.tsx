import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { FacultyAlerts } from "@/components/common/SmartAlerts";
import AcademicReportPDF from "@/components/common/AcademicReportPDF";
import { useAuth } from "@/context/AuthContext";
import { Users, TrendingUp, AlertTriangle, Search, ArrowUpDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const FacultyDashboard = () => {
  const { token } = useAuth();
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "cgpa" | "attendance">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/students", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudentsList(data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStudents();
  }, [token]);

  const stats = useMemo(() => {
    if (studentsList.length === 0) return { avgCGPA: "0", atRiskCount: 0 };
    const avg = (studentsList.reduce((sum, s) => sum + (s.cgpa || 0), 0) / studentsList.length).toFixed(2);
    const atRisk = studentsList.filter(s => s.cgpa < 6 || s.attendance < 75).length;
    return { avgCGPA: avg, atRiskCount: atRisk };
  }, [studentsList]);

  const filteredStudents = useMemo(() => {
    let list = [...studentsList].filter(
      (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "string" && typeof valB === "string") return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortDir === "asc" ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
    });
    return list;
  }, [studentsList, search, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const getRiskBadge = (s: any) => {
    if (s.cgpa < 6 || s.attendance < 75)
      return <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">At Risk</span>;
    if (s.cgpa < 7)
      return <span className="inline-flex items-center rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">Monitor</span>;
    return <span className="inline-flex items-center rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">Good</span>;
  };

  const academicDist = [
    { range: "< 6.5", count: studentsList.filter(s => s.cgpa < 6.5).length },
    { range: "6.5-7.5", count: studentsList.filter(s => s.cgpa >= 6.5 && s.cgpa < 7.5).length },
    { range: "7.5-8.5", count: studentsList.filter(s => s.cgpa >= 7.5 && s.cgpa < 8.5).length },
    { range: "8.5+", count: studentsList.filter(s => s.cgpa >= 8.5).length },
  ];

  const reportStudent = selectedStudentId ? studentsList.find(s => s._id === selectedStudentId) : null;

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-fade-in flex justify-between items-end">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Faculty Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">{studentsList[0]?.department || "University"} Department Overview</p>
          </div>
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search students..."
              className="bg-card border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KPICard title="Total Students" value={studentsList.length} icon={Users} variant="primary" />
          <KPICard title="Average CGPA" value={stats.avgCGPA} icon={TrendingUp} variant="success" />
          <KPICard title="At-risk Students" value={stats.atRiskCount} icon={AlertTriangle} variant="destructive" trend="CGPA < 6 or Att < 75%" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-glow-soft">
            <h3 className="mb-6 font-display font-semibold text-lg">CGPA Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={academicDist}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.2)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h3 className="mb-6 font-display font-semibold text-lg">Student Performance List</h3>
            <div className="flex gap-4 mb-4">
              <select
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none"
                onChange={(e) => setSelectedStudentId(e.target.value)}
                value={selectedStudentId || ""}
              >
                <option value="">Select Student for PDF</option>
                {studentsList.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              {reportStudent && <AcademicReportPDF student={reportStudent} />}
            </div>
            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-card border-b border-border z-10">
                  <tr>
                    <th className="text-left py-2 text-xs font-bold uppercase text-muted-foreground px-2">Name</th>
                    <th className="text-left py-2 text-xs font-bold uppercase text-muted-foreground px-2">Attendance</th>
                    <th className="text-left py-2 text-xs font-bold uppercase text-muted-foreground px-2">CGPA</th>
                    <th className="text-right py-2 text-xs font-bold uppercase text-muted-foreground px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(s => (
                    <tr key={s._id} className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-2">
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground">{s.rollNumber}</p>
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <span className={s.attendance < 75 ? "text-destructive font-bold" : ""}>{s.attendance}%</span>
                      </td>
                      <td className="py-3 px-2 text-sm font-bold">{s.cgpa}</td>
                      <td className="py-3 px-2 text-right">{getRiskBadge(s)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <FacultyAlerts students={studentsList} />
        </div>
      </main>
    </div>
  );
};

export default FacultyDashboard;
