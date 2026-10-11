from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import SecurityEvent


class ThreatMatch:
    """Represents the outcome of a triggered security rule."""
    def __init__(
        self,
        event_type: str,
        source_ip: str,
        target_username: Optional[str],
        description: str,
        severity: str,
        confidence: int,
        matched_events_count: int,
        trigger_alert: bool = False
    ):
        self.event_type = event_type
        self.source_ip = source_ip
        self.target_username = target_username
        self.description = description
        self.severity = severity
        self.confidence = confidence
        self.matched_events_count = matched_events_count
        self.trigger_alert = trigger_alert


# -----------------------------------------------------------------------------
# RULE 1 — BRUTE FORCE
# >= 5 LOGIN_FAILURE events from same source_ip within 2 minutes
# -----------------------------------------------------------------------------
def check_rule_bruteforce(db: Session, event: SecurityEvent) -> Optional[ThreatMatch]:
    if event.event_type != "LOGIN_FAILURE":
        return None

    cutoff = datetime.utcnow() - timedelta(minutes=2)
    count = (
        db.query(func.count(SecurityEvent.id))
        .filter(
            SecurityEvent.source_ip == event.source_ip,
            SecurityEvent.event_type == "LOGIN_FAILURE",
            SecurityEvent.timestamp >= cutoff
        )
        .scalar()
    ) or 0

    if count >= 5:
        return ThreatMatch(
            event_type="BRUTE_FORCE",
            source_ip=event.source_ip,
            target_username=event.username,
            description="Possible brute-force login attack detected.",
            severity="HIGH",
            confidence=90,
            matched_events_count=count,
            trigger_alert=True
        )
    return None


# -----------------------------------------------------------------------------
# RULE 2 — DISTRIBUTED ACCOUNT ATTACK
# Same source_ip attempts login against >= 3 distinct usernames within 5 minutes
# -----------------------------------------------------------------------------
def check_rule_multi_account(db: Session, event: SecurityEvent) -> Optional[ThreatMatch]:
    if event.event_type not in ["LOGIN_FAILURE", "LOGIN_SUCCESS"]:
        return None

    cutoff = datetime.utcnow() - timedelta(minutes=5)
    distinct_users = (
        db.query(func.count(func.distinct(SecurityEvent.username)))
        .filter(
            SecurityEvent.source_ip == event.source_ip,
            SecurityEvent.event_type.in_(["LOGIN_FAILURE", "LOGIN_SUCCESS"]),
            SecurityEvent.username.isnot(None),
            SecurityEvent.timestamp >= cutoff
        )
        .scalar()
    ) or 0

    if distinct_users >= 3:
        return ThreatMatch(
            event_type="MULTI_ACCOUNT_ATTACK",
            source_ip=event.source_ip,
            target_username=f"Multiple ({distinct_users} targets)",
            description="Multiple-account authentication attack detected.",
            severity="MEDIUM",
            confidence=80,
            matched_events_count=distinct_users,
            trigger_alert=False
        )
    return None


# -----------------------------------------------------------------------------
# RULE 3 — RAPID REQUEST ABUSE
# >= 30 REQUEST events from same source_ip within 1 minute
# -----------------------------------------------------------------------------
def check_rule_request_abuse(db: Session, event: SecurityEvent) -> Optional[ThreatMatch]:
    if event.event_type != "REQUEST":
        return None

    cutoff = datetime.utcnow() - timedelta(minutes=1)
    count = (
        db.query(func.count(SecurityEvent.id))
        .filter(
            SecurityEvent.source_ip == event.source_ip,
            SecurityEvent.event_type == "REQUEST",
            SecurityEvent.timestamp >= cutoff
        )
        .scalar()
    ) or 0

    if count >= 30:
        return ThreatMatch(
            event_type="REQUEST_ABUSE",
            source_ip=event.source_ip,
            target_username=event.username,
            description="Abnormally high request rate detected.",
            severity="HIGH",
            confidence=85,
            matched_events_count=count,
            trigger_alert=True
        )
    return None


# -----------------------------------------------------------------------------
# RULE 4 — REPEATED LOGIN FAILURE
# >= 3 failed login attempts from same source_ip within 5 minutes
# -----------------------------------------------------------------------------
def check_rule_repeated_login_failure(db: Session, event: SecurityEvent) -> Optional[ThreatMatch]:
    if event.event_type != "LOGIN_FAILURE":
        return None

    cutoff = datetime.utcnow() - timedelta(minutes=5)
    count = (
        db.query(func.count(SecurityEvent.id))
        .filter(
            SecurityEvent.source_ip == event.source_ip,
            SecurityEvent.event_type == "LOGIN_FAILURE",
            SecurityEvent.timestamp >= cutoff
        )
        .scalar()
    ) or 0

    if count >= 3:
        return ThreatMatch(
            event_type="REPEATED_LOGIN_FAILURE",
            source_ip=event.source_ip,
            target_username=event.username,
            description="Repeated authentication failures detected.",
            severity="MEDIUM",
            confidence=75,
            matched_events_count=count,
            trigger_alert=False
        )
    return None


# -----------------------------------------------------------------------------
# RULE 5 — SUSPICIOUS IP ACTIVITY (VOLUME STORM)
# >= 10 security events from same source_ip within 5 minutes
# -----------------------------------------------------------------------------
def check_rule_suspicious_volume(db: Session, event: SecurityEvent) -> Optional[ThreatMatch]:
    cutoff = datetime.utcnow() - timedelta(minutes=5)
    count = (
        db.query(func.count(SecurityEvent.id))
        .filter(
            SecurityEvent.source_ip == event.source_ip,
            SecurityEvent.timestamp >= cutoff
        )
        .scalar()
    ) or 0

    if count >= 10:
        return ThreatMatch(
            event_type="SUSPICIOUS_IP_ACTIVITY",
            source_ip=event.source_ip,
            target_username=event.username,
            description="Suspicious activity volume detected from source IP.",
            severity="HIGH",
            confidence=85,
            matched_events_count=count,
            trigger_alert=True
        )
    return None


ALL_RULES = [
    check_rule_bruteforce,
    check_rule_multi_account,
    check_rule_request_abuse,
    check_rule_repeated_login_failure,
    check_rule_suspicious_volume
]
