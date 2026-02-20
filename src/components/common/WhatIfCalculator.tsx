import React, { useState, useMemo } from "react";
import { Calculator, Target, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Semester } from "@/types";

interface Props {
  semesters: Semester[];
  currentCGPA: number;
}

const WhatIfCalculator: React.FC<Props> = ({ semesters, currentCGPA }) => {
  const [simulatedSGPA, setSimulatedSGPA] = useState([7.5]);
  const totalSemesters = semesters.length;
  const nextSemNum = totalSemesters + 1;

  const predictedCGPA = useMemo(() => {
    const totalPoints = semesters.reduce((sum, s) => sum + s.sgpa, 0) + simulatedSGPA[0];
    return totalPoints / (totalSemesters + 1);
  }, [semesters, simulatedSGPA, totalSemesters]);

  const getRequiredSGPA = (targetCGPA: number) => {
    const needed = targetCGPA * (totalSemesters + 1) - semesters.reduce((sum, s) => sum + s.sgpa, 0);
    return needed;
  };

  const targets = [
    { label: "8.5 CGPA", value: 8.5, icon: Target },
    { label: "9.0 CGPA", value: 9.0, icon: Star },
    { label: "Distinction (9.5+)", value: 9.5, icon: Star },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-glow transition-shadow animate-fade-in">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent shadow-glow-soft">
          <Calculator className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-display text-base font-semibold text-card-foreground">What-If CGPA Calculator</h3>
      </div>

      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Simulated SGPA for Sem {nextSemNum}</span>
          <span className="font-display text-2xl font-bold text-primary">{simulatedSGPA[0].toFixed(1)}</span>
        </div>
        <Slider
          value={simulatedSGPA}
          onValueChange={setSimulatedSGPA}
          min={0}
          max={10}
          step={0.1}
          className="mt-2"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0.0</span>
          <span>5.0</span>
          <span>10.0</span>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-accent p-4 text-center shadow-glow-soft">
        <p className="text-sm text-muted-foreground">Predicted CGPA</p>
        <p className={`font-display text-4xl font-bold ${
          predictedCGPA >= 9 ? "text-success" : predictedCGPA >= 7 ? "text-primary" : "text-destructive"
        }`}>
          {predictedCGPA.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {predictedCGPA > currentCGPA ? "↑" : predictedCGPA < currentCGPA ? "↓" : "→"} Current: {currentCGPA.toFixed(2)}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">SGPA required to achieve:</p>
        {targets.map((t) => {
          const required = getRequiredSGPA(t.value);
          const achievable = required <= 10 && required >= 0;
          return (
            <div key={t.label} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <t.icon className={`h-4 w-4 ${achievable ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium text-foreground">{t.label}</span>
              </div>
              <span className={`text-sm font-bold ${
                achievable ? (required <= simulatedSGPA[0] ? "text-success" : "text-primary") : "text-muted-foreground"
              }`}>
                {achievable ? `${required.toFixed(1)} SGPA` : "Not possible"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatIfCalculator;
