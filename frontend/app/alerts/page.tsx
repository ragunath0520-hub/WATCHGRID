"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AlertCard } from "@/components/AlertCard";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";
import { Alert } from "@/types";
import { BellRing, CheckCircle2, ShieldCheck, Filter } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.list({
        status: statusFilter,
        severity: severityFilter,
      });
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter]);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.alerts.acknowledge(id);
      fetchAlerts();
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      await api.alerts.resolve(id);
      fetchAlerts();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  const tabs = [
    { label: "New Alerts", value: "NEW" },
    { label: "Acknowledged", value: "ACKNOWLEDGED" },
    { label: "Resolved", value: "RESOLVED" },
    { label: "All Alerts", value: "ALL" },
  ];

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="ALERT OPERATIONS CENTER"
          subtitle="Triage high-priority security notifications and incident escalations"
          onRefresh={() => {
            setRefreshing(true);
            fetchAlerts();
          }}
          isRefreshing={refreshing}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Status Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-soc-card border border-soc-border self-start">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition font-medium ${
                    statusFilter === tab.value
                      ? "bg-soc-accent/15 text-soc-accent border border-soc-accent/40 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-soc-card border border-soc-border rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-soc-accent"
              >
                <option value="ALL">All Severities</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          {/* Alert Cards List */}
          {loading ? (
            <LoadingState message="Fetching SOC alerts..." />
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center bg-soc-card rounded-2xl border border-soc-border">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold font-mono text-white">No Alerts In This Category</h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Zero open incidents matching filter. All monitored endpoints secure.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={handleAcknowledge}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
