import { getStoredToken, clearAuthSession } from "./auth";
import {
  User,
  LoginResponse,
  SecurityEvent,
  Threat,
  Alert,
  Device,
  DashboardStats,
  ThreatStatus,
  AlertStatus,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Avoid infinite redirect if already on login page
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        clearAuthSession();
      }
    }

    if (!response.ok) {
      let errorMsg = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (typeof errorData.detail === "string") {
          errorMsg = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMsg = errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ");
        } else if (errorData.message) {
          errorMsg = errorData.message;
        }
      } catch {
        // Fallback to response text
        const text = await response.text();
        if (text) errorMsg = text;
      }
      throw new ApiError(errorMsg, response.status);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || "Network error. WATCHGRID API server is unreachable.", 0);
  }
}

export const api = {
  auth: {
    login: (data: { email: string; password: string }) =>
      request<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    register: (data: { username: string; email: string; password: string; role?: string }) =>
      request<User>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<User>("/api/auth/me"),
  },

  events: {
    list: (params?: {
      limit?: number;
      offset?: number;
      severity?: string;
      event_type?: string;
      source_ip?: string;
      search?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.limit) q.set("limit", String(params.limit));
      if (params?.offset) q.set("offset", String(params.offset));
      if (params?.severity && params.severity !== "ALL") q.set("severity", params.severity);
      if (params?.event_type && params.event_type !== "ALL") q.set("event_type", params.event_type);
      if (params?.source_ip) q.set("source_ip", params.source_ip);
      if (params?.search) q.set("search", params.search);
      const qs = q.toString();
      return request<SecurityEvent[]>(`/api/events${qs ? `?${qs}` : ""}`);
    },
    ingest: (data: Partial<SecurityEvent>) =>
      request<SecurityEvent>("/api/events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  threats: {
    list: (params?: { status?: string; severity?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status && params.status !== "ALL") q.set("status", params.status);
      if (params?.severity && params.severity !== "ALL") q.set("severity", params.severity);
      if (params?.limit) q.set("limit", String(params.limit));
      const qs = q.toString();
      return request<Threat[]>(`/api/threats${qs ? `?${qs}` : ""}`);
    },
    get: (id: number) => request<Threat>(`/api/threats/${id}`),
    updateStatus: (id: number, status: ThreatStatus) =>
      request<Threat>(`/api/threats/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  alerts: {
    list: (params?: { status?: string; severity?: string; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.status && params.status !== "ALL") q.set("status", params.status);
      if (params?.severity && params.severity !== "ALL") q.set("severity", params.severity);
      if (params?.limit) q.set("limit", String(params.limit));
      const qs = q.toString();
      return request<Alert[]>(`/api/alerts${qs ? `?${qs}` : ""}`);
    },
    acknowledge: (id: number) =>
      request<Alert>(`/api/alerts/${id}/acknowledge`, { method: "PATCH" }),
    resolve: (id: number) =>
      request<Alert>(`/api/alerts/${id}/resolve`, { method: "PATCH" }),
  },

  devices: {
    list: () => request<Device[]>("/api/devices"),
    get: (deviceId: string) => request<Device>(`/api/devices/${deviceId}`),
    register: (data: Partial<Device>) =>
      request<Device>("/api/devices/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    heartbeat: (deviceId: string) =>
      request<Device>(`/api/devices/${deviceId}/heartbeat`, {
        method: "PATCH",
        body: JSON.stringify({ status: "online" }),
      }),
  },

  dashboard: {
    getStats: () => request<DashboardStats>("/api/dashboard/stats"),
  },

  system: {
    health: () => request<{ status: string; service: string; database: string }>("/health"),
  },
};
