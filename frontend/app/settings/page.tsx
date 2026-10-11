"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getStoredUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { Shield, Key, Sliders, Database, Server, UserCheck, Lock } from "lucide-react";

export default function SettingsPage() {
  const user = getStoredUser();
  const [health, setHealth] = useState<{ status: string; service: string; database: string } | null>(null);

  useEffect(() => {
    api.system.health().then(setHealth).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-soc-bg text-slate-100">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="SOC SYSTEM SETTINGS & CONFIGURATION"
          subtitle="Security policy enforcement, threat parameters and API access"
        />

        <main className="p-6 space-y-6 max-w-5xl w-full mx-auto font-mono">
          {/* Operator Profile */}
          <div className="p-6 rounded-xl bg-soc-card border border-soc-border">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-soc-border">
              <UserCheck className="w-5 h-5 text-soc-accent" />
              <h2 className="text-sm font-bold text-white">AUTHENTICATED OPERATOR PROFILE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60">
                <span className="text-[10px] text-slate-500 uppercase block">Username</span>
                <span className="text-white font-bold">{user?.username || "admin"}</span>
              </div>
              <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60">
                <span className="text-[10px] text-slate-500 uppercase block">Email</span>
                <span className="text-white font-bold">{user?.email || "admin@watchgrid.sec"}</span>
              </div>
              <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60">
                <span className="text-[10px] text-slate-500 uppercase block">Role Privilege</span>
                <span className="text-soc-accent uppercase font-bold">{user?.role || "admin"}</span>
              </div>
            </div>
          </div>

          {/* Active Detection Engine Rules */}
          <div className="p-6 rounded-xl bg-soc-card border border-soc-border">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-soc-border">
              <Sliders className="w-5 h-5 text-soc-accent" />
              <h2 className="text-sm font-bold text-white">ACTIVE THREAT DETECTION PARAMETERS</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-lg bg-soc-surface border border-soc-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rule 1: Brute Force Authentication</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Threshold: ≥ 5 LOGIN_FAILURE events from same IP within 2 minutes</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                  HIGH SEVERITY
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-soc-surface border border-soc-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rule 2: Distributed Multi-Account Spray</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Threshold: Same IP attempts login on ≥ 3 distinct usernames in 5 minutes</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  MEDIUM SEVERITY
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-soc-surface border border-soc-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rule 3: Rapid Request Abuse &amp; Flood</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Threshold: ≥ 30 HTTP REQUEST events from same IP in 1 minute</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                  HIGH SEVERITY
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-soc-surface border border-soc-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rule 4: Repeated Login Failures</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Threshold: ≥ 3 failed logins from same IP in 5 minutes</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  MEDIUM SEVERITY
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-soc-surface border border-soc-border/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Rule 5: Suspicious Volume Storm</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Threshold: ≥ 10 security events of any type from same IP in 5 minutes</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold">
                  HIGH SEVERITY
                </span>
              </div>
            </div>
          </div>

          {/* System & Database Connectivity */}
          <div className="p-6 rounded-xl bg-soc-card border border-soc-border">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-soc-border">
              <Server className="w-5 h-5 text-soc-accent" />
              <h2 className="text-sm font-bold text-white">RUNTIME ENVIRONMENT &amp; PERSISTENCE</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60">
                <span className="text-[10px] text-slate-500 uppercase block">Backend Service</span>
                <span className="text-white font-bold">{health?.service || "WATCHGRID API (FastAPI)"}</span>
              </div>
              <div className="p-3 rounded-lg bg-soc-surface border border-soc-border/60">
                <span className="text-[10px] text-slate-500 uppercase block">Database Status</span>
                <span className="text-emerald-400 font-bold">{health?.database || "Connected (PostgreSQL/Neon Ready)"}</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
