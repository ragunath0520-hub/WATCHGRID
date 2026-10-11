export type Role = "admin" | "analyst" | "viewer";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export interface Device {
  id: number;
  device_id: string;
  device_name: string;
  hostname: string;
  ip_address: string;
  operating_system: string;
  agent_version: string;
  status: "online" | "offline" | "unknown";
  last_seen: string;
  created_at: string;
}

export type EventSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityEvent {
  id: number;
  device_id: string | null;
  event_type: string;
  username: string | null;
  source_ip: string;
  description: string;
  severity: EventSeverity;
  event_metadata: Record<string, any> | null;
  timestamp: string;
}

export type ThreatStatus = "ACTIVE" | "RESOLVED" | "IGNORED";

export interface Threat {
  id: number;
  event_type: string;
  source_ip: string;
  target_username: string | null;
  description: string;
  severity: EventSeverity;
  confidence: number;
  status: ThreatStatus;
  first_seen: string;
  last_seen: string;
  event_count: number;
}

export type AlertStatus = "NEW" | "ACKNOWLEDGED" | "RESOLVED";

export interface Alert {
  id: number;
  threat_id: number | null;
  device_id: string | null;
  title: string;
  message: string;
  severity: EventSeverity;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface CountMetric {
  name: string;
  count: number;
}

export interface TimeSeriesPoint {
  time: string;
  events: number;
  threats: number;
}

export interface DashboardStats {
  total_events: number;
  total_threats: number;
  active_threats: number;
  total_alerts: number;
  new_alerts: number;
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  events_by_severity: CountMetric[];
  events_by_type: CountMetric[];
  threats_by_severity: CountMetric[];
  events_over_time: TimeSeriesPoint[];
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface APIError {
  detail: string;
}
