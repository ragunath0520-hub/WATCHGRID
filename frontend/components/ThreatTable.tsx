"use client";

import React from "react";
import { Threat, ThreatStatus } from "@/types";
import { formatDate, formatRelativeTime, getSeverityClasses } from "@/lib/utils";
import { ShieldAlert, CheckCircle2, EyeOff, Activity } from "lucide-react";

interface ThreatTableProps {
  threats: Threat[];
  onStatusChange?: (id: number, status: ThreatStatus) => void;
  isLoading?: boolean;
}

export const ThreatTable: React.FC<ThreatTableProps> = ({
  threats,
  onStatusChange,
  isLoading = false,
}) => {
  if (threats.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center bg-soc-card rounded-xl border border-soc-border">
        <ShieldAlert className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-mono text-slate-300">No security threats detected.</p>
        <p className="text-xs font-mono text-slate-500 mt-1">All monitored endpoints operating within security baselines.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-soc-border bg-soc-card">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-soc-surface border-b border-soc-border text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Threat ID</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Source IP</th>
            <th className="py-3 px-4">Target User</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Confidence</th>
            <th className="py-3 px-4">Events</th>
            <th className="py-3 px-4">Last Seen</th>
            <th className="py-3 px-4">Status</th>
            {onStatusChange && <th className="py-3 px-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-soc-border/60">
          {threats.map((threat) => {
            const sev = getSeverityClasses(threat.severity);
            const isHigh = threat.severity === "HIGH" || threat.severity === "CRITICAL";

            return (
              <tr
                key={threat.id}
                className={`transition-colors hover:bg-soc-surface/40 ${
                  isHigh && threat.status === "ACTIVE" ? "bg-red-950/10" : ""
                }`}
              >
                <td className="py-3 px-4 font-bold text-slate-200">
                  THR-{String(threat.id).padStart(4, "0")}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                    {threat.event_type}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-white">
                  {threat.source_ip}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {threat.target_username || <span className="text-slate-500">N/A</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${sev.badge}`}>
                    {threat.severity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${
                          threat.confidence >= 85
                            ? "bg-red-500"
                            : threat.confidence >= 70
                            ? "bg-amber-500"
                            : "bg-sky-500"
                        }`}
                        style={{ width: `${threat.confidence}%` }}
                      />
                    </div>
                    <span className="text-slate-300">{threat.confidence}%</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-300 font-bold">
                  {threat.event_count}
                </td>
                <td className="py-3 px-4 text-slate-400" title={formatDate(threat.last_seen)}>
                  {formatRelativeTime(threat.last_seen)}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      threat.status === "ACTIVE"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : threat.status === "RESOLVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {threat.status}
                  </span>
                </td>
                {onStatusChange && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {threat.status !== "RESOLVED" && (
                        <button
                          onClick={() => onStatusChange(threat.id, "RESOLVED")}
                          className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/40 text-[11px] flex items-center gap-1 transition"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      )}
                      {threat.status === "ACTIVE" && (
                        <button
                          onClick={() => onStatusChange(threat.id, "IGNORED")}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] flex items-center gap-1 transition"
                          title="Ignore False Positive"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Ignore</span>
                        </button>
                      )}
                      {threat.status !== "ACTIVE" && (
                        <button
                          onClick={() => onStatusChange(threat.id, "ACTIVE")}
                          className="px-2 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-[11px] flex items-center gap-1 transition"
                          title="Reopen Threat"
                        >
                          <Activity className="w-3 h-3" />
                          <span>Reactivate</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
