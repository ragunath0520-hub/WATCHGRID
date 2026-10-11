from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import AlertOut, AlertStatusUpdate
from services.alert_service import AlertService
from dependencies import require_role

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut], summary="List security alerts")
def list_alerts(
    status: Optional[str] = Query(None, description="Filter by status: NEW, ACKNOWLEDGED, RESOLVED"),
    severity: Optional[str] = Query(None, description="Filter by severity: LOW, MEDIUM, HIGH, CRITICAL"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return AlertService.list_alerts(db, status=status, severity=severity, limit=limit, offset=offset)


@router.patch("/{alert_id}/acknowledge", response_model=AlertOut, summary="Acknowledge an alert")
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_role(["admin", "analyst"]))
):
    alert = AlertService.acknowledge_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found."
        )
    return alert


@router.patch("/{alert_id}/resolve", response_model=AlertOut, summary="Resolve an alert")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_role(["admin", "analyst"]))
):
    alert = AlertService.resolve_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found."
        )
    return alert


@router.patch("/{alert_id}/status", response_model=AlertOut, summary="Update alert status")
def update_alert_status(
    alert_id: int,
    status_in: AlertStatusUpdate,
    db: Session = Depends(get_db),
    _user=Depends(require_role(["admin", "analyst"]))
):
    if status_in.status.upper() == "ACKNOWLEDGED":
        return acknowledge_alert(alert_id, db, _user)
    elif status_in.status.upper() == "RESOLVED":
        return resolve_alert(alert_id, db, _user)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be ACKNOWLEDGED or RESOLVED"
        )
