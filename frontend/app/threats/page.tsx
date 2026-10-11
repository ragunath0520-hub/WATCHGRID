"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ThreatTable } from "@/components/ThreatTable";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";
import { Threat, ThreatStatus } from "@/types";
import { ShieldAlert, Filter, Layers, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const fetchThreats = async () => {
    try {
      const data = await api.threats.list({
        status: statusFilter,
        severity: severityFilter,
      });
      setThreats(data);
    } catch (err) {
      console.error("Failed to load threats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchThreats();
  }, [statusFilter, severityFilter]);

  const handleStatusChange = async (id: number, newStatus: ThreatStatus) => {
    try {
      await api.threats.updateStatus(id, newStatus);
      fetchThreats();
    } catch (err) {
      console.error("Failed to update threat:", err);
    }
  };

  const activeCount = threats.filter((t) => t.status === "ACTIVE").length;
  const resolvedCount = threats.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="THREAT DETECTION MATRIX"
          subtitle="Autonomous behavioral correlation and threat deduplication"
          onRefresh={() => {
            setRefreshing(true);
            fetchThreats();
          }}
          isRefreshing={refreshing}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Deduplication & Correlation Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-soc-card border border-red-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Active Threats</span>
                <span className="text-2xl font-bold text-red-400 mt-1 block">{activeCount}</span>
              </div>
              <ShieldAlert className="w-8 h-8 text-red-400 opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-soc-card border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Resolved Threats</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{resolvedCount}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-soc-card border border-soc-border flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Deduplication State</span>
                <span className="text-xs font-semibold text-soc-accent mt-1 block">
                  Sliding-Window Grouping
                </span>
              </div>
              <Layers className="w-8 h-8 text-soc-accent opacity-60" />
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-soc-card border border-soc-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-soc-accent"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="IGNORED">IGNORED</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-soc-card border border-soc-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-soc-accent"
              >
                <option value="ALL">All Severities</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingState message="Evaluating correlated threat database..." />
          ) : (
            <ThreatTable threats={threats} onStatusChange={handleStatusChange} />
          )}
        </main>
      </div>
    </div>
  );
}
