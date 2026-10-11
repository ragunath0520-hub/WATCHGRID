import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";
  try {
    const now = new Date();
    const past = new Date(dateStr);
    const diffSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  } catch {
    return dateStr;
  }
}

export function getSeverityClasses(severity: string): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  const sev = (severity || "").toUpperCase();
  switch (sev) {
    case "CRITICAL":
      return {
        bg: "bg-red-950/50",
        text: "text-red-400",
        border: "border-red-600/40",
        badge: "bg-red-500/20 text-red-300 border-red-500/40",
      };
    case "HIGH":
      return {
        bg: "bg-red-950/30",
        text: "text-red-400",
        border: "border-red-500/30",
        badge: "bg-red-500/15 text-red-400 border-red-500/30",
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-950/30",
        text: "text-amber-400",
        border: "border-amber-500/30",
        badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    case "LOW":
      return {
        bg: "bg-sky-950/30",
        text: "text-sky-400",
        border: "border-sky-500/30",
        badge: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      };
    default:
      return {
        bg: "bg-slate-900/50",
        text: "text-slate-400",
        border: "border-slate-700/40",
        badge: "bg-slate-800/60 text-slate-300 border-slate-700",
      };
  }
}
