"use client";

import React, { useState } from "react";
import { SecurityEvent } from "@/types";
import { formatDate, formatRelativeTime, getSeverityClasses } from "@/lib/utils";
import { Activity, Code, ChevronDown, ChevronRight } from "lucide-react";

interface EventTableProps {
  events: SecurityEvent[];
  isLoading?: boolean;
}

export const EventTable: React.FC<EventTableProps> = ({ events, isLoading = false }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (events.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center bg-soc-card rounded-xl border border-soc-border">
        <Activity className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
        <p className="text-sm font-mono text-slate-300">No events found matching the criteria.</p>
        <p className="text-xs font-mono text-slate-500 mt-1">Adjust filters or send test events from the Python agent.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-soc-border bg-soc-card">
      <table className="w-full text-left text-xs font-mono">
        <thead className="bg-soc-surface border-b border-soc-border text-slate-400 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4 w-10"></th>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">Device</th>
            <th className="py-3 px-4">Event Type</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Source IP</th>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-soc-border/60">
          {events.map((event) => {
            const sev = getSeverityClasses(event.severity);
            const isExpanded = expandedId === event.id;
            const hasMetadata =
              event.event_metadata && Object.keys(event.event_metadata).length > 0;

            return (
              <React.Fragment key={event.id}>
                <tr
                  onClick={() => hasMetadata && toggleExpand(event.id)}
                  className={`transition-colors hover:bg-soc-surface/50 ${
                    hasMetadata ? "cursor-pointer" : ""
                  }`}
                >
                  <td className="py-3 px-3 text-slate-500 text-center">
                    {hasMetadata ? (
                      isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-soc-accent" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )
                    ) : (
                      <span className="text-slate-700">•</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap" title={formatDate(event.timestamp)}>
                    {formatRelativeTime(event.timestamp)}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {event.device_id || <span className="text-slate-600">UNSPECIFIED</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-semibold">
                      {event.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${sev.badge}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    {event.source_ip}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {event.username || <span className="text-slate-600">N/A</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                    {event.description}
                  </td>
                </tr>

                {/* Expanded JSON Context */}
                {isExpanded && hasMetadata && (
                  <tr className="bg-slate-950/80">
                    <td colSpan={8} className="p-4 border-t border-soc-border/40">
                      <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs">
                        <Code className="w-3.5 h-3.5 text-soc-accent" />
                        <span className="font-semibold text-slate-200">Raw Event Telemetry Payload</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-slate-300 text-[11px] overflow-x-auto font-mono">
                        {JSON.stringify(event.event_metadata, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
