from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Threat
from schemas import ThreatOut, ThreatStatusUpdate
from dependencies import require_role

router = APIRouter(prefix="/api/threats", tags=["Threats"])


@router.get("", response_model=List[ThreatOut], summary="List detected threats")
def list_threats(
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, RESOLVED, IGNORED"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Threat)
    if status:
        query = query.filter(Threat.status == status.upper())
    if severity:
        query = query.filter(Threat.severity == severity.upper())

    return query.order_by(desc(Threat.last_seen)).offset(offset).limit(limit).all()


@router.get("/{threat_id}", response_model=ThreatOut, summary="Get threat details")
def get_threat(threat_id: int, db: Session = Depends(get_db)):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found."
        )
    return threat


@router.patch("/{threat_id}/status", response_model=ThreatOut, summary="Update threat status")
def update_threat_status(
    threat_id: int,
    status_update: ThreatStatusUpdate,
    db: Session = Depends(get_db),
    _user=Depends(require_role(["admin", "analyst"]))
):
    threat = db.query(Threat).filter(Threat.id == threat_id).first()
    if not threat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Threat not found."
        )

    valid_statuses = ["ACTIVE", "RESOLVED", "IGNORED"]
    if status_update.status.upper() not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    threat.status = status_update.status.upper()
    db.commit()
    db.refresh(threat)
    return threat
