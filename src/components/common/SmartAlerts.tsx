import React from "react";
import { AlertTriangle, TrendingDown, BookOpen, Bell } from "lucide-react";
import { Student } from "@/types";

// ---- Student Alerts ----
interface StudentAlertProps {
  student: Student;
}

export const StudentAlerts: React.FC<StudentAlertProps> = ({ student }) => {
  const alerts: { icon: React.ElementType; text: string; level: "warning" | "destructive" }[] = [];
  const sems = student.semesters;

  if (student.attendance < 75) {
    alerts.push({ icon: AlertTriangle, text: `Your attendance is ${student.attendance}% — below the 75% requirement.`, level: "destructive" });
  }

  if (sems.length >= 2) {
    const curr = sems[sems.length - 1].sgpa;
    const prev = sems[sems.length - 2].sgpa;
    if (curr < prev) {
      alerts.push({ icon: TrendingDown, text: `SGPA dropped from ${prev.toFixed(1)} to ${curr.toFixed(1)} this semester.`, level: "warning" });
    }
  }

  const latestSubjects = sems[sems.length - 1]?.subjects || [];
  const weakSubjects = latestSubjects.filter((s) => s.marks < 50);
  weakSubjects.forEach((s) => {
    alerts.push({ icon: BookOpen, text: `${s.subjectName}: ${s.marks} marks — below passing threshold.`, level: "destructive" });
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
          <div key={i} className={`flex items-start gap-2 rounded-lg p-3 text-sm font-medium ${
            a.level === "destructive" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
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
interface FacultyAlertProps {
  students: Student[];
}

interface RiskCluster {
  level: string;
  color: string;
  bgColor: string;
  students: Student[];
}

export const FacultyAlerts: React.FC<FacultyAlertProps> = ({ students }) => {
  const [sentWarnings, setSentWarnings] = React.useState<Set<string>>(new Set());

  const clusters: RiskCluster[] = [
    {
      level: "Critical",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      students: students.filter((s) => s.cgpa < 5 || s.attendance < 55),
    },
    {
      level: "High Risk",
      color: "text-destructive",
      bgColor: "bg-destructive/5",
      students: students.filter((s) => (s.cgpa >= 5 && s.cgpa < 6) || (s.attendance >= 55 && s.attendance < 65)),
    },
    {
      level: "Monitor",
      color: "text-warning",
      bgColor: "bg-warning/10",
      students: students.filter((s) => s.cgpa >= 6 && s.cgpa < 7 && s.attendance >= 65),
    },
  ];

  const handleSendWarning = (studentId: string) => {
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
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div>
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">CGPA: {s.cgpa.toFixed(1)} · Att: {s.attendance}%</span>
                    </div>
                    <button
                      onClick={() => handleSendWarning(s.id)}
                      disabled={sentWarnings.has(s.id)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                        sentWarnings.has(s.id)
                          ? "bg-muted text-muted-foreground cursor-default"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {sentWarnings.has(s.id) ? "Sent ✓" : "Send Warning"}
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
