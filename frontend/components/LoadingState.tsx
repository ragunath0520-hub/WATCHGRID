import React from "react";
import { ShieldAlert } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Synchronizing telemetry..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-soc-accent/20 border-t-soc-accent animate-spin" />
        <ShieldAlert className="w-5 h-5 text-soc-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" />
      </div>
      <p className="text-sm font-mono text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};
