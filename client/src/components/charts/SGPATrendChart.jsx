import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SGPATrendChart = ({ data }) => (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 font-display text-base font-semibold text-card-foreground">SGPA Trend</h3>
        <ResponsiveContainer width="100%" height={180}>
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

export default SGPATrendChart;
