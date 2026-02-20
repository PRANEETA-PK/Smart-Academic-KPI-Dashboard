import React, { useMemo } from "react";
import { Sparkles, TrendingUp, Target, BookOpen } from "lucide-react";

const AIInsights = ({ student }) => {
    const insights = useMemo(() => {
        if (!student || !student.semesters?.length) return [];

        const latestSem = student.semesters[student.semesters.length - 1];
        const result = [];

        // 1. CGPA Goal Insight
        if (student.cgpa < 9) {
            result.push({
                icon: Target,
                title: "CGPA Booster",
                text: `Maintaining a 9.2 SGPA next sem will push your overall CGPA to ${(student.cgpa + 0.15).toFixed(2)}.`,
                color: "text-blue-500",
                bg: "bg-blue-50"
            });
        }

        // 2. Subject Mastery Insight
        const weakSubject = latestSem.subjects.reduce((prev, curr) => (prev.marks < curr.marks ? prev : curr));
        if (weakSubject) {
            result.push({
                icon: BookOpen,
                title: "Study Priority",
                text: `Your performance in ${weakSubject.subjectName} (${weakSubject.marks}%) shows room for growth. Extra focus here is key.`,
                color: "text-purple-500",
                bg: "bg-purple-50"
            });
        }

        // 3. Attendance Insight
        if (student.attendance < 85) {
            result.push({
                icon: Sparkles,
                title: "Attendance Smart-Tip",
                text: "Try to attend 4 more classes this month to reach the 85% gold standard.",
                color: "text-amber-500",
                bg: "bg-amber-50"
            });
        }

        return result;
    }, [student]);

    if (!insights.length) return null;

    return (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <h3 className="font-display text-lg font-bold text-foreground">AI Academic Insights</h3>
            </div>

            <div className="space-y-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="flex gap-4 p-3 rounded-xl hover:bg-white/50 transition-colors">
                        <div className={`mt-1 flex-shrink-0 rounded-lg p-2 ${insight.bg}`}>
                            <insight.icon className={`h-4 w-4 ${insight.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{insight.title}</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">{insight.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-3 rounded-xl bg-primary text-primary-foreground text-xs text-center font-medium">
                Keep exploring! Your potential is unlimited.
            </div>
        </div>
    );
};

export default AIInsights;
