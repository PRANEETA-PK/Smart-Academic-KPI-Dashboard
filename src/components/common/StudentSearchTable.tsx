import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, GraduationCap, TrendingUp, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const clean = envUrl.endsWith("/api") ? envUrl.slice(0, -4) : envUrl;
const API_URL = `${clean}/api`;

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  yearOfStudy: number;
  cgpa: number;
  attendance: number;
  backlogs: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const DEPARTMENTS = ["CSE", "ECE", "ME", "CE", "EEE", "IT"];
const YEARS = [1, 2, 3, 4];

const StudentSearchTable: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchStudents = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(department && { department }),
        ...(yearOfStudy && { yearOfStudy }),
      });

      const res = await fetch(`${API_URL}/admin/students?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStudents(data.students);
        setPagination(data.pagination);
      } else {
        toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Server connection failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, department, yearOfStudy, toast]);

  // Re-fetch whenever filters change, resetting to page 1
  useEffect(() => {
    fetchStudents(1);
  }, [debouncedSearch, department, yearOfStudy, fetchStudents]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchStudents(newPage);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden page-enter">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Student Registry
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {pagination.total} students · Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="student-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, roll number, email..."
              className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Department Filter */}
          <select
            id="filter-department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            id="filter-year"
            value={yearOfStudy}
            onChange={(e) => setYearOfStudy(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            <option value="">All Years</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>Year {y}</option>
            ))}
          </select>

          {/* Clear Filters */}
          {(search || department || yearOfStudy) && (
            <button
              onClick={() => { setSearch(""); setDepartment(""); setYearOfStudy(""); }}
              className="rounded-xl border border-border px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Student</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Roll No.</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Department</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Year</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">CGPA</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Attendance</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Backlogs</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="skeleton h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <GraduationCap className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No students found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((s) => {
                const isAtRisk = s.attendance < 75 || s.cgpa < 5.0;
                return (
                  <tr
                    key={s._id}
                    className={`border-b border-border last:border-0 transition-colors hover:bg-muted/10 ${isAtRisk ? "bg-destructive/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{s.rollNumber}</td>
                    <td className="px-6 py-4 text-sm">{s.department}</td>
                    <td className="px-6 py-4 text-sm">Year {s.yearOfStudy}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${s.cgpa >= 8 ? "text-success" : s.cgpa >= 6 ? "text-primary" : "text-destructive"}`}>
                        {Number(s.cgpa).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${s.attendance >= 75 ? "text-success" : "text-destructive"}`}>
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${s.backlogs === 0 ? "text-success" : "text-destructive"}`}>
                        {s.backlogs}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {isAtRisk ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold uppercase text-destructive">
                          <AlertTriangle className="h-2.5 w-2.5" /> At Risk
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                          <TrendingUp className="h-2.5 w-2.5" /> Good
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
          <p className="text-xs text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
          </p>
          <div className="flex items-center gap-1">
            <button
              id="pagination-prev"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                      p === pagination.page
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              id="pagination-next"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSearchTable;
