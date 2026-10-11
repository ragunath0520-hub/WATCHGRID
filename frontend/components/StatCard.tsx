import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "danger" | "warning" | "success" | "accent";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}) => {
  const getStyles = () => {
    switch (variant) {
      case "danger":
        return {
          border: "border-red-500/30 hover:border-red-500/50",
          iconBg: "bg-red-500/10 text-red-400 border-red-500/30",
          valueColor: "text-red-400",
          glow: "shadow-[0_0_20px_rgba(239,68,68,0.1)]",
        };
      case "warning":
        return {
          border: "border-amber-500/30 hover:border-amber-500/50",
          iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          valueColor: "text-amber-400",
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.1)]",
        };
      case "success":
        return {
          border: "border-emerald-500/30 hover:border-emerald-500/50",
          iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          valueColor: "text-emerald-400",
          glow: "shadow-[0_0_20px_rgba(16,185,129,0.1)]",
        };
      case "accent":
        return {
          border: "border-sky-500/30 hover:border-sky-500/50",
          iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/30",
          valueColor: "text-sky-400",
          glow: "shadow-[0_0_20px_rgba(14,165,233,0.1)]",
        };
      default:
        return {
          border: "border-soc-border hover:border-soc-borderLight",
          iconBg: "bg-slate-800 text-slate-300 border-slate-700",
          valueColor: "text-white",
          glow: "",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`p-5 rounded-xl bg-soc-card border transition-all duration-200 ${styles.border} ${styles.glow} relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">{title}</p>
          <p className={`text-2xl font-bold font-mono mt-1.5 ${styles.valueColor}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] font-mono text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
