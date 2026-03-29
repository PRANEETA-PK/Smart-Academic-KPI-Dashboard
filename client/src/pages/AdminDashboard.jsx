import React, { useState, useEffect, useMemo } from "react";
import { adminService } from "@/services/adminService";
import { studentService } from "@/services/studentService";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import {
    Users, BookOpen, GraduationCap, TrendingUp, Activity,
    Search, History, BarChart2, ShieldCheck,
    FileUp, Mail, AlertCircle, Trash2,
    LayoutGrid, List, UserCog, ExternalLink, ArrowRight, Code, CheckCircle2, XCircle
} from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [bulkData, setBulkData] = useState("");
    const [uploading, setUploading] = useState(false);
    const [logSearch, setLogSearch] = useState("");
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 8;

    // New Staff State
    const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
    const [newStaff, setNewStaff] = useState({
        name: "",
        email: "",
        password: "faculty123",
        department: "Computer Science",
        designation: "Assistant Professor"
    });

    // Notification State
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageData, setMessageData] = useState({
        title: "",
        message: "",
        type: "Message"
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [statsData, usersData, logsData] = await Promise.all([
            adminService.getStats(),
            adminService.getAllUsers(),
            adminService.getAuditLogs()
        ]);
        setStats(statsData);
        setUsers(usersData);
        setAuditLogs(logsData);
        setLoading(false);
    };

    const handleBulkUpload = async () => {
        if (!bulkData.trim()) return;
        setUploading(true);
        try {
            const data = JSON.parse(bulkData);
            const res = await studentService.bulkUpload(data);
            toast.success(res.message);
            setBulkData("");
            fetchData();
        } catch (error) {
            toast.error(error.message || "Failed to parse JSON");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you absolutely sure you want to delete ${userName}? This action cannot be undone.`)) {
            try {
                const res = await adminService.deleteUser(userId);
                toast.success(res.message || "User deleted successfully");
                fetchData(); // Refresh the list
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to delete user");
            }
        }
    };

    const handleExportCSV = () => {
        if (!users || users.length === 0) return;

        const headers = ["Name", "Email", "Role", "Department", "Status"];
        const rows = users.map(u => [
            u.name,
            u.email,
            u.role,
            u.department || "N/A",
            u.active !== false ? "Active" : "Inactive"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `university_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("User list exported successfully");
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await adminService.createFaculty(newStaff);
            toast.success("New faculty member added successfully");
            setIsAddStaffOpen(false);
            setNewStaff({
                name: "",
                email: "",
                password: "faculty123",
                department: "Computer Science",
                designation: "Assistant Professor"
            });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add staff member");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (isSendingEmail) return;
        setIsSendingEmail(true);
        try {
            const res = await adminService.sendNotification({
                recipientId: selectedUser._id,
                ...messageData
            });
            toast.success(`📧 Email delivered to ${selectedUser.email}`);
            setIsMessageOpen(false);
            setMessageData({ title: "", message: "", type: "Message" });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to deliver email. Check GMAIL settings.");
        } finally {
            setIsSendingEmail(false);
        }
    };

    const handleUpdateStatus = async (userId, isCurrentlyActive) => {
        try {
            const newStatus = !isCurrentlyActive;
            console.log(`[Toggle] User ${userId} changing active status from ${isCurrentlyActive} -> ${newStatus}`);

            // Optimistically update instantly so UI reacts without waiting for HTTP response
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, active: newStatus } : u));

            await adminService.updateUserStatus(userId, { active: newStatus });
            toast.success(`User ${newStatus ? 'Access Restored (Active)' : 'Access Blocked (Locked)'}`);

            // Background sync
            fetchData();
        } catch (error) {
            console.error('Status toggle error:', error);
            toast.error("Status modification failed. " + (error.response?.data?.message || ''));
            // Revert on failure
            fetchData();
        }
    };

    const handleDownloadTemplate = () => {
        const template = [
            {
                name: "Full Name",
                email: "example@univ.edu",
                rollNumber: "REG12345",
                department: "Computer Science",
                role: "student"
            }
        ];
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "student_upload_template.json";
        link.click();
        toast.info("Integration template downloaded");
    };

    const filteredUsers = useMemo(() => {
        return (users || []).filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * usersPerPage;
        return filteredUsers.slice(startIndex, startIndex + usersPerPage);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredLogs = useMemo(() => {
        return (auditLogs || []).filter(log =>
            (log.action || "").toLowerCase().includes(logSearch.toLowerCase()) ||
            (log.details || "").toLowerCase().includes(logSearch.toLowerCase()) ||
            (log.targetName || "").toLowerCase().includes(logSearch.toLowerCase())
        );
    }, [auditLogs, logSearch]);

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F'];

    if (loading && !stats) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="text-sm font-medium text-muted-foreground">Initializing Admin Terminal...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {/* Header Area */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="animate-slide-up">
                        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Institutional Pulse</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Global Control Room & Institutional Intelligence</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="gap-2" onClick={fetchData}>
                            <Activity className="h-4 w-4" /> Refresh Data
                        </Button>
                        <Button className="gap-2 bg-primary">
                            <ShieldCheck className="h-4 w-4" /> System Health: Optimal
                        </Button>
                    </div>
                </div>

                {/* KPI Value Cards */}
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in delay-100">
                    <KPICard title="Total Enrollment" value={stats?.kpis?.totalStudents || 0} icon={Users} variant="primary" trend="+5.2% Annual Growth" />
                    <KPICard title="Institutional CGPA" value={stats?.kpis?.avgInstitutionalCGPA || 0} icon={GraduationCap} variant="success" trend="Global Average" />
                    <KPICard title="Student-Faculty Ratio" value={`${stats?.kpis?.facultyToStudentRatio || 0}:1`} icon={BookOpen} variant="default" trend="Target 15:1" />
                    <KPICard title="Avg Attendance" value={`${stats?.kpis?.totalAttendance || 0}%`} icon={TrendingUp} variant={stats?.kpis?.totalAttendance < 75 ? "destructive" : "success"} trend="Live Engagement" />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-card border p-1 rounded-xl h-12 w-full max-w-md">
                        <TabsTrigger value="overview" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-primary">
                            <LayoutGrid className="h-4 w-4" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="users" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-primary">
                            <UserCog className="h-4 w-4" /> Management
                        </TabsTrigger>
                        <TabsTrigger value="audits" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-primary">
                            <History className="h-4 w-4" /> Audits
                        </TabsTrigger>
                        <TabsTrigger value="upload" className="flex-1 gap-2 rounded-lg data-[state=active]:bg-primary">
                            <FileUp className="h-4 w-4" /> Bulk Data
                        </TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-6">
                                {/* Performance Comparison Area */}
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-glow-soft transition-all">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-foreground">Department Performance Heatmap</h3>
                                            <p className="text-xs text-muted-foreground">Comparative CGPA analysis across faculties</p>
                                        </div>
                                        <BarChart2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <BarChart data={stats?.departmentalCGPA || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                            <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                                            <YAxis domain={[0, 10]} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="avgCGPA" radius={[6, 6, 0, 0]}>
                                                {(stats?.departmentalCGPA || []).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Enrollment Growth Plot */}
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-display text-lg font-bold text-foreground">Attendance Trends (Last 5 Days)</h3>
                                        <TrendingUp className="h-5 w-5 text-success" />
                                    </div>
                                    <ResponsiveContainer width="100%" height={280}>
                                        <AreaChart data={stats?.attendanceTrend || []}>
                                            <defs>
                                                <linearGradient id="colorAttend" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="day" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorAttend)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Notification Center */}
                                <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
                                    <div className="p-4 bg-primary/5 border-b border-border flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Notification Center</h3>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10 mb-4">
                                            <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
                                                <ShieldCheck className="h-3 w-3" /> System Insight
                                            </p>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                All systems operational. Monitoring academic progress and institutional performance across all departments.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Syllabus Completion</h4>
                                            {(stats?.syllabusProgress || []).slice(0, 3).map((fac, i) => (
                                                <div key={i} className="p-2 rounded-lg bg-muted/30">
                                                    <div className="flex items-center justify-between text-xs mb-1.5">
                                                        <span className="font-medium text-foreground truncate max-w-[120px]">{fac.name}</span>
                                                        <span className="text-muted-foreground font-bold">{fac.progress?.[0]?.percentage || 0}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary"
                                                            style={{ width: `${fac.progress?.[0]?.percentage || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/20 border-t border-border flex justify-center">
                                        <p className="text-[10px] font-medium text-muted-foreground italic">
                                            Live academic data from institutional database
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* USER MANAGEMENT TAB */}
                    <TabsContent value="users" className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-2xl border border-border bg-card shadow-lg">
                            <div className="p-6 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search Users by Name or Email..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="gap-1" onClick={handleExportCSV}>
                                        <List className="h-3.5 w-3.5" /> Export Lists
                                    </Button>

                                    <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="gap-1">
                                                <Users className="h-3.5 w-3.5" /> Add New Staff
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Add New Faculty Member</DialogTitle>
                                                <DialogDescription>
                                                    Create a new faculty account. They will be assigned to a specific department.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form onSubmit={handleAddStaff} className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="name" className="text-right text-xs">Name</Label>
                                                    <Input
                                                        id="name"
                                                        className="col-span-3 h-8 text-xs"
                                                        value={newStaff.name}
                                                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="email" className="text-right text-xs">Email</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        className="col-span-3 h-8 text-xs"
                                                        value={newStaff.email}
                                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="dept" className="text-right text-xs">Dept</Label>
                                                    <div className="col-span-3">
                                                        <Select
                                                            value={newStaff.department}
                                                            onValueChange={(val) => setNewStaff({ ...newStaff, department: val })}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Select Department" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Computer Science">Computer Science</SelectItem>
                                                                <SelectItem value="Electronic & Communication">Electronics</SelectItem>
                                                                <SelectItem value="Mechanical Engineering">Mechanical</SelectItem>
                                                                <SelectItem value="Information Technology">Information Tech</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="desig" className="text-right text-xs">Designation</Label>
                                                    <Input
                                                        id="desig"
                                                        className="col-span-3 h-8 text-xs"
                                                        value={newStaff.designation}
                                                        onChange={(e) => setNewStaff({ ...newStaff, designation: e.target.value })}
                                                        placeholder="e.g. Professor"
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" className="w-full mt-2 h-9 text-xs uppercase font-bold tracking-wider">Create Account</Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-muted/50 border-b border-border">
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User Identity</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Primary Role</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Allocation</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">System Auth</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredUsers.length > 0 ? (
                                            paginatedUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                                                                {user.name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                                                                <p className="text-[10px] text-muted-foreground">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-amber-500/10 text-amber-500' :
                                                            user.role === 'faculty' ? 'bg-purple-500/10 text-purple-500' :
                                                                'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-foreground/80 font-medium">
                                                        {user.department || 'GLOBAL'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div
                                                            role="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdateStatus(user._id, user.active !== false);
                                                            }}
                                                            className="flex w-fit items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:opacity-80 cursor-pointer"
                                                            style={{
                                                                borderColor: user.active !== false ? 'rgba(34,197,94,0.4)' : 'rgba(100,100,100,0.3)',
                                                                background: user.active !== false ? 'rgba(34,197,94,0.08)' : 'rgba(100,100,100,0.08)'
                                                            }}
                                                        >
                                                            <span className={`h-2 w-2 rounded-full inline-block ${user.active !== false ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-muted-foreground/40'}`}></span>
                                                            <span className={`text-[10px] uppercase font-bold ${user.active !== false ? 'text-success' : 'text-muted-foreground'}`}>
                                                                {user.active !== false ? 'Active' : 'Locked'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                                                        onClick={() => {
                                                                            setSelectedUser(user);
                                                                            setMessageData({ ...messageData, title: `Regarding Academic Performance: ${user.name}` });
                                                                        }}
                                                                    >
                                                                        <Mail className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-[425px]">
                                                                    <DialogHeader>
                                                                        <DialogTitle className="flex items-center gap-2">
                                                                            <Mail className="h-5 w-5 text-primary" /> Direct Communication
                                                                        </DialogTitle>
                                                                        <DialogDescription>
                                                                            Compose a real email to <span className="font-semibold text-primary">{selectedUser?.email}</span>. It will be delivered to their inbox.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <form onSubmit={handleSendMessage} className="grid gap-4 py-4">
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Message Priority</Label>
                                                                            <Select
                                                                                value={messageData.type}
                                                                                onValueChange={(val) => setMessageData({ ...messageData, type: val })}
                                                                            >
                                                                                <SelectTrigger className="h-9 text-xs">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="Message">Standard Message</SelectItem>
                                                                                    <SelectItem value="Alert">Critical Alert</SelectItem>
                                                                                    <SelectItem value="System">System Record</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Subject Line</Label>
                                                                            <Input
                                                                                value={messageData.title}
                                                                                onChange={(e) => setMessageData({ ...messageData, title: e.target.value })}
                                                                                className="h-9 text-xs"
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Body Content</Label>
                                                                            <textarea
                                                                                value={messageData.message}
                                                                                onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                                                                                className="w-full min-h-[120px] rounded-lg bg-background border p-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                                                                                placeholder="Type your official message here..."
                                                                                required
                                                                            />
                                                                        </div>
                                                                        <Button type="submit" className="w-full h-10 text-xs font-bold uppercase tracking-widest mt-2">
                                                                            {isSendingEmail ? "Sending Email..." : `📧 Send Email to ${selectedUser?.name}`}
                                                                        </Button>
                                                                    </form>
                                                                </DialogContent>
                                                            </Dialog>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                                onClick={() => handleDeleteUser(user._id, user.name)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-sm text-muted-foreground italic tracking-wide">
                                                    No users matching your specific terminal search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-xs text-muted-foreground font-medium italic">
                                    Displaying entries {(currentPage - 1) * usersPerPage + 1} – {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} total users
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >Previous</Button>
                                    
                                    <div className="flex items-center gap-1 px-3">
                                        <span className="text-xs font-bold text-primary">Page {currentPage}</span>
                                        <span className="text-xs text-muted-foreground">/</span>
                                        <span className="text-xs font-semibold text-muted-foreground">{totalPages}</span>
                                    </div>

                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >Next</Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* AUDITS TAB */}
                    <TabsContent value="audits" className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                        <History className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-lg font-bold text-foreground">System Audit Logs</h3>
                                        <p className="text-xs text-muted-foreground">Historical record of all administrative operations</p>
                                    </div>
                                </div>
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter audit logs..."
                                        className="pl-9 h-9 text-xs"
                                        value={logSearch}
                                        onChange={(e) => setLogSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredLogs.length > 0 ? (
                                    filteredLogs.map((log, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl bg-muted/20 border border-border hover:bg-muted/30 transition-colors group">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <ShieldCheck className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm font-bold text-foreground">{log.action || 'Administrative Action'}</p>
                                                    <p className="text-[10px] font-medium text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">{log.details || 'No additional detail provided'}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-primary uppercase">Triggered By ID: {(log.admin || '').slice(-6)}</span>
                                                    <span className="text-[10px] text-muted-foreground">•</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">TARGET: {log.targetName || 'SYSTEM'}</span>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                                        <ShieldCheck className="h-12 w-12 text-muted/50 mx-auto mb-4" />
                                        <p className="text-sm text-muted-foreground">The system vault is currently empty with no audit trails recorded.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* BULK UPLOAD TAB */}
                    <TabsContent value="upload" className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                                            <FileUp className="h-6 w-6 text-primary-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl font-bold text-foreground">Global Data Ingestion</h3>
                                            <p className="text-sm text-muted-foreground">Upload entire student batches or semester results via JSON integration</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/20">
                                            <h4 className="text-xs font-bold text-foreground uppercase mb-2">JSON Terminal</h4>
                                            <textarea
                                                value={bulkData}
                                                onChange={(e) => setBulkData(e.target.value)}
                                                placeholder='[{"name": "Praneeta", "email": "praneeta.cs3@gmail.com", "rollNumber": "CS2021001", "department": "Computer Science"}]'
                                                className="w-full h-64 rounded-lg bg-background p-4 text-[13px] font-mono outline-none border focus:border-primary transition-all resize-none shadow-inner"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 px-3 py-2 bg-success/5 rounded-lg border border-success/20">
                                                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse"></div>
                                                <span className="text-[10px] font-bold text-success uppercase">Encryption Active: AES-256</span>
                                            </div>
                                            <Button
                                                className="w-full sm:w-auto h-11 px-8 rounded-xl font-bold uppercase tracking-widest"
                                                onClick={handleBulkUpload}
                                                disabled={uploading || !bulkData.trim()}
                                            >
                                                {uploading ? 'Processing Stream...' : 'Commit Batch to Cloud'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/0 border-primary/20 p-6">
                                    <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-primary" /> Integration Guide
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">1</div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Ensure your data follows the strictly defined <b>Student Prototype</b> schema.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">2</div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">The system automatically initializes <b>User Credentials</b> and Department heads.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">3</div>
                                            <p className="text-xs text-muted-foreground leading-relaxed">Batches of up to <b>500 records</b> can be processed in a single commit stream.</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full mt-6 text-xs font-bold gap-2"
                                        onClick={handleDownloadTemplate}
                                    >
                                        Download JSON Template <ArrowRight className="h-3 w-3" />
                                    </Button>
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
