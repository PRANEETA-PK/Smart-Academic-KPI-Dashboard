import React from "react";
import { AlertTriangle, TrendingDown, BookOpen, Bell } from "lucide-react";

// ---- Student Alerts ----
export const StudentAlerts = ({ student }) => {
    if (!student) return null;
    const alerts = [];
    const sems = student.semesters || [];

    if ((student.attendance || 0) < 75) {
        alerts.push({ icon: AlertTriangle, text: `Your attendance is ${student.attendance || 0}% — below the 75% requirement.`, level: "destructive" });
    }

    if (sems.length >= 2) {
        const curr = sems[sems.length - 1]?.sgpa || 0;
        const prev = sems[sems.length - 2]?.sgpa || 0;
        if (curr < prev) {
            alerts.push({ icon: TrendingDown, text: `SGPA dropped from ${prev.toFixed(1)} to ${curr.toFixed(1)} this semester.`, level: "warning" });
        }
    }

    const latestSubjects = sems[sems.length - 1]?.subjects || [];
    const weakSubjects = latestSubjects.filter((s) => (s.marks || 0) < 50);
    weakSubjects.forEach((s) => {
        alerts.push({ icon: BookOpen, text: `${s.subjectName || "Subject"}: ${s.marks || 0} marks — below passing threshold.`, level: "destructive" });
    });

    if (alerts.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-4 w-4 text-primary" />
                    <h3 className="font-display text-base font-semibold text-card-foreground">Smart Alerts</h3>
                </div>
                <div className="rounded-lg bg-success/10 p-3 text-sm font-medium text-success">
                    ✓ No alerts — you're on track! Keep it up.
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
                <Bell className="h-4 w-4 text-destructive" />
                <h3 className="font-display text-base font-semibold text-card-foreground">Smart Alerts</h3>
                <span className="ml-auto rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">{alerts.length}</span>
            </div>
            <div className="space-y-2">
                {alerts.map((a, i) => (
                    <div key={i} className={`flex items-start gap-2 rounded-lg p-3 text-sm font-medium ${a.level === "destructive" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                        }`}>
                        <a.icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        {a.text}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ---- Faculty Alerts ----
export const FacultyAlerts = ({ students = [] }) => {
    const [sentWarnings, setSentWarnings] = React.useState(new Set());
    const validStudents = Array.isArray(students) ? students : [];

    const clusters = [
        {
            level: "Critical",
            color: "text-destructive",
            bgColor: "bg-destructive/10",
            students: validStudents.filter((s) => (s.cgpa || 0) < 5 || (s.attendance || 0) < 55),
        },
        {
            level: "High Risk",
            color: "text-destructive",
            bgColor: "bg-destructive/5",
            students: validStudents.filter((s) => ((s.cgpa || 0) >= 5 && (s.cgpa || 0) < 6) || ((s.attendance || 0) >= 55 && (s.attendance || 0) < 65)),
        },
        {
            level: "Monitor",
            color: "text-warning",
            bgColor: "bg-warning/10",
            students: validStudents.filter((s) => (s.cgpa || 0) >= 6 && (s.cgpa || 0) < 7 && (s.attendance || 0) >= 65),
        },
    ];

    const handleSendWarning = (studentId) => {
        setSentWarnings((prev) => new Set(prev).add(studentId));
    };

    const nonEmptyClusters = clusters.filter((c) => c.students.length > 0);

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <h3 className="font-display text-base font-semibold text-card-foreground">Risk Clusters & Alerts</h3>
            </div>

            {nonEmptyClusters.length === 0 ? (
                <div className="rounded-lg bg-success/10 p-3 text-sm font-medium text-success">All students are performing well.</div>
            ) : (
                <div className="space-y-4">
                    {nonEmptyClusters.map((cluster) => (
                        <div key={cluster.level}>
                            <div className="mb-2 flex items-center gap-2">
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cluster.bgColor} ${cluster.color}`}>
                                    {cluster.level}
                                </span>
                                <span className="text-xs text-muted-foreground">{cluster.students.length} student(s)</span>
                            </div>
                            <div className="space-y-1.5">
                                {cluster.students.map((s) => (
                                    <div key={s.id || s._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                        <div>
                                            <span className="text-sm font-medium text-foreground">{s.name}</span>
                                            <span className="ml-2 text-xs text-muted-foreground">CGPA: {(s.cgpa || 0).toFixed(1)} · Att: {s.attendance || 0}%</span>
                                        </div>
                                        <button
                                            onClick={() => handleSendWarning(s.id || s._id)}
                                            disabled={sentWarnings.has(s.id || s._id)}
                                            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${sentWarnings.has(s.id || s._id)
                                                ? "bg-muted text-muted-foreground cursor-default"
                                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                                                }`}
                                        >
                                            {sentWarnings.has(s.id || s._id) ? "Sent ✓" : "Send Warning"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
