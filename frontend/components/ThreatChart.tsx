"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { TimeSeriesPoint, CountMetric } from "@/types";

interface ThreatChartProps {
  timeSeriesData: TimeSeriesPoint[];
  severityData: CountMetric[];
}

const SEVERITY_COLORS: Record<string, string> = {
  INFO: "#64748b",
  LOW: "#0ea5e9",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

export const ThreatChart: React.FC<ThreatChartProps> = ({
  timeSeriesData,
  severityData,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
        Loading chart visualizers...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Time Series Area Chart */}
      <div className="lg:col-span-2 p-5 rounded-xl bg-soc-card border border-soc-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white font-mono">
              TELEMETRY & THREAT ACTIVITY TIMELINE
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Events ingested vs. correlated threat detections (Hourly)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-soc-accent" />
              <span className="text-slate-300">Events</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-300">Threats</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e2b45",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
                itemStyle={{ color: "#f1f5f9" }}
              />
              <Area
                type="monotone"
                dataKey="events"
                name="Security Events"
                stroke="#0ea5e9"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEvents)"
              />
              <Area
                type="monotone"
                dataKey="threats"
                name="Threats Detected"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorThreats)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Severity Distribution Bar Chart */}
      <div className="p-5 rounded-xl bg-soc-card border border-soc-border">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white font-mono">SEVERITY CLASSIFICATION</h3>
          <p className="text-xs text-slate-400 font-mono">Distribution across security events</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2b45" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e2b45",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" name="Event Count" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={SEVERITY_COLORS[entry.name.toUpperCase()] || "#0ea5e9"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
