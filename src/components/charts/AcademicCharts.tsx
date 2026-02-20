import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface SubjectChartProps {
  data: { subjectName: string; marks: number }[];
}

export const SubjectBarChart: React.FC<SubjectChartProps> = ({ data }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-card">
    <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Subject-wise Performance</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
        <XAxis dataKey="subjectName" tick={{ fontSize: 11, fill: "hsl(210 10% 46%)" }} angle={-20} textAnchor="end" height={60} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(210 10% 46%)" }} />
        <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)", boxShadow: "0 4px 24px -4px rgba(0,0,0,0.08)" }} />
        <Bar dataKey="marks" fill="hsl(184 42% 50%)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

interface SGPAChartProps {
  data: { semesterName: string; sgpa: number }[];
}

export const SGPATrendChart: React.FC<SGPAChartProps> = ({ data }) => (
  <div className="rounded-xl border border-border bg-card p-5 shadow-card">
    <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">SGPA Trend</h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
        <XAxis dataKey="semesterName" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
        <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)" }} />
        <Bar dataKey="sgpa" fill="hsl(184 50% 40%)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const CGPALineChart: React.FC<SGPAChartProps> = ({ data }) => {
  const cumulativeData = data.map((item, i) => {
    const avg = data.slice(0, i + 1).reduce((sum, d) => sum + d.sgpa, 0) / (i + 1);
    return { semesterName: item.semesterName, cgpa: parseFloat(avg.toFixed(2)), sgpa: item.sgpa };
  });

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
      <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">CGPA Growth</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={cumulativeData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" />
          <XAxis dataKey="semesterName" tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
          <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: "hsl(210 10% 46%)" }} />
          <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(210 15% 90%)" }} />
          <Line type="monotone" dataKey="cgpa" stroke="hsl(184 42% 50%)" strokeWidth={3} dot={{ fill: "hsl(184 42% 50%)", r: 5 }} />
          <Line type="monotone" dataKey="sgpa" stroke="hsl(184 30% 70%)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "hsl(184 30% 70%)", r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
