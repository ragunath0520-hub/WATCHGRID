import React from "react";
import { Device } from "@/types";
import { formatRelativeTime, formatDate } from "@/lib/utils";
import { Laptop, Activity, Wifi, WifiOff, HardDrive, Cpu } from "lucide-react";

interface DeviceCardProps {
  device: Device;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({ device }) => {
  const isOnline = device.status === "online";

  return (
    <div
      className={`p-5 rounded-xl bg-soc-card border transition-all duration-200 ${
        isOnline
          ? "border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.06)] hover:border-emerald-500/50"
          : "border-soc-border hover:border-slate-700 opacity-80"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-lg border ${
              isOnline
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
          >
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{device.device_name}</h3>
            <p className="text-xs font-mono text-slate-400">{device.hostname}</p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
            isOnline
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-slate-800 text-slate-400 border-slate-700"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            }`}
          />
          {device.status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
        <div className="p-2.5 rounded-lg bg-soc-surface border border-soc-border/60">
          <span className="text-[10px] text-slate-500 block uppercase">Device ID</span>
          <span className="text-slate-200 font-semibold truncate block" title={device.device_id}>
            {device.device_id}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-soc-surface border border-soc-border/60">
          <span className="text-[10px] text-slate-500 block uppercase">IP Address</span>
          <span className="text-slate-200 font-semibold truncate block">{device.ip_address}</span>
        </div>
        <div className="p-2.5 rounded-lg bg-soc-surface border border-soc-border/60 col-span-2">
          <span className="text-[10px] text-slate-500 block uppercase">Operating System</span>
          <span className="text-slate-200 font-semibold truncate block">{device.operating_system}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-soc-border/60 text-[11px] font-mono text-slate-400">
        <span>Agent v{device.agent_version}</span>
        <span title={formatDate(device.last_seen)}>
          Last seen {formatRelativeTime(device.last_seen)}
        </span>
      </div>
    </div>
  );
};
