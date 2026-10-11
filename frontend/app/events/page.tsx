"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { EventTable } from "@/components/EventTable";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";
import { SecurityEvent, EventSeverity } from "@/types";
import { Search, Filter, Plus, Activity, RefreshCw } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [showIngestModal, setShowIngestModal] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    device_id: string;
    event_type: string;
    username: string;
    source_ip: string;
    severity: EventSeverity;
    description: string;
  }>({
    device_id: "DEV-CORP-SOC-01",
    event_type: "LOGIN_FAILURE",
    username: "admin",
    source_ip: "198.51.100.25",
    severity: "LOW",
    description: "Manual test authentication event from SOC console",
  });

  const fetchEvents = async () => {
    try {
      const data = await api.events.list({
        severity: severityFilter,
        event_type: typeFilter,
        search: search || undefined,
        limit: 100,
      });
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.events.ingest(newEvent);
      setShowIngestModal(false);
      fetchEvents();
    } catch (err: any) {
      alert(`Error ingesting event: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="SECURITY TELEMETRY LOGS"
          subtitle="Real-time chronological security event stream"
          onRefresh={() => {
            setRefreshing(true);
            fetchEvents();
          }}
          isRefreshing={refreshing}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search IP, username, description, device..."
                className="w-full bg-soc-card border border-soc-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-soc-accent"
              />
            </form>

            {/* Filters & Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-soc-card border border-soc-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-soc-accent"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="INFO">INFO</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-soc-card border border-soc-border rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-soc-accent"
              >
                <option value="ALL">All Event Types</option>
                <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
                <option value="REQUEST">REQUEST</option>
                <option value="PROCESS">PROCESS</option>
                <option value="NETWORK">NETWORK</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>

              <button
                onClick={() => setShowIngestModal(true)}
                className="px-4 py-2.5 rounded-xl bg-soc-accent hover:bg-soc-accentHover text-black font-mono font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Ingest Event</span>
              </button>
            </div>
          </div>

          {/* Ingest Modal */}
          {showIngestModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-soc-card border border-soc-border rounded-2xl p-6 max-w-lg w-full shadow-2xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-soc-border">
                  <h3 className="text-sm font-bold font-mono text-white">Manual Event Ingestion</h3>
                  <button
                    onClick={() => setShowIngestModal(false)}
                    className="text-slate-400 hover:text-white text-xs font-mono"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleIngestSubmit} className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Device ID</label>
                    <input
                      type="text"
                      value={newEvent.device_id}
                      onChange={(e) => setNewEvent({ ...newEvent, device_id: e.target.value })}
                      className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Event Type</label>
                      <select
                        value={newEvent.event_type}
                        onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                        className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white"
                      >
                        <option value="LOGIN_FAILURE">LOGIN_FAILURE</option>
                        <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                        <option value="REQUEST">REQUEST</option>
                        <option value="NETWORK">NETWORK</option>
                        <option value="SYSTEM">SYSTEM</option>
                        <option value="PROCESS">PROCESS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Severity</label>
                      <select
                        value={newEvent.severity}
                        onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value as EventSeverity })}
                        className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white"
                      >
                        <option value="INFO">INFO</option>
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1">Source IP</label>
                      <input
                        type="text"
                        value={newEvent.source_ip}
                        onChange={(e) => setNewEvent({ ...newEvent, source_ip: e.target.value })}
                        className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Target Username</label>
                      <input
                        type="text"
                        value={newEvent.username}
                        onChange={(e) => setNewEvent({ ...newEvent, username: e.target.value })}
                        className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Description</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full bg-soc-surface border border-soc-border rounded-lg p-2 text-white h-20"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowIngestModal(false)}
                      className="px-4 py-2 rounded-lg bg-soc-surface text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-soc-accent text-black font-bold"
                    >
                      Dispatch Event
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Events Stream Table */}
          {loading ? (
            <LoadingState message="Fetching events stream..." />
          ) : (
            <EventTable events={events} />
          )}
        </main>
      </div>
    </div>
  );
}
