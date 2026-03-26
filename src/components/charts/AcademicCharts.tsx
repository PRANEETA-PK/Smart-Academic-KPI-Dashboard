import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";

interface SubjectChartProps {
  data: { subjectName: string; marks: number }[];
}

export const SubjectBarChart: React.FC<SubjectChartProps> = ({ data }) => (
  <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
    <h3 className="mb-6 font-display text-lg font-semibold text-card-foreground">Subject-wise Performance</h3>
    <div className="h-[280px] w-full bg-[#111111] rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="subjectName"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "#AAAAAA" }}
            angle={-25}
            textAnchor="end"
            height={60}
          />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#AAAAAA" }} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", borderRadius: "8px" }}
          />
          <Bar
            dataKey="marks"
            fill="#10B981"
            radius={[6, 6, 6, 6]}
            barSize={30}
            label={{ position: 'center', fill: '#fff', fontSize: 11, fontWeight: 'bold' }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

interface SGPAChartProps {
  data: { semesterName: string; sgpa: number }[];
  onSelectSemester?: (index: number) => void;
  selectedIndex?: number;
}

const toRoman = (num: number) => {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return roman[num - 1] || num.toString();
};

export const SGPATrendChart: React.FC<SGPAChartProps> = ({ data, onSelectSemester, selectedIndex }) => {
  const formattedData = data.map((d, i) => ({
    ...d,
    romanName: toRoman(i + 1),
    index: i
  }));

  const handleClick = (state: any) => {
    if (state && typeof state.activeTooltipIndex === 'number' && onSelectSemester) {
      onSelectSemester(state.activeTooltipIndex);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-card-foreground">Semester SGPA</h3>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold italic">Click bar to view subjects</p>
      </div>
      <div className="h-[280px] w-full bg-[#111111] rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} onClick={handleClick}>
            <XAxis
              dataKey="romanName"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fontSize: 13, fill: "#FFFFFF", fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              domain={[0, 10]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#AAAAAA" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{ backgroundColor: "#1A1A1A", border: "1px solid #333", borderRadius: "8px" }}
              labelStyle={{ display: 'none' }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
            />
            <Bar
              dataKey="sgpa"
              radius={[6, 6, 6, 6]}
              barSize={40}
              label={{ position: 'top', fill: '#fff', fontSize: 11, fontWeight: 'bold', offset: 10 }}
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === selectedIndex ? "#F59E0B" : "#3B82F6"}
                  className="cursor-pointer transition-all hover:opacity-80"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

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
