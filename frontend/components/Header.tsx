"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Server, RefreshCw, Activity, Terminal } from "lucide-react";
import { api } from "@/lib/api";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing = false,
}) => {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [apiStatus, setApiStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace("GMT", "UTC"));
    }, 1000);

    const checkHealth = async () => {
      try {
        await api.system.health();
        setApiStatus("connected");
      } catch {
        setApiStatus("disconnected");
      }
    };

    checkHealth();
    const healthInterval = setInterval(checkHealth, 30000);

    return () => {
      clearInterval(timer);
      clearInterval(healthInterval);
    };
  }, []);

  return (
    <header className="h-16 border-b border-soc-border bg-soc-card/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-base font-semibold text-white font-mono flex items-center gap-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-400 font-mono -mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* UTC Time */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-soc-surface border border-soc-border text-xs font-mono text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-soc-accent" />
          <span>{currentTime || "UTC SYNC..."}</span>
        </div>

        {/* Backend API Connection Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-soc-surface border border-soc-border text-xs font-mono">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">API:</span>
          {apiStatus === "connected" && (
            <span className="flex items-center gap-1.5 text-soc-cyberGreen font-semibold">
              <span className="w-2 h-2 rounded-full bg-soc-cyberGreen" />
              ONLINE
            </span>
          )}
          {apiStatus === "disconnected" && (
            <span className="flex items-center gap-1.5 text-soc-threatRed font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-soc-threatRed" />
              OFFLINE
            </span>
          )}
          {apiStatus === "checking" && (
            <span className="text-slate-400">CHECKING...</span>
          )}
        </div>

        {/* Manual Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-soc-surface hover:bg-soc-border/60 border border-soc-border text-xs font-mono text-slate-200 transition active:scale-95 disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-soc-accent ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        )}
      </div>
    </header>
  );
};
