import React, { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  GraduationCap,
  TrendingUp,
  AlertTriangle,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  Activity,
  BookOpen,
  ShieldCheck,
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentSearchTable from "@/components/common/StudentSearchTable";

// Mock data as fallback
const initialMockStats = {
  kpis: { totalStudents: 0, avgInstitutionalCGPA: 0, facultyToStudentRatio: "0", totalAttendance: 0 },
  departmentalCGPA: [],
  atRiskStudents: [],
  syllabusProgress: [],
  attendanceTrend: [
    { day: "Mon", attendance: 92 },
    { day: "Tue", attendance: 88 },
    { day: "Wed", attendance: 90 },
    { day: "Thu", attendance: 85 },
    { day: "Fri", attendance: 78 },
  ]
};

const GaugeChart = ({ value, max = 10, label }: { value: number; max?: number; label: string }) => {
  const data = [{ value: Number(value) }, { value: max - Number(value) }];
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill="hsl(var(--primary))" />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="-mt-8 text-center">
        <span className="text-2xl font-bold">{value}</span>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(initialMockStats);
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { "Authorization": `Bearer ${token}` };

        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const [statsRes, logsRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/admin/stats`, { headers }),
          fetch(`${API_URL}/admin/audit-logs`, { headers }),
          fetch(`${API_URL}/admin/users`, { headers })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(prev => ({ ...prev, ...statsData }));
        }

        if (logsRes.ok) setAuditLogs(await logsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  const handleNotifyRisk = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/notify-risk`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ studentIds: stats.atRiskStudents.map(s => s.id) })
      });

      if (res.ok) {
        toast({ title: "Notifications Sent", description: "All at-risk students have been alerted." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to send notifications", variant: "destructive" });
    }
  };

  const toggleUserStatus = async (user: any) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/users/${user._id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ active: user.active === false ? true : false })
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === user._id ? updated : u));
        toast({ title: "Status Updated", description: `${user.name} is now ${updated.active !== false ? "Active" : "Inactive"}.` });
      }
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const toggleAdmin = async (user: any) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_URL}/admin/users/${user._id}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ role: user.role === "admin" ? "student" : "admin" })
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map(u => u._id === user._id ? updated : u));
        toast({ title: "Permissions Updated", description: `${user.name}'s role changed to ${updated.role}.` });
      }
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const handleAction = (action: string, user: string) => {
    toast({ title: `Action: ${action}`, description: `Target: ${user}` });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Header section with glassmorphism effect */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-gradient-to-r from-primary/10 via-background to-background p-6 shadow-glow-soft animate-fade-in">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Admin Command Center</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> Institutional Oversight & Governance
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition-all">
                <Activity className="h-4 w-4" /> System Health
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary Block */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Enrollment" value={stats.kpis.totalStudents} icon={Users} variant="primary" trend="+2.4% vs last year" />
          <KPICard title="Institutional CGPA" value={stats.kpis.avgInstitutionalCGPA} icon={TrendingUp} variant="success" trend="Top 5% region" />
          <KPICard title="Faculty Ratio" value={stats.kpis.facultyToStudentRatio} icon={GraduationCap} variant="primary" />
          <KPICard title="Daily Engagement" value={`${stats.kpis.totalAttendance}%`} icon={Activity} variant="warning" trend="Yesterday: 86%" />
        </div>

        <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[500px] lg:grid-cols-5 bg-muted/50 p-1">
            <TabsTrigger value="overview">Insights</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="users">Master</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Departmental Performance Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow-soft transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Departmental Health</h3>
                  <div className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-bold text-primary uppercase">Bar Chart</div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.departmentalCGPA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 10]} />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                    />
                    <Bar dataKey="avgCGPA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Engagement Trend Chart */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow-soft transition-all">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Engagement Monitor</h3>
                  <div className="rounded-lg bg-warning/10 px-2 py-1 text-[10px] font-bold text-warning uppercase">Trend Line</div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.attendanceTrend}>
                    <defs>
                      <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} domain={[60, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorAttend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gauge Row */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-card">
                <GaugeChart value={stats.kpis.avgInstitutionalCGPA} label="Institutional Health (CGPA)" />
              </div>
              <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-card overflow-hidden">
                <h3 className="mb-4 font-display font-semibold">Departmental Rank</h3>
                <div className="space-y-4">
                  {[...stats.departmentalCGPA].sort((a, b) => b.avgCGPA - a.avgCGPA).map((dept, i) => (
                    <div key={dept.department} className="flex items-center gap-4">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted"}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{dept.department}</span>
                          <span className="text-muted-foreground">{dept.avgCGPA} / 10</span>
                        </div>
                        <Progress value={dept.avgCGPA * 10} className="h-2" />
                      </div>
                    </div>
                  ))}
                  {stats.departmentalCGPA.length === 0 && <p className="text-center text-muted-foreground py-8">No departmental data available</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="risk" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6 bg-muted/30">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" /> Early Warning System
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Students with Attendance &lt; 75% or SGPA &lt; 5.0</p>
                </div>
                <button
                  onClick={handleNotifyRisk}
                  className="flex items-center gap-2 rounded-xl bg-destructive px-5 py-2 text-sm font-semibold text-white shadow-glow-destructive hover:opacity-90 transition-all active:scale-95"
                >
                  <Bell className="h-4 w-4" /> Notify All At-Risk
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Roll Number</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Attendance</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">SGPA/CGPA</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase text-muted-foreground">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.atRiskStudents.map((s) => (
                      <tr key={s.id} className="border-b border-border transition-colors hover:bg-muted/10 last:border-0">
                        <td className="px-6 py-4 text-sm font-semibold">{s.name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{s.rollNumber}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="text-destructive font-bold">{s.attendance}%</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-destructive">{s.cgpa}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.attendance < 65 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"}`}>
                            {s.attendance < 65 ? "Critical" : "High Risk"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {stats.atRiskStudents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No at-risk students found. Great!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faculty" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
              <div className="border-b border-border p-6 bg-muted/30">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Resource Tracker (Faculty Oversight)
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Syllabus Progress: Lessons Planned vs Completed</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stats.syllabusProgress.map((f) => {
                    // Flatten progress for display (taking first subject for demo)
                    const p = f.progress[0] || { subject: 'N/A', planned: 0, completed: 0, percentage: 0 };
                    return (
                      <div key={f.name} className="rounded-xl border border-border p-5 space-y-4 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{f.name}</h4>
                            <p className="text-xs text-muted-foreground">{f.department} • {p.subject}</p>
                          </div>
                          <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${Number(p.percentage) < 50 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                            {Number(p.percentage) < 50 ? "LAGGING" : "ON TRACK"}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span className="font-bold">{p.completed} / {p.planned} Lessons</span>
                          </div>
                          <Progress value={Number(p.percentage)} className={`h-2 ${Number(p.percentage) < 50 ? "bg-destructive/20" : ""}`} />
                        </div>
                      </div>
                    );
                  })}
                  {stats.syllabusProgress.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">No faculty progress data</p>}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StudentSearchTable />
          </TabsContent>

          <TabsContent value="users" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-8">
              {/* Master User Table */}
              <div className="rounded-2xl border border-border bg-card shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
                  <h3 className="font-display text-lg font-semibold">Master User Management</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Filter by name, role, dept..."
                      className="rounded-xl border border-input bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Department</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Admin Access</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase text-muted-foreground">Control</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.email} className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{u.name}</span>
                              <span className="text-xs text-muted-foreground">{u.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium capitalize">{u.role}</td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">{u.department || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <Switch
                              checked={u.role === "admin"}
                              onCheckedChange={() => toggleAdmin(u)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${u.active !== false ? "bg-success" : "bg-destructive"}`}></span>
                              <span className="text-xs font-medium uppercase tracking-wider">{u.active !== false ? "Active" : "Inactive"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleAction("Edit", u.name)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                              {u.active !== false ? (
                                <button onClick={() => toggleUserStatus(u)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><UserX className="h-4 w-4" /></button>
                              ) : (
                                <button onClick={() => toggleUserStatus(u)} className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors"><UserCheck className="h-4 w-4" /></button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Log */}
              <div className="rounded-2xl border border-border bg-card shadow-card">
                <div className="border-b border-border p-6 bg-muted/20">
                  <h3 className="font-display font-semibold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" /> Admin Audit Logs (Recent Actions)
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  {auditLogs.map((log, i) => (
                    <div key={log._id} className="relative flex gap-4 pl-6 after:absolute after:left-[11px] after:top-8 after:h-full after:w-[1px] after:bg-border last:after:hidden">
                      <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-muted shadow-sm z-10">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold text-foreground">
                            {log.action} <span className="text-muted-foreground font-normal">by</span> Admin
                          </p>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                        {log.targetName && <p className="text-[10px] text-primary mt-1">Target: {log.targetName}</p>}
                      </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && <p className="text-center text-muted-foreground py-4">No audit logs found</p>}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
