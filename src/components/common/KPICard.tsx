import React from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const variantStyles = {
  default: "bg-card shadow-card",
  primary: "bg-card shadow-card border-l-4 border-l-primary",
  success: "bg-card shadow-card border-l-4 border-l-success",
  warning: "bg-card shadow-card border-l-4 border-l-warning",
  destructive: "bg-card shadow-card border-l-4 border-l-destructive",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-accent text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, trend, variant = "default" }) => {
  return (
    <div className={`animate-scale-in rounded-xl border border-border p-5 transition-all hover:shadow-glow ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold text-card-foreground">{value}</p>
          {trend && (
            <p className="mt-1 text-xs font-medium text-primary">{trend}</p>
          )}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-glow-soft ${iconVariantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
