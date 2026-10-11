import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    Text,
    JSON,
    ForeignKey,
    Index
)
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="analyst", nullable=False)  # admin, analyst, viewer
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), unique=True, index=True, nullable=False)
    device_name = Column(String(150), nullable=False)
    hostname = Column(String(150), nullable=False)
    ip_address = Column(String(45), nullable=False)
    operating_system = Column(String(100), nullable=False)
    agent_version = Column(String(50), default="1.0.0", nullable=False)
    status = Column(String(20), default="online", nullable=False)  # online, offline, unknown
    last_seen = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    events = relationship("SecurityEvent", back_populates="device", cascade="all, delete-orphan")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(100), ForeignKey("devices.device_id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # LOGIN_SUCCESS, LOGIN_FAILURE, REQUEST, PROCESS, NETWORK, SYSTEM, CUSTOM
    username = Column(String(100), nullable=True, index=True)
    source_ip = Column(String(45), nullable=False, index=True)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="INFO", nullable=False, index=True)  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    event_metadata = Column(JSON, nullable=True)  # Extra context, telemetry payload, headers, etc.
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)

    # Relationships
    device = relationship("Device", back_populates="events")


# Composite & Performance Indexes for High Ingestion Rates
Index("ix_security_events_source_ip_timestamp", SecurityEvent.source_ip, SecurityEvent.timestamp)
Index("ix_security_events_type_timestamp", SecurityEvent.event_type, SecurityEvent.timestamp)


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    source_ip = Column(String(45), nullable=False, index=True)
    target_username = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    confidence = Column(Integer, default=90, nullable=False)  # 0 to 100
    status = Column(String(20), default="ACTIVE", nullable=False, index=True)  # ACTIVE, RESOLVED, IGNORED
    first_seen = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    event_count = Column(Integer, default=1, nullable=False)

    # Relationships
    alerts = relationship("Alert", back_populates="threat", cascade="all, delete-orphan")


Index("ix_threats_source_ip_status", Threat.source_ip, Threat.status)


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    threat_id = Column(Integer, ForeignKey("threats.id", ondelete="CASCADE"), nullable=True, index=True)
    device_id = Column(String(100), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20), default="HIGH", nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(20), default="NEW", nullable=False, index=True)  # NEW, ACKNOWLEDGED, RESOLVED
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    threat = relationship("Threat", back_populates="alerts")
