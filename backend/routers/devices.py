from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import DeviceCreate, DeviceHeartbeat, DeviceOut
from services.device_service import DeviceService
from dependencies import require_role

router = APIRouter(prefix="/api/devices", tags=["Devices"])


@router.post("/register", response_model=DeviceOut, status_code=status.HTTP_201_CREATED, summary="Register or update an agent device")
def register_device(device_in: DeviceCreate, db: Session = Depends(get_db)):
    """Registers an external workstation or server agent with WATCHGRID."""
    return DeviceService.register_or_update_device(db, device_in)


@router.get("", response_model=List[DeviceOut], summary="List all registered devices")
def list_devices(db: Session = Depends(get_db)):
    """Lists fleet devices and dynamically evaluates online/offline statuses."""
    return DeviceService.list_devices(db)


@router.get("/{device_id}", response_model=DeviceOut, summary="Get device by device_id")
def get_device(device_id: str, db: Session = Depends(get_db)):
    device = DeviceService.get_device(db, device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID '{device_id}' was not found."
        )
    return device


@router.patch("/{device_id}/heartbeat", response_model=DeviceOut, summary="Submit agent heartbeat ping")
def heartbeat_device(device_id: str, heartbeat: DeviceHeartbeat, db: Session = Depends(get_db)):
    """Receives periodic keepalive pings from the external security agent."""
    device = DeviceService.process_heartbeat(db, device_id, heartbeat)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{device_id}' not found. Please register first."
        )
    return device
