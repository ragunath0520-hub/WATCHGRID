# WATCHGRID — REST API Reference

The backend REST API is built with FastAPI and provides automated OpenAPI documentation at `/docs` (Swagger UI) and `/redoc` (ReDoc).

Base URL: `http://localhost:8000` (Development) or your deployed Render URL.

---

## 1. System & Health

### `GET /`
- Returns API metadata and version.
- **Response `200 OK`**:
  ```json
  {
    "name": "WATCHGRID Security API",
    "version": "1.0.0",
    "status": "online",
    "docs": "/docs"
  }
  ```

### `GET /health`
- Verifies system and database connectivity.
- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "service": "WATCHGRID API",
    "database": "connected"
  }
  ```

---

## 2. Authentication (`/api/auth`)

### `POST /api/auth/register`
- Registers a new user (Admin / Analyst / Viewer).
- **Body**:
  ```json
  {
    "username": "analyst1",
    "email": "analyst1@watchgrid.sec",
    "password": "SecurePassword123!",
    "role": "analyst"
  }
  ```

### `POST /api/auth/login`
- Authenticates credentials and returns a Bearer JWT token.
- **Body**:
  ```json
  {
    "email": "analyst1@watchgrid.sec",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "analyst1",
      "email": "analyst1@watchgrid.sec",
      "role": "analyst"
    }
  }
  ```

### `GET /api/auth/me`
- Retrieves the currently authenticated user's profile.
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`

---

## 3. Security Events (`/api/events`)

### `POST /api/events`
- Ingests raw telemetry and executes threat detection pipeline.
- **Body**:
  ```json
  {
    "device_id": "DEV-CORP-001",
    "event_type": "LOGIN_FAILURE",
    "username": "root",
    "source_ip": "198.51.100.42",
    "description": "Failed SSH login attempt",
    "severity": "LOW",
    "metadata": { "port": 22, "attempt": 1 }
  }
  ```

### `GET /api/events`
- Query events with pagination, severity filtering, and keyword search.
- **Params**: `limit`, `offset`, `severity`, `event_type`, `source_ip`, `search`

---

## 4. Threat Detection & Alerts (`/api/threats`, `/api/alerts`)

### `GET /api/threats`
- Lists all correlated threats detected by the engine.
- **Params**: `status` (`ACTIVE`, `RESOLVED`, `IGNORED`), `severity`

### `PATCH /api/threats/{id}/status`
- Updates threat resolution status.

### `GET /api/alerts`
- Returns security alerts generated for high/critical threats.

### `PATCH /api/alerts/{id}/acknowledge`
- Transitions alert status to `ACKNOWLEDGED`.

### `PATCH /api/alerts/{id}/resolve`
- Transitions alert status to `RESOLVED`.

---

## 5. Device Management (`/api/devices`)

### `POST /api/devices/register`
- Registers an endpoint agent.
- **Body**:
  ```json
  {
    "device_id": "DEV-AGENT-09A",
    "device_name": "SecOps-Laptop-01",
    "hostname": "SECOPS-WIN11",
    "ip_address": "192.168.1.105",
    "operating_system": "Windows 11 (AMD64)",
    "agent_version": "1.0.0"
  }
  ```

### `GET /api/devices`
- Lists all registered devices with live online/offline status calculated from heartbeat timestamps.

### `PATCH /api/devices/{device_id}/heartbeat`
- Updates device `last_seen` and marks device `status` as `online`.

---

## 6. Dashboard Telemetry (`/api/dashboard/stats`)

### `GET /api/dashboard/stats`
- High-level telemetry for SOC Operations Overview:
  - Aggregate event, threat, alert, and device counts.
  - Severity distribution histograms.
  - Time-series event trends.
