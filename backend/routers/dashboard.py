from datetime import datetime, timedelta
from typing import Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import SecurityEvent, Threat, Alert, Device
from schemas import DashboardStats, CountMetric, TimeSeriesPoint
from services.device_service import DeviceService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats, summary="Retrieve aggregate SOC dashboard metrics")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Refresh device statuses before calculating totals
    devices = DeviceService.list_devices(db)
    total_devices = len(devices)
    online_devices = sum(1 for d in devices if d.status == "online")
    offline_devices = total_devices - online_devices

    total_events = db.query(func.count(SecurityEvent.id)).scalar() or 0
    total_threats = db.query(func.count(Threat.id)).scalar() or 0
    active_threats = db.query(func.count(Threat.id)).filter(Threat.status == "ACTIVE").scalar() or 0
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0
    new_alerts = db.query(func.count(Alert.id)).filter(Alert.status == "NEW").scalar() or 0

    # Events by Severity
    sev_rows = (
        db.query(SecurityEvent.severity, func.count(SecurityEvent.id))
        .group_by(SecurityEvent.severity)
        .all()
    )
    events_by_severity = [CountMetric(name=row[0], count=row[1]) for row in sev_rows]
    if not events_by_severity:
        events_by_severity = [
            CountMetric(name="INFO", count=0),
            CountMetric(name="LOW", count=0),
            CountMetric(name="MEDIUM", count=0),
            CountMetric(name="HIGH", count=0),
            CountMetric(name="CRITICAL", count=0),
        ]

    # Events by Type
    type_rows = (
        db.query(SecurityEvent.event_type, func.count(SecurityEvent.id))
        .group_by(SecurityEvent.event_type)
        .all()
    )
    events_by_type = [CountMetric(name=row[0], count=row[1]) for row in type_rows]

    # Threats by Severity
    threat_sev_rows = (
        db.query(Threat.severity, func.count(Threat.id))
        .group_by(Threat.severity)
        .all()
    )
    threats_by_severity = [CountMetric(name=row[0], count=row[1]) for row in threat_sev_rows]

    # Time series points for the last 6 intervals / hours
    now = datetime.utcnow()
    events_over_time = []
    for i in range(5, -1, -1):
        window_start = now - timedelta(hours=i + 1)
        window_end = now - timedelta(hours=i)
        label = window_end.strftime("%H:00")

        evt_count = (
            db.query(func.count(SecurityEvent.id))
            .filter(SecurityEvent.timestamp >= window_start, SecurityEvent.timestamp < window_end)
            .scalar()
        ) or 0

        threat_count = (
            db.query(func.count(Threat.id))
            .filter(Threat.first_seen >= window_start, Threat.first_seen < window_end)
            .scalar()
        ) or 0

        events_over_time.append(TimeSeriesPoint(time=label, events=evt_count, threats=threat_count))

    return DashboardStats(
        total_events=total_events,
        total_threats=total_threats,
        active_threats=active_threats,
        total_alerts=total_alerts,
        new_alerts=new_alerts,
        total_devices=total_devices,
        online_devices=online_devices,
        offline_devices=offline_devices,
        events_by_severity=events_by_severity,
        events_by_type=events_by_type,
        threats_by_severity=threats_by_severity,
        events_over_time=events_over_time
    )
