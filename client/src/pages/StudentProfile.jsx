import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { studentService } from "@/services/studentService";
import { User, Mail, Hash, Building, CalendarCheck, Award, Loader2, ChevronDown, ChevronUp } from "lucide-react";

const StudentProfile = () => {
    const { user } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSemester, setExpandedSemester] = useState(null);

    const toggleSemester = (semesterName) => {
        setExpandedSemester(expandedSemester === semesterName ? null : semesterName);
    };

    useEffect(() => {
        const fetchStudent = async () => {
            if (user?.email) {
                const data = await studentService.getStudentByEmail(user.email);
                setStudent(data);
            }
            setLoading(false);
        };
        fetchStudent();
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col h-screen w-full items-center justify-center bg-background p-4 text-center">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-muted-foreground mb-4">Student profile not found.</p>
                </div>
            </div>
        );
    }

    const yearOfStudy = student.yearOfStudy || Math.ceil((student.semesters?.length || 0) / 2) || 1;

    const infoItems = [
        { icon: User, label: "Full Name", value: student.name },
        { icon: Hash, label: "Roll Number", value: student.rollNumber },
        { icon: Building, label: "Department", value: student.department },
        { icon: Mail, label: "Email", value: student.email },
        { icon: CalendarCheck, label: "Attendance", value: `${student.attendance || 0}%` },
        { icon: Award, label: "CGPA", value: (student.cgpa || 0).toFixed(2) },
    ];

    return (
        <div className="min-h-screen bg-background pb-12">
            <Navbar />
            <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <div className="animate-slide-up">
                    <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-glow-soft">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
                                {student.name?.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                                <h1 className="font-display text-2xl font-bold text-foreground">{student.name}</h1>
                                <p className="text-sm text-muted-foreground">{student.department} · {student.rollNumber} · Year {yearOfStudy}</p>
                                <div className="mt-2 flex gap-2">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${(student.cgpa || 0) >= 8 ? "bg-success/10 text-success" : (student.cgpa || 0) >= 6 ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
                                        }`}>
                                        CGPA: {(student.cgpa || 0).toFixed(1)}
                                    </span>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${(student.attendance || 0) >= 75 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                                        }`}>
                                        Attendance: {student.attendance || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {infoItems.map(({ icon: Icon, label, value }) => (
                            <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-glow-soft transition-all">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                                    <p className="text-sm font-semibold text-foreground">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                        <h2 className="mb-4 font-display text-lg font-bold text-foreground">Academic Summary</h2>
                        <div className="space-y-3">
                            {student.semesters && student.semesters.length > 0 ? (
                                student.semesters.map((sem) => (
                                    <div key={sem.semesterName} className="overflow-hidden rounded-lg border border-border bg-muted/30 transition-all">
                                        <div
                                            onClick={() => toggleSemester(sem.semesterName)}
                                            className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                {expandedSemester === sem.semesterName ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="text-sm font-medium text-foreground">{sem.semesterName}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-muted-foreground">{sem.subjects?.length || 0} subjects</span>
                                                <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${sem.sgpa >= 8 ? "bg-success/10 text-success" : sem.sgpa >= 6 ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
                                                    }`}>
                                                    {(sem.sgpa || 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {expandedSemester === sem.semesterName && (
                                            <div className="border-t border-border bg-muted/10 px-4 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                        <span>Subject</span>
                                                        <span className="text-right">Marks</span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {sem.subjects && sem.subjects.length > 0 ? (
                                                            sem.subjects.map((subject, idx) => (
                                                                <div key={idx} className="grid grid-cols-2 text-sm py-1 border-b border-border/50 last:border-0">
                                                                    <span className="text-foreground/90">{subject.subjectName}</span>
                                                                    <span className="text-right font-semibold text-foreground">{subject.marks}</span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No subject data available.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No semester data available.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentProfile;
