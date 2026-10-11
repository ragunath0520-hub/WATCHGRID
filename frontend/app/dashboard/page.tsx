"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { ThreatChart } from "@/components/ThreatChart";
import { ThreatTable } from "@/components/ThreatTable";
import { AlertCard } from "@/components/AlertCard";
import { EventTable } from "@/components/EventTable";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";
import { DashboardStats, Threat, Alert, SecurityEvent, ThreatStatus } from "@/types";
import {
  Activity,
  AlertTriangle,
  BellRing,
  Laptop2,
  ShieldAlert,
  Zap,
  Play,
  CheckCircle,
  Terminal,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsData, threatsData, alertsData, eventsData] = await Promise.all([
        api.dashboard.getStats(),
        api.threats.list({ limit: 5 }),
        api.alerts.list({ status: "NEW", limit: 3 }),
        api.events.list({ limit: 10 }),
      ]);
      setStats(statsData);
      setThreats(threatsData);
      setAlerts(alertsData);
      setEvents(eventsData);
    } catch (err) {
      console.error("Failed to load dashboard telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleThreatStatus = async (id: number, status: ThreatStatus) => {
    try {
      await api.threats.updateStatus(id, status);
      fetchDashboardData();
    } catch (err) {
      console.error("Error updating threat status:", err);
    }
  };

  const handleAcknowledgeAlert = async (id: number) => {
    try {
      await api.alerts.acknowledge(id);
      fetchDashboardData();
    } catch (err) {
      console.error("Error acknowledging alert:", err);
    }
  };

  const handleResolveAlert = async (id: number) => {
    try {
      await api.alerts.resolve(id);
      fetchDashboardData();
    } catch (err) {
      console.error("Error resolving alert:", err);
    }
  };

  // Quick Simulation Helper directly from dashboard for academic demo
  const triggerSimulation = async (type: "bruteforce" | "request" | "multi_account") => {
    setSimulating(type);
    setSimMessage(null);

    const attackerIp =
      type === "bruteforce"
        ? "198.51.100.88"
        : type === "request"
        ? "203.0.113.99"
        : "192.0.2.77";

    try {
      if (type === "bruteforce") {
        for (let i = 1; i <= 6; i++) {
          await api.events.ingest({
            device_id: "DEV-CORP-SOC-01",
            event_type: "LOGIN_FAILURE",
            username: "admin",
            source_ip: attackerIp,
            description: `Simulated failed login attempt ${i}/6 for user 'admin'`,
            severity: i >= 5 ? "HIGH" : "LOW",
            event_metadata: { attempt: i, vector: "bruteforce_demo" },
          });
        }
        setSimMessage("Brute-force simulation dispatched! 6 events ingested -> HIGH Threat & Alert triggered.");
      } else if (type === "request") {
        for (let i = 1; i <= 32; i++) {
          await api.events.ingest({
            device_id: "DEV-PROD-SRV-02",
            event_type: "REQUEST",
            username: "api_bot",
            source_ip: attackerIp,
            description: `Simulated high-frequency request flood #${i}`,
            severity: i >= 30 ? "HIGH" : "INFO",
            event_metadata: { req_id: i, endpoint: "/api/v1/auth" },
          });
        }
        setSimMessage("Request abuse simulation dispatched! 32 events ingested -> HIGH Threat triggered.");
      } else if (type === "multi_account") {
        const users = ["admin", "root", "devops", "dbadmin"];
        for (const u of users) {
          await api.events.ingest({
            device_id: "DEV-CORP-SOC-01",
            event_type: "LOGIN_FAILURE",
            username: u,
            source_ip: attackerIp,
            description: `Simulated credential probe for user '${u}'`,
            severity: "LOW",
            event_metadata: { target_user: u },
          });
        }
        setSimMessage("Multi-account attack simulation dispatched! 4 user targets probed -> MEDIUM Threat triggered.");
      }

      await fetchDashboardData();
    } catch (err: any) {
      setSimMessage(`Simulation error: ${err.message || "Failed to trigger"}`);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="SECURITY OPERATIONS CENTER — OVERVIEW"
          subtitle="Real-time distributed telemetry, attack detection & incident response"
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {loading ? (
            <LoadingState message="Aggregating live telemetry stream..." />
          ) : (
            <>
              {/* Quick Academic Simulation Banner */}
              <div className="p-4 rounded-xl bg-soc-surface border border-soc-accent/40 shadow-[0_0_25px_rgba(14,165,233,0.1)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-soc-accent/15 border border-soc-accent/30 text-soc-accent">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-mono text-white flex items-center gap-2">
                      <span>LIVE THREAT SIMULATION SUITE</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-soc-accent/20 text-soc-accent border border-soc-accent/40">
                        Academic Test Bed
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Trigger instant attack vectors to validate the real-time detection & alert pipeline:
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => triggerSimulation("bruteforce")}
                    disabled={!!simulating}
                    className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/70 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-red-400" />
                    <span>Test Brute-Force (Rule 1)</span>
                  </button>

                  <button
                    onClick={() => triggerSimulation("request")}
                    disabled={!!simulating}
                    className="px-3 py-1.5 rounded-lg bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Test Request Flood (Rule 3)</span>
                  </button>

                  <button
                    onClick={() => triggerSimulation("multi_account")}
                    disabled={!!simulating}
                    className="px-3 py-1.5 rounded-lg bg-sky-950/50 hover:bg-sky-900/70 border border-sky-500/40 text-sky-300 font-mono text-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 text-sky-400" />
                    <span>Test Multi-Account (Rule 2)</span>
                  </button>
                </div>
              </div>

              {simMessage && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{simMessage}</span>
                </div>
              )}

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Total Events Ingested"
                  value={stats?.total_events ?? 0}
                  subtitle="Synchronized across fleet"
                  icon={Activity}
                  variant="accent"
                />
                <StatCard
                  title="Active Threat Vectors"
                  value={stats?.active_threats ?? 0}
                  subtitle={`${stats?.total_threats ?? 0} lifetime detected`}
                  icon={ShieldAlert}
                  variant="danger"
                />
                <StatCard
                  title="Unresolved Alerts"
                  value={stats?.new_alerts ?? 0}
                  subtitle={`${stats?.total_alerts ?? 0} total alerts`}
                  icon={BellRing}
                  variant="warning"
                />
                <StatCard
                  title="Connected Fleet"
                  value={`${stats?.online_devices ?? 0}/${stats?.total_devices ?? 0}`}
                  subtitle={`${stats?.offline_devices ?? 0} devices offline`}
                  icon={Laptop2}
                  variant="success"
                />
              </div>

              {/* Threat & Telemetry Charts */}
              {stats && (
                <ThreatChart
                  timeSeriesData={stats.events_over_time}
                  severityData={stats.events_by_severity}
                />
              )}

              {/* Active Alerts Section */}
              {alerts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      <BellRing className="w-4 h-4 text-red-400" />
                      <span>HIGH PRIORITY UNRESOLVED ALERTS</span>
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {alerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onAcknowledge={handleAcknowledgeAlert}
                        onResolve={handleResolveAlert}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Active Threats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>RECENT DETECTED THREAT VECTORS</span>
                  </h2>
                </div>
                <ThreatTable threats={threats} onStatusChange={handleThreatStatus} />
              </div>

              {/* Recent Events Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-soc-accent" />
                    <span>LATEST SECURITY EVENTS STREAM</span>
                  </h2>
                </div>
                <EventTable events={events} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
