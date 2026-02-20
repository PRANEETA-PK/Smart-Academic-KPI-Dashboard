import React, { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import KPICard from "@/components/common/KPICard";
import { students, faculty } from "@/data/mockData";
import { Users, GraduationCap, TrendingUp, AlertTriangle, Search, ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "cgpa" | "attendance">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();

  const atRiskStudents = students.filter((s) => s.cgpa < 6 || s.attendance < 65);
  const avgCGPA = (students.reduce((sum, s) => sum + s.cgpa, 0) / students.length).toFixed(2);

  const filteredStudents = useMemo(() => {
    let list = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === "string" && typeof valB === "string")
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortDir === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
    return list;
  }, [search, sortKey, sortDir]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const handleEdit = (name: string) => {
    toast({ title: "Edit Student", description: `Editing ${name} (simulation)` });
  };

  const handleDelete = (name: string) => {
    toast({ title: "Delete Student", description: `Deleted ${name} (simulation)`, variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">System Administration Overview</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Students" value={students.length} icon={Users} variant="primary" />
          <KPICard title="Total Faculty" value={faculty.length} icon={GraduationCap} variant="success" />
          <KPICard title="Average CGPA" value={avgCGPA} icon={TrendingUp} variant="primary" />
          <KPICard title="At-risk Students" value={atRiskStudents.length} icon={AlertTriangle} variant="destructive" trend="CGPA < 6 or Attendance < 65%" />
        </div>

        <div className="rounded-xl border border-border bg-card shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <h3 className="font-display text-base font-semibold text-card-foreground">Student Management</h3>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {([
                    ["Name", "name"],
                    ["Email", "email"],
                    ["Roll No", "rollNumber"],
                    ["Attendance", "attendance"],
                    ["CGPA", "cgpa"],
                    ["Actions", "actions"],
                  ] as const).map(([label, key]) => (
                    <th key={label} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {key === "name" || key === "cgpa" || key === "attendance" ? (
                        <button onClick={() => toggleSort(key as any)} className="flex items-center gap-1 hover:text-foreground">
                          {label} <ArrowUpDown className="h-3 w-3" />
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="border-b border-border transition-colors last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.rollNumber}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">
                      <span className={s.attendance < 65 ? "font-semibold text-destructive" : ""}>{s.attendance}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.cgpa.toFixed(1)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(s.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.name)}
                          className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
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

export default AdminDashboard;
