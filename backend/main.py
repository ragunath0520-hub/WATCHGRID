import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

# Load env variables
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from database import engine, Base, get_db
import models  # Ensure all models are registered with Base metadata
from routers import auth, events, threats, alerts, devices, dashboard
from schemas import HealthResponse

# Create database tables automatically upon startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[WATCHGRID DB INIT ERROR] Error creating tables: {e}")

app = FastAPI(
    title="WATCHGRID Security API",
    description="Distributed Cybersecurity Monitoring, Telemetry Ingestion & Threat Detection System.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000")
origins = [o.strip() for o in raw_origins.split(",") if o.strip()]
if "*" not in origins and "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(threats.router)
app.include_router(alerts.router)
app.include_router(devices.router)
app.include_router(dashboard.router)


@app.get("/", tags=["System"])
def root():
    """Root metadata endpoint."""
    return {
        "name": "WATCHGRID Security API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "redoc": "/redoc",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check(db: Session = Depends(get_db)):
    """System and Database Health Check."""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="healthy" if db_status == "connected" else "degraded",
        service="WATCHGRID API",
        database=db_status,
        timestamp=datetime.utcnow()
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
