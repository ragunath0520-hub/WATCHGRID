# WATCHGRID — Deployment Guide

- **Containerized Stack:** Docker Compose (FastAPI Backend with Embedded SQLite, Next.js SOC Frontend, Optional Agent)
- **Database:** SQLite (Embedded WAL-mode file database, zero external dependencies)
- **Backend:** Render / Railway / AWS / Docker
- **Frontend:** Render / Vercel / Docker
- **Security Agent:** External Laptops / Linux / macOS / Windows Endpoints

---

## 0. Quickstart with Docker Compose (Recommended)

Run the entire WATCHGRID ecosystem with a single command (no database container required):

```bash
# 1. Clone repository and navigate to root
git clone https://github.com/ragunath0520-hub/WATCHGRID.git
cd WATCHGRID

# 2. Copy environment template (sensible defaults included)
cp .env.example .env

# 3. Build and launch all core services (Backend API + SQLite, Frontend SOC)
docker compose up --build -d

# 4. View real-time logs
docker compose logs -f

# 5. Access the platforms:
#    - SOC Console:  http://localhost:3000
#    - FastAPI Docs: http://localhost:8000/docs
#    - Healthcheck:  http://localhost:8000/health
```

### Default Credentials (Auto-seeded)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@watchgrid.sec` | `AdminPass123!` |
| **Analyst** | `analyst@watchgrid.sec` | `AnalystPass123!` |
| **Viewer** | `viewer@watchgrid.sec` | `ViewerPass123!` |

### Running the Security Agent in Docker
```bash
# Start background monitoring sensor daemon
docker compose --profile agent up -d

# Simulate a Brute Force attack
docker compose run --rm agent python agent.py --test-bruteforce

# Simulate high-volume Request Abuse
docker compose run --rm agent python agent.py --test-request-abuse

# Simulate multi-account credential spray
docker compose run --rm agent python agent.py --test-multi-account
```

### Stopping the Stack
```bash
docker compose down

# To also clear SQLite database persistent volume:
docker compose down -v
```

---

## 1. Automated Deployment on Render via Blueprint (1-Click)

The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/ajind/OneDrive/Documents/GitHub/WATCHGRID/render.yaml) blueprint specification configured with embedded SQLite:

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **New +** → **Blueprint**.
4. Select your `WATCHGRID` repository and click **Apply**.
5. Render will automatically provision:
   - The **FastAPI Backend Web Service** (`watchgrid-backend`) using SQLite with automatic schema creation and seeder
   - The **Next.js Frontend Web Service** (`watchgrid-frontend`)
6. Once deployed:
   - Copy the backend URL (e.g. `https://watchgrid-backend.onrender.com`).
   - Go to your `watchgrid-frontend` service settings → **Environment Variables**, set `NEXT_PUBLIC_API_URL` to `https://watchgrid-backend.onrender.com`, and trigger a manual redeploy.

---

## 2. Manual Deployment on Render (Step-by-Step)

If you prefer configuring services manually on the Render dashboard:

### Step A: Deploy the FastAPI Backend on Render (with SQLite)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name:** `watchgrid-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"`
   - **Plan:** `Free`
4. Set Environment Variables:
   - `DATABASE_URL`: `sqlite:///./watchgrid.db`
   - `JWT_SECRET`: A secure 64-character random string (`openssl rand -hex 32`)
   - `JWT_ALGORITHM`: `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
   - `AGENT_API_KEY`: `watchgrid-agent-key-alpha-99`
   - `CORS_ORIGINS`: `*`
5. Click **Create Web Service**.
6. Once live, test health check at `https://your-backend.onrender.com/health`.

### Step C: Deploy the Next.js Frontend on Render (or Vercel)

#### Deploying on Render:
1. Click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `watchgrid-frontend`
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** `Free`
4. Set Environment Variables:
   - `NODE_VERSION`: `20`
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com` (from Step B)
5. Click **Create Web Service**.

#### Alternative: Deploying Frontend on Vercel (Recommended for Next.js)
1. Import repository to [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com`
4. Deploy (benefit: zero cold start on frontend, unlimited free bandwidth).

---

## 4. Running the Python Security Agent on External Endpoints

The security agent can run on any internet-connected workstation:

1. Clone or copy the `agent/` folder to the target machine.
2. Install dependencies:
   ```bash
   cd agent
   pip install -r requirements.txt
   ```
3. Set environment configuration:
   ```bash
   # Windows PowerShell
   $env:WATCHGRID_API_URL="https://your-backend-service.onrender.com"
   $env:WATCHGRID_DEVICE_ID="DEV-LAPTOP-AVINASH"

   # Linux / macOS
   export WATCHGRID_API_URL="https://your-backend-service.onrender.com"
   export WATCHGRID_DEVICE_ID="DEV-LAPTOP-AVINASH"
   ```
4. Register the device and execute simulations:
   ```bash
   python agent.py --register
   python agent.py --heartbeat
   python agent.py --test-bruteforce
   ```
