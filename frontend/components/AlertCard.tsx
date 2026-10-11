"use client";

import React from "react";
import { Alert } from "@/types";
import { formatDate, formatRelativeTime, getSeverityClasses } from "@/lib/utils";
import { AlertCircle, CheckCircle, Bell, Laptop2 } from "lucide-react";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
}) => {
  const sev = getSeverityClasses(alert.severity);

  return (
    <div
      className={`p-5 rounded-xl bg-soc-card border transition-all duration-200 ${
        alert.status === "NEW"
          ? "border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : alert.status === "ACKNOWLEDGED"
          ? "border-amber-500/30"
          : "border-soc-border opacity-70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${sev.badge}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white font-mono">{alert.title}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${sev.badge}`}>
                {alert.severity}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  alert.status === "NEW"
                    ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                    : alert.status === "ACKNOWLEDGED"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                }`}
              >
                {alert.status}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Raised {formatRelativeTime(alert.created_at)} ({formatDate(alert.created_at)})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {alert.status === "NEW" && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-xs font-mono flex items-center gap-1.5 transition active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
          )}
          {alert.status !== "RESOLVED" && onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 text-xs font-mono flex items-center gap-1.5 transition active:scale-95"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Resolve</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60 text-xs font-mono text-slate-200 mb-3">
        {alert.message}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Laptop2 className="w-3.5 h-3.5 text-soc-accent" />
          <span>Device: {alert.device_id || "Unassigned"}</span>
        </div>
        {alert.resolved_at && (
          <span className="text-emerald-400">
            Resolved: {formatRelativeTime(alert.resolved_at)}
          </span>
        )}
      </div>
    </div>
  );
};
