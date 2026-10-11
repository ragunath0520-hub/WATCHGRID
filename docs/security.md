# WATCHGRID — Security Specification & Threat Detection Model

## 1. Threat Detection Rules

The WATCHGRID Threat Detection Engine applies 5 deterministic behavioral rules with sliding-time window evaluation:

| Rule ID | Name | Trigger Condition | Severity | Confidence | Description | Action |
|---|---|---|---|---|---|---|
| **RULE 1** | **Brute Force Detection** | $\ge 5$ `LOGIN_FAILURE` events from same `source_ip` within **2 minutes** | `HIGH` | 90% | Possible brute-force login attack detected. | Creates active Threat + High Alert |
| **RULE 2** | **Distributed Account Attack** | Same `source_ip` attempts login against $\ge 3$ distinct `username`s within **5 minutes** | `MEDIUM` | 80% | Multiple-account authentication attack detected. | Creates active Threat |
| **RULE 3** | **Rapid Request Abuse** | $\ge 30$ `REQUEST` events from same `source_ip` within **1 minute** | `HIGH` | 85% | Abnormally high request rate detected. | Creates active Threat + High Alert |
| **RULE 4** | **Repeated Login Failure** | $\ge 3$ failed logins from same `source_ip` within **5 minutes** | `MEDIUM` | 75% | Repeated authentication failures detected. | Creates active Threat |
| **RULE 5** | **Suspicious Volume Storm** | $\ge 10$ security events of any type from same `source_ip` within **5 minutes** | `HIGH` | 85% | Suspicious activity volume detected from source IP. | Creates active Threat + High Alert |

---

## 2. Threat Deduplication & State Machine

To prevent alert storms and alert fatigue for SOC analysts:
1. When an event triggers a detection rule, the engine queries active threats (`status = 'ACTIVE'`) matching `(source_ip, event_type)`.
2. If an active threat exists:
   - `last_seen` is updated to current UTC timestamp.
   - `event_count` is incremented.
   - `confidence` is escalated (up to a ceiling of 99%).
   - Associated alert timestamps are refreshed.
3. If no active threat exists, a new `Threat` record is created, and if severity is `HIGH` or `CRITICAL`, an `Alert` is raised with `status = 'NEW'`.

---

## 3. Defensive Security Architecture

### 3.1 Authentication & Password Security
- Passwords are encrypted using standard **bcrypt** hashing with secure salting.
- Plaintext passwords are never logged, stored, or returned in serialized outputs.
- Stateless authentication utilizes **HMAC-SHA256 Signed JSON Web Tokens (JWT)** with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).

### 3.2 Role-Based Access Control (RBAC)
- **Admin**: Full administrative privileges including user management, alert resolution, device revocation, and system settings.
- **Analyst**: Access to event telemetry, threat investigation, alert lifecycle triage (`ACKNOWLEDGED`/`RESOLVED`), and device registry.
- **Viewer**: Read-only telemetry monitoring and dashboard views.

### 3.3 Database & Injection Protection
- All queries leverage SQLAlchemy 2.0 ORM with parameterized binding, completely preventing SQL Injection (SQLi).
- Foreign key constraints maintain relational integrity across devices, events, threats, and alerts.
- Dedicated database indexes on `(source_ip, timestamp)`, `(event_type)`, `(device_id)`, and `(severity)` guarantee sub-millisecond query execution even during high event ingestion rates.

### 3.4 API Security
- Input validation enforced on all endpoints via Pydantic v2 schemas.
- Strict CORS policies configurable per environment (`CORS_ORIGINS`).
- Structured error handling ensures internal database schemas, connection strings, and stack traces are never exposed in production responses.
