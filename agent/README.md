# WATCHGRID — Python Endpoint Security Agent

Defensive monitoring agent for distributed workstations and cloud instances. Collects non-invasive system metrics, reports heartbeats, and dispatches real-time security events to WATCHGRID.

---

## 1. Quick Start

### Installation
```bash
cd agent
pip install -r requirements.txt
```

### Environment Setup (Optional)
```bash
# Set custom remote API URL if deployed to Render or cloud
export WATCHGRID_API_URL="https://your-backend.onrender.com"
export WATCHGRID_DEVICE_ID="DEV-LAPTOP-ALPHA"
```

---

## 2. Usage Commands

| Command | Purpose |
|---|---|
| `python agent.py --status` | Display local system telemetry and test API connectivity |
| `python agent.py --register` | Register the device with WATCHGRID API |
| `python agent.py --heartbeat` | Send a keepalive ping to update device status to ONLINE |
| `python agent.py --daemon` | Run continuous monitoring daemon (heartbeat every 30s) |

---

## 3. Academic Threat Simulation Vectors

| Simulation Command | Attack Vector Tested | Triggered Rule | Expected Detection Result |
|---|---|---|---|
| `python agent.py --test-bruteforce` | 6 failed SSH/login attempts from same IP | **Rule 1: Brute Force** | **HIGH Severity Threat** + **New Alert** |
| `python agent.py --test-request-abuse` | 32 rapid HTTP requests in < 5s | **Rule 3: Request Flood** | **HIGH Severity Threat** + **New Alert** |
| `python agent.py --test-multi-account` | Credential spray across 4 usernames | **Rule 2: Multi-Account** | **MEDIUM Severity Threat** |
| `python agent.py --test-normal` | Benign MFA login & system telemetry | Normal Ingestion | Logged in Events stream |
