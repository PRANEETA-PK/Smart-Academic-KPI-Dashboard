import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const PerformanceGrowthTrend = ({ semesters }) => {
    const trendData = semesters.map((sem, i) => {
        const prevSGPA = i > 0 ? semesters[i - 1].sgpa : sem.sgpa;
        const change = ((sem.sgpa - prevSGPA) / prevSGPA) * 100;
        return {
            semesterName: sem.semesterName,
            sgpa: sem.sgpa,
            change: parseFloat(change.toFixed(1)),
            isImproved: change >= 0,
        };
    });

    const latestChange = trendData[trendData.length - 1]?.change || 0;
    const positiveCount = trendData.filter((d) => d.change >= 0).length;
    const consistencyScore = Math.round((positiveCount / Math.max(trendData.length - 1, 1)) * 100);

    const getInsight = () => {
        if (latestChange > 0)
            return { text: `Your performance improved by ${latestChange}% compared to last semester.`, type: "success" };
        if (latestChange < 0)
            return { text: `Your performance dropped by ${Math.abs(latestChange)}% compared to last semester.`, type: "destructive" };
        return { text: "Your performance is stable compared to last semester.", type: "primary" };
    };

    const insight = getInsight();
    const drops = trendData.filter((d) => d.change < -2);

    return (
        <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-card-foreground">Performance Growth Trend</h3>
                <div className="flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    <Activity className="h-3 w-3" />
                    Consistency: {consistencyScore}%
                </div>
            </div>

            <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm font-medium ${insight.type === "success" ? "bg-success/10 text-success" :
                    insight.type === "destructive" ? "bg-destructive/10 text-destructive" :
                        "bg-accent text-accent-foreground"
                }`}>
                {latestChange >= 0 ? <TrendingUp className="h-4 w-4 flex-shrink-0" /> : <TrendingDown className="h-4 w-4 flex-shrink-0" />}
                {insight.text}
            </div>

            {drops.length > 0 && (
                <div className="mb-4 space-y-1">
                    {drops.map((d) => (
                        <div key={d.semesterName} className="flex items-center gap-2 rounded-md bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
                            <TrendingDown className="h-3 w-3" />
                            Drop of {Math.abs(d.change)}% in {d.semesterName}
                        </div>
                    ))}
                </div>
            )}

            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
                    <XAxis dataKey="semesterName" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
                    <Tooltip
                        contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }}
                        formatter={(value, name) => [
                            name === "sgpa" ? value.toFixed(1) : `${value > 0 ? "+" : ""}${value}%`,
                            name === "sgpa" ? "SGPA" : "Change",
                        ]}
                    />
                    <Line type="monotone" dataKey="sgpa" stroke="hsl(184 42% 50%)" strokeWidth={3} dot={{ fill: "hsl(184 42% 50%)", r: 5, strokeWidth: 2, stroke: "hsl(0 0% 100%)" }} />
                    {drops.map((d) => (
                        <ReferenceDot key={d.semesterName} x={d.semesterName} y={d.sgpa} r={8} fill="hsl(0 72% 55%)" stroke="hsl(0 0% 100%)" strokeWidth={2} />
                    ))}
                </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 flex flex-wrap gap-2">
                {trendData.slice(1).map((d) => (
                    <div key={d.semesterName} className={`rounded-full px-3 py-1 text-xs font-medium ${d.isImproved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        }`}>
                        {d.semesterName}: {d.change > 0 ? "+" : ""}{d.change}%
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PerformanceGrowthTrend;
