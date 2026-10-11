"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Check } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.auth.login({ email, password });
      setAuthSession(res.access_token, res.user);
      router.push("/dashboard");
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err?.message || "Failed to authenticate. Verify that the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-soc-bg flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-soc-accent/15 border border-soc-accent/40 flex items-center justify-center text-soc-accent mx-auto mb-3 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-mono text-white tracking-wide">WATCHGRID SOC</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">Operator Authentication Gateway</p>
        </div>

        {/* Login Card */}
        <div className="bg-soc-card border border-soc-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3 text-xs font-mono text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Operator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@watchgrid.sec"
                  required
                  className="w-full bg-soc-surface border border-soc-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-soc-surface border border-soc-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-soc-accent focus:ring-1 focus:ring-soc-accent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-soc-accent hover:bg-soc-accentHover text-black font-bold text-xs py-3 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Validating Cryptographic Session...</span>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-soc-border/80">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-3">
              <KeyRound className="w-3.5 h-3.5 text-soc-accent" />
              <span>Demo Academic Credentials (Click to fill):</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => fillCredentials("admin@watchgrid.sec", "AdminPass123!")}
                className="p-2 rounded-lg bg-soc-surface hover:bg-soc-border/60 border border-soc-border text-slate-300 hover:text-white transition text-center"
              >
                <div className="font-bold text-white">Admin</div>
                <div className="text-[9px] text-slate-500">Full Access</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("analyst@watchgrid.sec", "AnalystPass123!")}
                className="p-2 rounded-lg bg-soc-surface hover:bg-soc-border/60 border border-soc-border text-slate-300 hover:text-white transition text-center"
              >
                <div className="font-bold text-white">Analyst</div>
                <div className="text-[9px] text-slate-500">Triage SOC</div>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("viewer@watchgrid.sec", "ViewerPass123!")}
                className="p-2 rounded-lg bg-soc-surface hover:bg-soc-border/60 border border-soc-border text-slate-300 hover:text-white transition text-center"
              >
                <div className="font-bold text-white">Viewer</div>
                <div className="text-[9px] text-slate-500">Read-Only</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center text-xs font-mono text-slate-500 mt-6">
          Need a new operator account?{" "}
          <Link href="/register" className="text-soc-accent hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
