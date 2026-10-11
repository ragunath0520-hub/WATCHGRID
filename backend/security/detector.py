import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from models import SecurityEvent, Threat, Alert
from security.rules import ALL_RULES, ThreatMatch
from security.severity import compare_severity


class ThreatDetector:
    """
    Threat Detection Engine for WATCHGRID.
    Evaluates incoming events against deterministic security rules,
    correlates events, handles deduplication, and triggers alerts.
    """

    @classmethod
    def evaluate_event(cls, db: Session, event: SecurityEvent) -> List[Threat]:
        detected_threats = []

        for rule_fn in ALL_RULES:
            match: Optional[ThreatMatch] = rule_fn(db, event)
            if not match:
                continue

            # Deduplication Check: Look for existing ACTIVE threat for same (source_ip, event_type)
            existing_threat = (
                db.query(Threat)
                .filter(
                    Threat.source_ip == match.source_ip,
                    Threat.event_type == match.event_type,
                    Threat.status == "ACTIVE"
                )
                .first()
            )

            now = datetime.datetime.utcnow()

            if existing_threat:
                # Update existing threat instead of creating duplicate
                existing_threat.last_seen = now
                existing_threat.event_count = match.matched_events_count
                if match.target_username:
                    existing_threat.target_username = match.target_username
                
                # Boost confidence slightly on repeated detection, up to 99
                existing_threat.confidence = min(99, max(existing_threat.confidence, match.confidence + 2))
                
                # Upgrade severity if higher
                if compare_severity(match.severity, existing_threat.severity) > 0:
                    existing_threat.severity = match.severity

                db.flush()
                threat_record = existing_threat
            else:
                # Create a new Threat record
                threat_record = Threat(
                    event_type=match.event_type,
                    source_ip=match.source_ip,
                    target_username=match.target_username,
                    description=match.description,
                    severity=match.severity,
                    confidence=match.confidence,
                    status="ACTIVE",
                    first_seen=now,
                    last_seen=now,
                    event_count=match.matched_events_count
                )
                db.add(threat_record)
                db.flush()  # to obtain threat_record.id

            detected_threats.append(threat_record)

            # Alert Generation for HIGH and CRITICAL threats
            if match.trigger_alert or threat_record.severity in ["HIGH", "CRITICAL"]:
                cls._ensure_alert(db, threat_record, event)

        db.commit()
        return detected_threats

    @classmethod
    def _ensure_alert(cls, db: Session, threat: Threat, event: SecurityEvent):
        """Creates or refreshes an alert for the given threat."""
        # Check if an alert already exists for this threat
        existing_alert = (
            db.query(Alert)
            .filter(
                Alert.threat_id == threat.id,
                Alert.status.in_(["NEW", "ACKNOWLEDGED"])
            )
            .first()
        )

        if existing_alert:
            # Refresh message or severity if changed
            existing_alert.message = (
                f"{threat.description} (Source: {threat.source_ip}, Total Events: {threat.event_count})"
            )
            existing_alert.severity = threat.severity
            db.flush()
        else:
            alert_title = f"{threat.severity} Threat: {threat.event_type.replace('_', ' ').title()}"
            new_alert = Alert(
                threat_id=threat.id,
                device_id=event.device_id,
                title=alert_title,
                message=f"{threat.description} Source IP: {threat.source_ip} targeting {threat.target_username or 'system'}.",
                severity=threat.severity,
                status="NEW",
                created_at=datetime.datetime.utcnow()
            )
            db.add(new_alert)
            db.flush()
