import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from models import Device
from schemas import DeviceCreate, DeviceHeartbeat

# Threshold in minutes after which an inactive device is deemed offline
OFFLINE_THRESHOLD_MINUTES = 5


class DeviceService:
    @staticmethod
    def register_or_update_device(db: Session, device_data: DeviceCreate) -> Device:
        now = datetime.datetime.utcnow()
        device = db.query(Device).filter(Device.device_id == device_data.device_id).first()

        if device:
            device.device_name = device_data.device_name
            device.hostname = device_data.hostname
            device.ip_address = device_data.ip_address
            device.operating_system = device_data.operating_system
            device.agent_version = device_data.agent_version or device.agent_version
            device.status = "online"
            device.last_seen = now
        else:
            device = Device(
                device_id=device_data.device_id,
                device_name=device_data.device_name,
                hostname=device_data.hostname,
                ip_address=device_data.ip_address,
                operating_system=device_data.operating_system,
                agent_version=device_data.agent_version or "1.0.0",
                status="online",
                last_seen=now,
                created_at=now
            )
            db.add(device)

        db.commit()
        db.refresh(device)
        return device

    @staticmethod
    def list_devices(db: Session) -> List[Device]:
        devices = db.query(Device).all()
        now = datetime.datetime.utcnow()
        cutoff = now - datetime.timedelta(minutes=OFFLINE_THRESHOLD_MINUTES)

        for dev in devices:
            if dev.last_seen and dev.last_seen < cutoff:
                if dev.status == "online":
                    dev.status = "offline"
                    db.flush()

        db.commit()
        return devices

    @staticmethod
    def get_device(db: Session, device_id: str) -> Optional[Device]:
        return db.query(Device).filter(Device.device_id == device_id).first()

    @staticmethod
    def process_heartbeat(db: Session, device_id: str, heartbeat: DeviceHeartbeat) -> Optional[Device]:
        device = db.query(Device).filter(Device.device_id == device_id).first()
        if not device:
            return None

        device.last_seen = datetime.datetime.utcnow()
        device.status = heartbeat.status or "online"
        if heartbeat.agent_version:
            device.agent_version = heartbeat.agent_version

        db.commit()
        db.refresh(device)
        return device
