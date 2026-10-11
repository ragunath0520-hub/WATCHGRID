from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# -----------------------------------------------------------------------------
# User & Auth Schemas
# -----------------------------------------------------------------------------

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    role: Optional[str] = "analyst"  # admin, analyst, viewer


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None


# -----------------------------------------------------------------------------
# Device Schemas
# -----------------------------------------------------------------------------

class DeviceBase(BaseModel):
    device_id: str
    device_name: str
    hostname: str
    ip_address: str
    operating_system: str
    agent_version: Optional[str] = "1.0.0"


class DeviceCreate(DeviceBase):
    pass


class DeviceHeartbeat(BaseModel):
    agent_version: Optional[str] = None
    status: Optional[str] = "online"


class DeviceOut(DeviceBase):
    id: int
    status: str
    last_seen: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Security Event Schemas
# -----------------------------------------------------------------------------

class SecurityEventBase(BaseModel):
    device_id: Optional[str] = None
    event_type: str = Field(..., description="LOGIN_SUCCESS, LOGIN_FAILURE, REQUEST, PROCESS, NETWORK, SYSTEM, CUSTOM")
    username: Optional[str] = None
    source_ip: str
    description: str
    severity: Optional[str] = "INFO"  # INFO, LOW, MEDIUM, HIGH, CRITICAL
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[datetime] = None


class SecurityEventCreate(SecurityEventBase):
    pass


class SecurityEventOut(BaseModel):
    id: int
    device_id: Optional[str] = None
    event_type: str
    username: Optional[str] = None
    source_ip: str
    description: str
    severity: str
    event_metadata: Optional[Dict[str, Any]] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# -----------------------------------------------------------------------------
# Threat Schemas
# -----------------------------------------------------------------------------

class ThreatBase(BaseModel):
    event_type: str
    source_ip: str
    target_username: Optional[str] = None
    description: str
    severity: str
    confidence: int
    status: str
    event_count: int


class ThreatOut(ThreatBase):
    id: int
    first_seen: datetime
    last_seen: datetime

    class Config:
        from_attributes = True


class ThreatStatusUpdate(BaseModel):
    status: str = Field(..., description="ACTIVE, RESOLVED, IGNORED")


# -----------------------------------------------------------------------------
# Alert Schemas
# -----------------------------------------------------------------------------

class AlertBase(BaseModel):
    threat_id: Optional[int] = None
    device_id: Optional[str] = None
    title: str
    message: str
    severity: str
    status: str


class AlertOut(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertStatusUpdate(BaseModel):
    status: str = Field(..., description="NEW, ACKNOWLEDGED, RESOLVED")


# -----------------------------------------------------------------------------
# Dashboard Statistics Schemas
# -----------------------------------------------------------------------------

class CountMetric(BaseModel):
    name: str
    count: int


class TimeSeriesPoint(BaseModel):
    time: str
    events: int
    threats: int


class DashboardStats(BaseModel):
    total_events: int
    total_threats: int
    active_threats: int
    total_alerts: int
    new_alerts: int
    total_devices: int
    online_devices: int
    offline_devices: int
    events_by_severity: List[CountMetric]
    events_by_type: List[CountMetric]
    threats_by_severity: List[CountMetric]
    events_over_time: List[TimeSeriesPoint]


# -----------------------------------------------------------------------------
# Generic Responses
# -----------------------------------------------------------------------------

class MessageResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status: str
    service: str
    database: str
    timestamp: datetime
