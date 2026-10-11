"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Activity,
  AlertTriangle,
  BellRing,
  Laptop2,
  Settings,
  LogOut,
  ChevronRight,
  Radio
} from "lucide-react";
import { clearAuthSession, getStoredUser } from "@/lib/auth";

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login");
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Events Stream", href: "/events", icon: Activity },
    { label: "Threat Matrix", href: "/threats", icon: AlertTriangle },
    { label: "Alert Center", href: "/alerts", icon: BellRing },
    { label: "Fleet Devices", href: "/devices", icon: Laptop2 },
    { label: "SOC Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-soc-card border-r border-soc-border flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-soc-border gap-3">
          <div className="w-9 h-9 rounded-lg bg-soc-accent/15 border border-soc-accent/30 flex items-center justify-center text-soc-accent shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black tracking-wider text-base text-white">WATCHGRID</span>
              <span className="w-2 h-2 rounded-full bg-soc-cyberGreen animate-ping" />
            </div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block -mt-0.5">
              SOC DEFENSE v1.0
            </span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="px-4 py-3 m-3 rounded-md bg-soc-surface border border-soc-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-soc-cyberGreen animate-pulse" />
            <span className="text-xs font-mono text-slate-300">TELEMETRY ENGINE</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-soc-cyberGreen/10 text-soc-cyberGreen border border-soc-cyberGreen/30">
            ACTIVE
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono transition-all duration-150 ${
                  isActive
                    ? "bg-soc-accent/15 text-soc-accent border border-soc-accent/30 font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-soc-surface/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-soc-accent" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-soc-accent" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info & Logout */}
      <div className="p-4 border-t border-soc-border bg-soc-surface/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono text-xs font-bold text-slate-200">
              {user?.username ? user.username.slice(0, 2).toUpperCase() : "OP"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.username || "SOC Operator"}</p>
              <p className="text-[10px] font-mono uppercase text-soc-accent">{user?.role || "analyst"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg border border-red-900/30 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
};
