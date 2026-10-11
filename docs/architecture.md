# WATCHGRID — Architecture Specification

## 1. System Architecture Overview

WATCHGRID is a distributed cybersecurity monitoring, telemetry ingestion, and automated threat detection system designed for enterprise security operations centers (SOC) and distributed endpoint fleets.

```mermaid
flowchart TD
    subgraph Endpoints["External Security Agents (Endpoints)"]
        EA1["Agent 1 (Laptop/Workstation)"]
        EA2["Agent 2 (Linux Server)"]
        EA3["Agent 3 (Cloud Node)"]
    end

    subgraph Ingestion["API Gateway & Ingestion Layer"]
        API["FastAPI Backend (Uvicorn)"]
        AUTH["JWT & API Key Auth Middleware"]
        RATE["Rate Limiter & Input Validator"]
    end

    subgraph SecurityEngine["Threat Detection & Alert Pipeline"]
        DET["Rule-based Threat Engine"]
        R1["Rule 1: Brute Force (5+ fails/2min)"]
        R2["Rule 2: Distributed User Attack (3+ users/5min)"]
        R3["Rule 3: Rapid Request Abuse (30+ req/1min)"]
        R4["Rule 4: Repeated Login Failures (3+ fails/5min)"]
        R5["Rule 5: Suspicious Volume (10+ events/5min)"]
        DEDUP["Threat Deduplication & Correlation"]
        ALERT_ENG["Alert Dispatcher (High/Critical)"]
    end

    subgraph Storage["Persistent Data Store"]
        DB[(PostgreSQL / Neon Database)]
        TBL_USER[("Users & RBAC")]
        TBL_DEV[("Devices & Heartbeats")]
        TBL_EVT[("Security Events")]
        TBL_THR[("Correlated Threats")]
        TBL_ALT[("Active Alerts")]
    end

    subgraph Presentation["SOC Security Dashboard (Next.js)"]
        UI["Next.js 15 SOC Interface"]
        DASH["Live SOC Telemetry"]
        THRM["Threat Management"]
        ALTM["Alert Operations Center"]
        DEVM["Endpoint Fleet Control"]
    end

    EA1 -->|HTTPS REST / JSON| AUTH
    EA2 -->|HTTPS REST / JSON| AUTH
    EA3 -->|HTTPS REST / JSON| AUTH
    AUTH --> RATE
    RATE --> API
    API -->|Ingest Event| DET
    API -->|Store Event| TBL_EVT
    DET --> R1 & R2 & R3 & R4 & R5
    R1 & R2 & R3 & R4 & R5 --> DEDUP
    DEDUP -->|Upsert Threat| TBL_THR
    DEDUP -->|Trigger High/Critical| ALERT_ENG
    ALERT_ENG -->|Create Alert| TBL_ALT
    API --> DB
    UI -->|REST API / JWT| API
    UI --> DASH & THRM & ALTM & DEVM
```

---

## 2. Component Breakdown

### 2.1 Security Agent (`agent/agent.py`)
- Standalone Python daemon or CLI tool.
- Non-invasive diagnostic telemetry: retrieves hostname, local IP, OS metadata, platform info, and runtime stats using standard libraries (`socket`, `platform`, `psutil`, `requests`).
- Dispatches secure heartbeats periodically (`PATCH /api/devices/{device_id}/heartbeat`).
- Simulates realistic security events and attack vectors (Brute-force, Distributed User Attack, Rapid Request Storm) for academic validation and defense readiness testing.

### 2.2 Ingestion & API Layer (`backend/main.py`)
- Built with **FastAPI** on asynchronous ASGI (`uvicorn`).
- Enforces strict Pydantic schemas, parameter validation, and rate-limiting on authentication routes.
- Dual-mode authentication:
  1. **JWT (Bearer tokens)** for Dashboard users with Role-Based Access Control (Admin, Analyst, Viewer).
  2. **API Keys / Device IDs** for Agent ingestion and heartbeat pings.

### 2.3 Threat Detection Engine (`backend/security/`)
- Real-time event correlation engine executing immediately upon event insertion.
- Evaluates rolling sliding windows per `source_ip` / `target_username`.
- Intelligent deduplication: if an active threat is identified for a given IP and attack pattern, it increments `event_count`, recalculates `confidence`, and refreshes `last_seen` timestamp rather than saturating logs with duplicates.
- Severity classification: `INFO`, `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

### 2.4 Alert Pipeline (`backend/services/alert_service.py`)
- Automatically dispatches high-priority Alert records when `HIGH` or `CRITICAL` threats are detected.
- Supports lifecycle states: `NEW` ➔ `ACKNOWLEDGED` ➔ `RESOLVED`.

### 2.5 SOC Dashboard (`frontend/`)
- Next.js App Router, TypeScript, Tailwind CSS, and Recharts.
- Dark SOC aesthetic optimized for Security Operation Center operators.
- Granular pages for Dashboard KPIs, Event Log Stream, Threat Detection Matrix, Alert Management, Fleet Devices, and System Configuration.
