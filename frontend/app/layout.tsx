import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WATCHGRID — Distributed Cybersecurity Monitoring & Threat Detection System",
  description: "Enterprise Security Operations Center (SOC) platform for distributed endpoint monitoring, telemetry ingestion, and automated real-time threat detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-soc-bg text-slate-100 min-h-screen antialiased selection:bg-soc-accent selection:text-black">
        {children}
      </body>
    </html>
  );
}
