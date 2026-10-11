import React from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  Server,
  Terminal,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Laptop
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-soc-bg text-slate-100 flex flex-col justify-between selection:bg-soc-accent selection:text-black">
      {/* Top Navbar */}
      <header className="border-b border-soc-border/80 bg-soc-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-soc-accent/15 border border-soc-accent/30 flex items-center justify-center text-soc-accent shadow-[0_0_15px_rgba(14,165,233,0.3)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-mono font-black tracking-wider text-base text-white">WATCHGRID</span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-0.5">
                Cybersecurity SOC System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-soc-border hover:bg-soc-surface transition"
            >
              <span>API Swagger</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <Link
              href="/login"
              className="text-xs font-mono text-slate-300 hover:text-white px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-mono font-semibold text-black bg-soc-accent hover:bg-soc-accentHover px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(14,165,233,0.3)] transition"
            >
              Register Operator
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-soc-surface border border-soc-border text-xs font-mono text-soc-accent mb-6">
            <span className="w-2 h-2 rounded-full bg-soc-cyberGreen animate-pulse" />
            <span>LEVEL 5 CYBERSECURITY ACADEMIC DEMONSTRATION</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white leading-tight">
            Distributed Cyber Telemetry & <span className="text-soc-accent">Threat Detection</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-sans mt-6 leading-relaxed">
            A real-time cybersecurity monitoring architecture. External endpoint security agents ingest event telemetry over HTTPS to an autonomous rule-based threat engine backed by PostgreSQL and a SOC operations dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-soc-accent hover:bg-soc-accentHover text-black font-mono font-bold text-sm shadow-[0_0_25px_rgba(14,165,233,0.35)] transition"
            >
              <span>Launch SOC Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-soc-card hover:bg-soc-surface border border-soc-border text-slate-200 font-mono text-sm transition"
            >
              <span>View Live Telemetry</span>
            </Link>
          </div>
        </div>

        {/* Live Architecture Flow Showcase */}
        <div className="p-8 rounded-2xl bg-soc-card border border-soc-border relative overflow-hidden mb-16 shadow-2xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-soc-border/80">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-soc-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
                END-TO-END TELEMETRY PIPELINE
              </span>
            </div>
            <span className="text-xs font-mono text-soc-cyberGreen flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-soc-cyberGreen animate-ping" />
              LIVE SYSTEM CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Step 1: External Agent */}
            <div className="p-4 rounded-xl bg-soc-surface border border-soc-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono text-white">1. Python Agent</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">Endpoint telemetry & attack simulators</p>
            </div>

            {/* Step 2: Ingestion API */}
            <div className="p-4 rounded-xl bg-soc-surface border border-soc-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono text-white">2. FastAPI Ingestion</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">REST gateway & authentication</p>
            </div>

            {/* Step 3: Threat Engine */}
            <div className="p-4 rounded-xl bg-soc-surface border border-red-500/30 flex flex-col items-center text-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400 mb-3">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono text-white">3. Threat Engine</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">5 deterministic rules & deduplication</p>
            </div>

            {/* Step 4: Database */}
            <div className="p-4 rounded-xl bg-soc-surface border border-soc-border flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 mb-3">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono text-white">4. PostgreSQL DB</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">Indexed event logs & threats</p>
            </div>

            {/* Step 5: Next.js SOC */}
            <div className="p-4 rounded-xl bg-soc-surface border border-soc-accent/40 flex flex-col items-center text-center shadow-[0_0_15px_rgba(14,165,233,0.1)]">
              <div className="w-10 h-10 rounded-lg bg-soc-accent/15 border border-soc-accent/40 flex items-center justify-center text-soc-accent mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold font-mono text-white">5. SOC Dashboard</h4>
              <p className="text-[11px] font-mono text-slate-400 mt-1">Real-time alerts, KPIs & triage</p>
            </div>
          </div>
        </div>

        {/* 5 Core Detection Rules Grid */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-mono text-white">Deterministic Threat Detection Matrix</h2>
            <p className="text-xs font-mono text-slate-400 mt-1">Sliding-window behavioral correlation algorithms</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-soc-card border border-soc-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-red-400">RULE 1 — BRUTE FORCE</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">HIGH</span>
              </div>
              <p className="text-xs font-mono text-slate-300">Trigger: ≥ 5 failed logins within 2 minutes from the same IP.</p>
              <p className="text-[11px] font-mono text-slate-500 mt-2">Dispatches active HIGH threat & instant SOC alert.</p>
            </div>

            <div className="p-5 rounded-xl bg-soc-card border border-soc-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-amber-400">RULE 2 — MULTI-ACCOUNT</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/30">MEDIUM</span>
              </div>
              <p className="text-xs font-mono text-slate-300">Trigger: Same IP authenticates against ≥ 3 distinct users in 5 min.</p>
              <p className="text-[11px] font-mono text-slate-500 mt-2">Identifies horizontal credential stuffing patterns.</p>
            </div>

            <div className="p-5 rounded-xl bg-soc-card border border-soc-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-red-400">RULE 3 — REQUEST ABUSE</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-mono font-bold border border-red-500/30">HIGH</span>
              </div>
              <p className="text-xs font-mono text-slate-300">Trigger: ≥ 30 HTTP requests from single IP within 1 minute.</p>
              <p className="text-[11px] font-mono text-slate-500 mt-2">Detects scraper bots and endpoint denial vectors.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-soc-border bg-soc-card/90 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-soc-accent" />
            <span>WATCHGRID Cybersecurity Platform — Academic Level 5</span>
          </div>
          <div>Defensive Telemetry & Real-Time Incident Response</div>
        </div>
      </footer>
    </div>
  );
}
