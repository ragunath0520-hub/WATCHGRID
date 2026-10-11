import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from models import SecurityEvent, Device
from schemas import SecurityEventCreate
from security.detector import ThreatDetector


class EventService:
    @staticmethod
    def ingest_event(db: Session, event_data: SecurityEventCreate) -> SecurityEvent:
        """
        Validates, saves the incoming event to PostgreSQL, and triggers
        the real-time threat detection engine.
        """
        # Ensure device exists or update device last_seen if device_id provided
        if event_data.device_id:
            device = db.query(Device).filter(Device.device_id == event_data.device_id).first()
            if device:
                device.last_seen = datetime.datetime.utcnow()
                device.status = "online"
                db.flush()

        # Create SecurityEvent record
        db_event = SecurityEvent(
            device_id=event_data.device_id,
            event_type=event_data.event_type.upper(),
            username=event_data.username,
            source_ip=event_data.source_ip,
            description=event_data.description,
            severity=event_data.severity.upper() if event_data.severity else "INFO",
            event_metadata=event_data.metadata or {},
            timestamp=event_data.timestamp or datetime.datetime.utcnow()
        )
        db.add(db_event)
        db.commit()
        db.refresh(db_event)

        # Execute Threat Detection
        try:
            ThreatDetector.evaluate_event(db, db_event)
        except Exception as e:
            print(f"[WATCHGRID DETECTOR ERROR] {e}")

        return db_event

    @staticmethod
    def list_events(
        db: Session,
        limit: int = 50,
        offset: int = 0,
        severity: Optional[str] = None,
        event_type: Optional[str] = None,
        source_ip: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[SecurityEvent]:
        query = db.query(SecurityEvent)

        if severity:
            query = query.filter(SecurityEvent.severity == severity.upper())
        if event_type:
            query = query.filter(SecurityEvent.event_type == event_type.upper())
        if source_ip:
            query = query.filter(SecurityEvent.source_ip == source_ip)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    SecurityEvent.description.ilike(search_pattern),
                    SecurityEvent.source_ip.ilike(search_pattern),
                    SecurityEvent.username.ilike(search_pattern),
                    SecurityEvent.event_type.ilike(search_pattern),
                    SecurityEvent.device_id.ilike(search_pattern)
                )
            )

        return query.order_by(desc(SecurityEvent.timestamp)).offset(offset).limit(limit).all()
