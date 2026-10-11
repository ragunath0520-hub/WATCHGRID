from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import SecurityEventCreate, SecurityEventOut
from services.event_service import EventService
from dependencies import verify_agent_token_or_key

router = APIRouter(prefix="/api/events", tags=["Security Events"])


@router.post("", response_model=SecurityEventOut, status_code=status.HTTP_201_CREATED, summary="Ingest a security event")
def ingest_security_event(
    event_in: SecurityEventCreate,
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_agent_token_or_key)
):
    """
    Ingests raw security event telemetry from endpoints or simulation agents.
    Executes real-time threat detection and correlation pipeline upon insertion.
    """
    try:
        saved_event = EventService.ingest_event(db, event_in)
        return saved_event
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to ingest security event: {str(e)}"
        )


@router.get("", response_model=List[SecurityEventOut], summary="List and filter security events")
def list_security_events(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    severity: Optional[str] = Query(None, description="Filter by severity: INFO, LOW, MEDIUM, HIGH, CRITICAL"),
    event_type: Optional[str] = Query(None, description="Filter by event type: LOGIN_SUCCESS, LOGIN_FAILURE, etc."),
    source_ip: Optional[str] = Query(None, description="Filter by source IP address"),
    search: Optional[str] = Query(None, description="Keyword search across descriptions, IPs, usernames"),
    db: Session = Depends(get_db)
):
    """Query chronological event stream with filtering and search."""
    return EventService.list_events(
        db,
        limit=limit,
        offset=offset,
        severity=severity,
        event_type=event_type,
        source_ip=source_ip,
        search=search
    )
