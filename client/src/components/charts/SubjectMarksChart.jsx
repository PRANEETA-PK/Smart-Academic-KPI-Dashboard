import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SubjectMarksChart = ({ data }) => (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">Subject-wise Performance</h3>
        <ResponsiveContainer width="100%" height={180}>
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

export default SubjectMarksChart;
