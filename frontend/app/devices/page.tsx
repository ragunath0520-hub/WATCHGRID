"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { DeviceCard } from "@/components/DeviceCard";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";
import { Device } from "@/types";
import { Laptop2, Wifi, WifiOff, Terminal, Copy, Check, Plus } from "lucide-react";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchDevices = async () => {
    try {
      const data = await api.devices.list();
      setDevices(data);
    } catch (err) {
      console.error("Failed to load devices:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const offlineDevices = totalDevices - onlineDevices;

  const copyAgentCommand = () => {
    navigator.clipboard.writeText("cd agent && python agent.py --register && python agent.py --daemon");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="FLEET ENDPOINT MANAGEMENT"
          subtitle="Distributed agent monitoring, keepalive heartbeats and host inventory"
          onRefresh={() => {
            setRefreshing(true);
            fetchDevices();
          }}
          isRefreshing={refreshing}
        />

        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 rounded-xl bg-soc-card border border-soc-border flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Total Fleet Size</span>
                <span className="text-2xl font-bold text-white mt-1 block">{totalDevices}</span>
              </div>
              <Laptop2 className="w-8 h-8 text-soc-accent opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-soc-card border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Active Online Agents</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{onlineDevices}</span>
              </div>
              <Wifi className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>

            <div className="p-4 rounded-xl bg-soc-card border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block uppercase">Offline / Inactive</span>
                <span className="text-2xl font-bold text-slate-400 mt-1 block">{offlineDevices}</span>
              </div>
              <WifiOff className="w-8 h-8 text-slate-500 opacity-60" />
            </div>
          </div>

          {/* External Agent Integration Instructions */}
          <div className="p-5 rounded-xl bg-soc-card border border-soc-accent/40 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Terminal className="w-4 h-4 text-soc-accent" />
                <span>CONNECT AN EXTERNAL LAPTOP OR SERVER</span>
              </div>
              <button
                onClick={copyAgentCommand}
                className="flex items-center gap-1 text-[11px] font-mono text-soc-accent hover:text-soc-accentHover"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Command"}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-slate-400 mb-3">
              Run the Python agent on any external machine to stream real-time host telemetry into this SOC dashboard:
            </p>
            <pre className="p-3 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto">
              cd agent &amp;&amp; python agent.py --register &amp;&amp; python agent.py --daemon
            </pre>
          </div>

          {/* Device Cards Grid */}
          {loading ? (
            <LoadingState message="Polling fleet device statuses..." />
          ) : devices.length === 0 ? (
            <div className="p-12 text-center bg-soc-card rounded-2xl border border-soc-border font-mono">
              <Laptop2 className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
              <h3 className="text-sm font-bold text-white">No Devices Registered Yet</h3>
              <p className="text-xs text-slate-400 mt-1">
                Run the Python security agent to register your first endpoint.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {devices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
