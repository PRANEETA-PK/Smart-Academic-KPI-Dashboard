import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertCircle } from "lucide-react";

interface Props {
  semesters: { semesterName: string; sgpa: number }[];
}

const PerformanceGrowthTrend: React.FC<Props> = ({ semesters }) => {
  if (!semesters || semesters.length === 0) return null;

  const trendData = semesters.map((sem, i) => {
    const prevSGPA = i > 0 ? semesters[i - 1].sgpa : sem.sgpa;
    const change = i === 0 ? 0 : ((sem.sgpa - prevSGPA) / prevSGPA) * 100;
    return {
      semesterName: sem.semesterName,
      shortName: sem.semesterName.replace("Semester ", ""),
      sgpa: sem.sgpa,
      change: parseFloat(change.toFixed(1)),
      isImproved: change >= 0,
    };
  });

  const latest = trendData[trendData.length - 1];
  const latestChange = latest?.change || 0;

  // Calculate consistency based on volatility
  const sgs = semesters.map(s => s.sgpa);
  const avg = sgs.reduce((a, b) => a + b, 0) / sgs.length;
  const variance = sgs.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sgs.length;
  const standardDeviation = Math.sqrt(variance);
  const consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (standardDeviation * 20))));

  const significantDrops = trendData.filter(d => d.change < -2);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">Performance Growth Trend</h3>
        <div className="flex items-center gap-2 rounded-full bg-accent/50 px-3 py-1 text-xs font-semibold text-primary">
          <Activity className="h-3 w-3" />
          Consistency: {consistencyScore}%
        </div>
      </div>

      {/* Main Alert for latest change */}
      <div className={`mb-4 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${latestChange < 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
        }`}>
        {latestChange < 0 ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
        <span>
          Your performance {latestChange < 0 ? "dropped" : "improved"} by {Math.abs(latestChange)}% compared to last semester.
        </span>
      </div>

      {/* Specific Drop History Alerts */}
      <div className="mb-6 space-y-2">
        {significantDrops.map((d) => (
          <div key={d.semesterName} className="flex items-center gap-2 rounded-xl bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive transition-all hover:bg-destructive/10">
            <TrendingDown className="h-3.5 w-3.5" />
            Drop of {Math.abs(d.change)}% in {d.semesterName}
          </div>
        ))}
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(184 42% 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(184 42% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" opacity={0.5} />
            <XAxis
              dataKey="semesterName"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              dy={10}
            />
            <YAxis
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
                      <p className="text-xs font-bold text-muted-foreground">{data.semesterName}</p>
                      <p className="text-sm font-bold text-primary">SGPA : {data.sgpa}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="sgpa"
              stroke="hsl(184 42% 50%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorSgpa)"
              dot={{ fill: "hsl(184 42% 50%)", r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
              activeDot={{ r: 7, strokeWidth: 0 }}
            />
            {significantDrops.map((d) => (
              <ReferenceDot
                key={d.semesterName}
                x={d.semesterName}
                y={d.sgpa}
                r={6}
                fill="hsl(0 72% 55%)"
                stroke="hsl(var(--background))"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {trendData.slice(1).map((d) => (
          <div key={d.semesterName} className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${d.isImproved ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
            {d.semesterName}: {d.change > 0 ? "+" : ""}{d.change}%
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceGrowthTrend;
