# WATCHGRID — Deployment Guide

This guide details deploying WATCHGRID to production cloud platforms:
- **Database:** Neon Serverless PostgreSQL
- **Backend:** Render / Railway / AWS
- **Frontend:** Vercel
- **Security Agent:** External Laptops / Linux / macOS / Windows Endpoints

---

## 1. Database Setup (Neon PostgreSQL)

1. Create a project at [Neon.tech](https://neon.tech).
2. Create a database named `watchgrid`.
3. Obtain your Connection String URI. (Neon provides pooled and non-pooled connections formatted as `postgresql+psycopg://user:pass@ep-hostname.region.neon.tech/watchgrid?sslmode=require`).
4. Set this URI as `DATABASE_URL` in your backend environment.

---

## 2. Backend Deployment (Render)

1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Root Directory: `backend`
3. Environment: `Python 3`
4. Build Command:
   ```bash
   pip install -r requirements.txt
   ```
5. Start Command:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
6. Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `JWT_SECRET`: A secure 64-character random string (`openssl rand -hex 32`).
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440` (24 hours)
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:3000`

---

## 3. Frontend Deployment (Vercel)

1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Next.js`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com`
5. Deploy.

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
