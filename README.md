# WATCHGRID — Distributed Cybersecurity Monitoring & Threat Detection System

[![Level 5 Academic Project](https://img.shields.io/badge/Academic%20Project-Level%205%20Cybersecurity-blue.svg)](#)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python%203.13-009688.svg)](#)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20%7C%20TypeScript-000000.svg)](#)
[![Database](https://img.shields.io/badge/Database-SQLite%20(WAL%20Mode)-003B57.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Executive Summary & Problem Statement

Modern enterprise networks face distributed brute-force attacks, horizontal credential stuffing (multi-account spraying), automated endpoint crawling, and suspicious volume storms from adversarial source IPs. Traditional static log collection often suffers from high latency, alert fatigue, and lack of real-time event correlation.

**WATCHGRID** is a distributed cybersecurity monitoring and autonomous threat detection platform. Lightweight external security agents running on distributed workstations stream encrypted telemetry over HTTPS to a high-throughput FastAPI ingestion layer. Incoming events are immediately evaluated by an autonomous sliding-window **Threat Detection Engine**, correlated against historical activity in an embedded SQLite database with Write-Ahead Logging (WAL), deduplicated to eliminate alert storms, and presented to analysts in a modern, dark Security Operations Center (SOC) dashboard.

---

## 2. Core Architecture & Telemetry Pipeline

```
  External Laptop / Device (Workstation)
                 │
                 ▼
  WATCHGRID Python Security Agent (agent.py)
                 │
                 ▼ [HTTPS REST API / JSON]
  FastAPI Ingestion Gateway (Port 8000)
                 │
                 ├─► JWT & Agent Authentication
                 ├─► Rate Limiting & Input Validation
                 ├─► Event Store (PostgreSQL / Neon)
                 │
                 ▼
  Autonomous Threat Detection Engine
                 │
                 ├─► Rule 1: Brute Force (>= 5 fails / 2m) ────► [HIGH Threat + Alert]
                 ├─► Rule 2: Multi-Account (>= 3 users / 5m) ──► [MEDIUM Threat]
                 ├─► Rule 3: Request Flood (>= 30 req / 1m) ───► [HIGH Threat + Alert]
                 ├─► Rule 4: Repeated Failures (>= 3 / 5m) ────► [MEDIUM Threat]
                 ├─► Rule 5: Volume Storm (>= 10 evts / 5m) ───► [HIGH Threat + Alert]
                 │
                 ▼
  Deduplication & Correlation State Engine
                 │
                 ▼
  Next.js 14 SOC Operations Console (Port 3000)
```

---

## 3. Technology Stack

### Backend & API
* **Language / Framework:** Python 3.13+, FastAPI, Uvicorn (ASGI)
* **ORM & Database:** SQLAlchemy 2.0, SQLite (WAL mode, high concurrency, zero-configuration)
* **Validation & Security:** Pydantic v2, Passlib with Bcrypt password hashing, PyJWT / Python-Jose (HMAC-SHA256 JWT)
* **Testing:** Pytest, FastApi TestClient, HTTPX

### Security Operations Center (Frontend)
* **Framework:** Next.js 14 (App Router), React 18, TypeScript
* **Styling & Icons:** Tailwind CSS (Dark SOC Theme), Lucide Icons
* **Telemetry Visualizers:** Recharts (Area charts, Severity bar distribution)
* **Security Architecture:** Client-side state hydration, Bearer JWT session management, RBAC enforcement

### Endpoint Security Agent
* **Runtime:** Python 3 standard library + `requests` & `psutil`
* **Telemetry Diagnostics:** Hostname, local IP, OS metadata, platform architecture, CPU/RAM utilization
* **Safety Boundaries:** Strictly non-invasive defensive monitoring and academic simulation payloads. No persistence, keylogging, or exploit behavior.

---

## 4. Repository & Project Structure

```
WATCHGRID/
├── docker-compose.yml           # Unified orchestration (Postgres, Backend, Frontend, Agent)
├── .env.example                 # Root Docker environment variables template
├── .dockerignore                # Root Docker build ignore patterns
├── backend/
│   ├── Dockerfile               # Backend production container image
│   ├── docker-entrypoint.sh     # DB readiness check & auto-seeding entrypoint
│   ├── .dockerignore            # Backend container ignore patterns
│   ├── main.py                  # FastAPI entrypoint, middleware, health check
│   ├── database.py              # Database engine, connection pooling, SessionLocal
│   ├── models.py                # SQLAlchemy ORM models (User, Device, Event, Threat, Alert)
│   ├── schemas.py               # Pydantic validation schemas
│   ├── auth.py                  # Bcrypt hashing & JWT signing/decoding
│   ├── dependencies.py          # RBAC & API Key authentication dependencies
│   ├── seed.py                  # Database seeder (Admin, Analyst, Viewer, demo devices & events)
│   ├── test_backend.py          # Comprehensive Pytest test suite
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Local environment configuration
│   ├── .env.example             # Configuration template
│   ├── routers/
│   │   ├── auth.py              # /api/auth/register, /api/auth/login, /api/auth/me
│   │   ├── events.py            # /api/events (Ingest & Query)
│   │   ├── threats.py           # /api/threats (Threat matrix & status update)
│   │   ├── alerts.py            # /api/alerts (Triage, acknowledge, resolve)
│   │   ├── devices.py           # /api/devices (Register, list, heartbeat)
│   │   └── dashboard.py         # /api/dashboard/stats (Aggregated KPIs & histograms)
│   ├── security/
│   │   ├── detector.py          # Real-time ThreatDetector & correlation engine
│   │   ├── rules.py             # 5 sliding-window detection rules
│   │   └── severity.py          # Severity ranking & comparison utilities
│   └── services/
│       ├── event_service.py     # Event persistence & pipeline triggering
│       ├── alert_service.py     # Alert dispatch & resolution lifecycle
│       └── device_service.py    # Fleet registry & offline calculation
│
├── frontend/
│   ├── Dockerfile               # Multi-stage Next.js standalone container image
│   ├── .dockerignore            # Frontend container ignore patterns
│   ├── app/
│   │   ├── page.tsx             # Public landing page & architecture overview
│   │   ├── login/page.tsx       # Operator login with demo credential quick-fills
│   │   ├── register/page.tsx    # Operator registration & RBAC selection
│   │   ├── dashboard/page.tsx   # Live SOC Operations dashboard & test-bed
│   │   ├── events/page.tsx      # Chronological security telemetry log stream
│   │   ├── threats/page.tsx     # Correlated Threat matrix & deduplication
│   │   ├── alerts/page.tsx      # Alert center (Acknowledge / Resolve)
│   │   ├── devices/page.tsx     # Fleet devices & external agent connector
│   │   ├── settings/page.tsx    # SOC rules parameter viewer & user profile
│   │   ├── layout.tsx           # Dark theme root layout
│   │   └── globals.css          # SOC custom scrollbars and cyber styling
│   ├── components/
│   │   ├── Sidebar.tsx          # SOC navigation bar
│   │   ├── Header.tsx           # Real-time UTC clock & API health indicator
│   │   ├── StatCard.tsx         # Metric KPI card
│   │   ├── ThreatTable.tsx      # Threat matrix table with inline actions
│   │   ├── EventTable.tsx       # Event stream table with raw JSON inspector
│   │   ├── AlertCard.tsx        # High-priority alert card with action buttons
│   │   ├── DeviceCard.tsx       # Endpoint device status card
│   │   ├── ThreatChart.tsx      # Time-series Recharts visualizers
│   │   └── LoadingState.tsx     # Skeleton loading state
│   ├── lib/
│   │   ├── api.ts               # Centralized typed API client
│   │   ├── auth.ts              # LocalStorage JWT token management
│   │   └── utils.ts             # Date formatting & severity styling helpers
│   ├── types/index.ts           # Strongly-typed TypeScript interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.ts
│
├── agent/
│   ├── Dockerfile               # Agent simulation container image
│   ├── .dockerignore            # Agent container ignore patterns
│   ├── agent.py                 # Endpoint security agent & simulation runner
│   ├── config.py                # Agent configuration & node ID generator
│   ├── requirements.txt         # Agent dependencies (requests, psutil)
│   └── README.md                # Agent setup and CLI reference
│
├── docs/
│   ├── architecture.md          # Detailed system architecture specification
│   ├── api.md                   # Complete REST API endpoint reference
│   ├── security.md              # Security model & threat detection formulas
│   └── deployment.md            # Production deployment guide (Docker, Neon, Render, Vercel)
│
├── .gitignore                   # Ignores .env, venv/, node_modules/, *.db
├── README.md                    # Project documentation
└── LICENSE                      # MIT License
```

---

## 5. Threat Detection Engine Rules

| Rule ID | Rule Name | Trigger Condition | Severity | Confidence | Incident Action |
|---|---|---|---|---|---|
| **RULE 1** | **Brute-Force Attack** | $\ge 5$ `LOGIN_FAILURE` events from same IP within **2 minutes** | `HIGH` | 90% | Creates active Threat + High Alert |
| **RULE 2** | **Multi-Account Spray** | Same IP attempts authentication on $\ge 3$ distinct users within **5 minutes** | `MEDIUM` | 80% | Creates active Threat |
| **RULE 3** | **Rapid Request Flood** | $\ge 30$ `REQUEST` events from same IP within **1 minute** | `HIGH` | 85% | Creates active Threat + High Alert |
| **RULE 4** | **Repeated Login Failures**| $\ge 3$ failed logins from same IP within **5 minutes** | `MEDIUM` | 75% | Creates active Threat |
| **RULE 5** | **Volume Storm Activity** | $\ge 10$ security events of any type from same IP within **5 minutes** | `HIGH` | 85% | Creates active Threat + High Alert |

### Threat Deduplication Logic
To prevent alert fatigue in the SOC:
* When an incoming event triggers a rule, the engine checks for an existing `ACTIVE` threat matching `(source_ip, event_type)`.
* If found, the engine updates `last_seen`, increments `event_count`, and adjusts `confidence` instead of creating redundant rows.

---

## 6. Quick Start & Execution

### Option A: 1-Command Startup via Docker Compose (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Compose.

```bash
# 1. Clone repository
git clone https://github.com/ragunath0520-hub/WATCHGRID.git
cd WATCHGRID

# 2. Build and launch the stack (FastAPI Backend with SQLite + Next.js 14 SOC)
docker compose up --build -d

# 3. View live logs across all containers
docker compose logs -f
```

All services are instantly available:
* **SOC Operations Dashboard:** `http://localhost:3000`
* **FastAPI Backend & Interactive Swagger UI:** `http://localhost:8000/docs`
* **Health Check & Diagnostics:** `http://localhost:8000/health`
* **SQLite Database:** Automatically created in persistent volume (`/app/data/watchgrid.db`), seeded with default users and baseline telemetry

#### Testing Attacks with the Docker Security Agent
```bash
# Launch background telemetry sensor daemon
docker compose --profile agent up -d

# Execute simulated cyber attack vectors
docker compose run --rm agent python agent.py --test-bruteforce
docker compose run --rm agent python agent.py --test-request-abuse
docker compose run --rm agent python agent.py --test-multi-account
```

#### Stopping the Docker Stack
```bash
docker compose down

# To also clear PostgreSQL database volume:
docker compose down -v
```

---

### Option B: Manual Local Development

#### Prerequisites
* Python 3.10+ (Python 3.13 tested)
* Node.js 18+ and npm 9+

---

#### Step 1: Start the Backend

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed database with default users, devices, and sample events
python seed.py

# 3. Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at:
* Root: `http://localhost:8000`
* Swagger UI Docs: `http://localhost:8000/docs`
* Health Check: `http://localhost:8000/health`

---

### Step 2: Start the Next.js Frontend

```bash
cd frontend

# 1. Install npm packages
npm install

# 2. Start Next.js development server
npm run dev
```
Access the SOC Console at: `http://localhost:3000`

---

### Default Demo Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@watchgrid.sec` | `AdminPass123!` | Full Administration, Alert Resolution, RBAC |
| **Analyst** | `analyst@watchgrid.sec` | `AnalystPass123!` | Event Ingestion, Threat Matrix, Alert Triage |
| **Viewer** | `viewer@watchgrid.sec` | `ViewerPass123!` | Read-Only Telemetry & Dashboards |

*(You can also use the 1-click credential fill buttons on `/login`)*

---

## 7. Running the Python Security Agent & Live Demonstration

On your local machine or an external laptop/device:

```bash
cd agent
pip install -r requirements.txt

# 1. Check Agent & Backend Connectivity
python agent.py --status

# 2. Register Device with WATCHGRID
python agent.py --register

# 3. Send Keepalive Heartbeat
python agent.py --heartbeat

# 4. Trigger Live Brute-Force Attack Simulation (The Primary Academic Demo)
python agent.py --test-bruteforce

# 5. Trigger Rapid Request Flood Simulation
python agent.py --test-request-abuse

# 6. Trigger Multi-Account Credential Spray Simulation
python agent.py --test-multi-account

# 7. Run Agent as Background Daemon
python agent.py --daemon
```

### Demonstration Flow:
1. Open the Dashboard (`/dashboard`).
2. Run `python agent.py --test-bruteforce` on your terminal.
3. The agent sends 6 failed login attempts.
4. The backend threat detection engine identifies the brute-force pattern ($6 \ge 5$).
5. A **HIGH Severity Threat** is created and deduplicated.
6. A **HIGH Priority Alert** is immediately dispatched.
7. The dashboard KPIs, Threat Matrix, and Alert Center update in real-time.
8. The analyst acknowledges or resolves the alert directly from the UI.

---

## 8. Automated Testing

Run the automated backend test suite:
```bash
cd backend
pytest -v test_backend.py
```
**Verification Coverage:**
* Health & root system checks
* User authentication & JWT bearer decoding
* Role-based authorization
* Device registration & heartbeat keepalive
* Security event ingestion
* Brute-force rule triggering ($5+$ failed logins $\to$ HIGH Threat)
* Deduplication verification
* Alert creation & resolution workflow
* Dashboard statistics aggregation

---

## 9. Production Deployment

* **Database:** Provision a serverless PostgreSQL instance on [Neon.tech](https://neon.tech) and set `DATABASE_URL`.
* **Backend:** Deploy `backend/` to [Render](https://render.com) using `uvicorn main:app --host 0.0.0.0 --port $PORT`.
* **Frontend:** Deploy `frontend/` to [Vercel](https://vercel.com) with `NEXT_PUBLIC_API_URL` pointing to your Render backend.
* See [`docs/deployment.md`](docs/deployment.md) for step-by-step instructions.

---

## 10. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
