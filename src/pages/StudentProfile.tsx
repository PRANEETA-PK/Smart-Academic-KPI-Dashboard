import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { students } from "@/data/mockData";
import { User, Mail, Hash, Building, CalendarCheck, Award } from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();
  const student = students.find((s) => s.email === user?.email) || students[0];

  const infoItems = [
    { icon: User, label: "Full Name", value: student.name },
    { icon: Hash, label: "Roll Number", value: student.rollNumber },
    { icon: Building, label: "Department", value: student.department },
    { icon: Mail, label: "Email", value: student.email },
    { icon: CalendarCheck, label: "Attendance", value: `${student.attendance}%` },
    { icon: Award, label: "CGPA", value: student.cgpa.toFixed(2) },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="animate-slide-up">
          <div className="mb-6 rounded-2xl border border-border bg-card p-8 shadow-glow-soft">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
                {student.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{student.name}</h1>
                <p className="text-sm text-muted-foreground">{student.department} · {student.rollNumber}</p>
                <div className="mt-2 flex gap-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    student.cgpa >= 8 ? "bg-success/10 text-success" : student.cgpa >= 6 ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
                  }`}>
                    CGPA: {student.cgpa.toFixed(1)}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                    student.attendance >= 75 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>
                    Attendance: {student.attendance}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-glow-soft transition-shadow">
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
              {student.semesters.map((sem) => (
                <div key={sem.semesterName} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">{sem.semesterName}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{sem.subjects.length} subjects</span>
                    <span className={`rounded-full px-3 py-0.5 text-sm font-bold ${
                      sem.sgpa >= 8 ? "bg-success/10 text-success" : sem.sgpa >= 6 ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
                    }`}>
                      {sem.sgpa.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;
