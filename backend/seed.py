import datetime
from database import SessionLocal, engine, Base
import models
from auth import hash_password

def seed_database():
    print("[*] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        users_to_seed = [
            {
                "username": "admin",
                "email": "admin@watchgrid.sec",
                "password": "AdminPass123!",
                "role": "admin"
            },
            {
                "username": "analyst",
                "email": "analyst@watchgrid.sec",
                "password": "AnalystPass123!",
                "role": "analyst"
            },
            {
                "username": "viewer",
                "email": "viewer@watchgrid.sec",
                "password": "ViewerPass123!",
                "role": "viewer"
            }
        ]

        print("[*] Seeding default RBAC users...")
        for u_data in users_to_seed:
            existing = db.query(models.User).filter(models.User.email == u_data["email"]).first()
            if not existing:
                user = models.User(
                    username=u_data["username"],
                    email=u_data["email"],
                    password_hash=hash_password(u_data["password"]),
                    role=u_data["role"],
                    is_active=True
                )
                db.add(user)
                print(f"  -> Created user: {u_data['username']} ({u_data['role']})")

        # 2. Seed Devices
        now = datetime.datetime.utcnow()
        devices_to_seed = [
            {
                "device_id": "DEV-CORP-SOC-01",
                "device_name": "SOC Primary Workstation",
                "hostname": "SECOPS-WIN11-01",
                "ip_address": "192.168.1.100",
                "operating_system": "Windows 11 Enterprise (x86_64)",
                "agent_version": "1.0.0",
                "status": "online",
                "last_seen": now
            },
            {
                "device_id": "DEV-PROD-SRV-02",
                "device_name": "API Gateway Node 02",
                "hostname": "gateway-node-prod.internal",
                "ip_address": "10.0.4.15",
                "operating_system": "Ubuntu Linux 24.04 LTS (kernel 6.8.0)",
                "agent_version": "1.0.0",
                "status": "online",
                "last_seen": now - datetime.timedelta(minutes=1)
            },
            {
                "device_id": "DEV-REMOTE-SEC-03",
                "device_name": "Field Analyst MacBook",
                "hostname": "macbook-air-analyst.local",
                "ip_address": "172.16.8.44",
                "operating_system": "macOS Sequoia 15.1 (arm64)",
                "agent_version": "1.0.0",
                "status": "offline",
                "last_seen": now - datetime.timedelta(minutes=30)
            }
        ]

        print("[*] Seeding fleet devices...")
        for d_data in devices_to_seed:
            existing_dev = db.query(models.Device).filter(models.Device.device_id == d_data["device_id"]).first()
            if not existing_dev:
                dev = models.Device(**d_data, created_at=now - datetime.timedelta(days=2))
                db.add(dev)
                print(f"  -> Created device: {d_data['device_id']}")

        # 3. Seed Security Events
        events_to_seed = [
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_SUCCESS",
                "username": "admin",
                "source_ip": "192.168.1.100",
                "description": "User 'admin' successfully authenticated via Web Console",
                "severity": "INFO",
                "event_metadata": {"auth_method": "password_mfa", "browser": "Chrome"},
                "timestamp": now - datetime.timedelta(minutes=45)
            },
            {
                "device_id": "DEV-PROD-SRV-02",
                "event_type": "SYSTEM",
                "username": "system",
                "source_ip": "10.0.4.15",
                "description": "Kernel memory integrity verification passed",
                "severity": "INFO",
                "event_metadata": {"uptime_seconds": 98450, "cpu_usage_pct": 14.2},
                "timestamp": now - datetime.timedelta(minutes=35)
            },
            {
                "device_id": "DEV-PROD-SRV-02",
                "event_type": "NETWORK",
                "username": "ingress",
                "source_ip": "45.33.32.156",
                "description": "Port scan activity detected on TCP ports 22, 80, 443, 8080",
                "severity": "MEDIUM",
                "event_metadata": {"ports_scanned": [22, 80, 443, 8080], "protocol": "TCP"},
                "timestamp": now - datetime.timedelta(minutes=20)
            },
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_FAILURE",
                "username": "root",
                "source_ip": "185.220.101.5",
                "description": "Failed authentication attempt for user 'root'",
                "severity": "LOW",
                "event_metadata": {"service": "ssh", "attempt_num": 1},
                "timestamp": now - datetime.timedelta(minutes=15)
            },
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_FAILURE",
                "username": "root",
                "source_ip": "185.220.101.5",
                "description": "Failed authentication attempt for user 'root'",
                "severity": "LOW",
                "event_metadata": {"service": "ssh", "attempt_num": 2},
                "timestamp": now - datetime.timedelta(minutes=14)
            },
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_FAILURE",
                "username": "root",
                "source_ip": "185.220.101.5",
                "description": "Failed authentication attempt for user 'root'",
                "severity": "LOW",
                "event_metadata": {"service": "ssh", "attempt_num": 3},
                "timestamp": now - datetime.timedelta(minutes=13)
            },
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_FAILURE",
                "username": "root",
                "source_ip": "185.220.101.5",
                "description": "Failed authentication attempt for user 'root'",
                "severity": "LOW",
                "event_metadata": {"service": "ssh", "attempt_num": 4},
                "timestamp": now - datetime.timedelta(minutes=12)
            },
            {
                "device_id": "DEV-CORP-SOC-01",
                "event_type": "LOGIN_FAILURE",
                "username": "root",
                "source_ip": "185.220.101.5",
                "description": "Failed authentication attempt for user 'root'",
                "severity": "HIGH",
                "event_metadata": {"service": "ssh", "attempt_num": 5},
                "timestamp": now - datetime.timedelta(minutes=11)
            },
            {
                "device_id": "DEV-PROD-SRV-02",
                "event_type": "REQUEST",
                "username": "api_client",
                "source_ip": "103.251.167.20",
                "description": "Rapid API endpoint scraping detected on /api/v1/users",
                "severity": "HIGH",
                "event_metadata": {"rps": 45, "endpoint": "/api/v1/users"},
                "timestamp": now - datetime.timedelta(minutes=8)
            }
        ]

        existing_events_count = db.query(models.SecurityEvent).count()
        if existing_events_count == 0:
            print("[*] Seeding security events...")
            for evt_data in events_to_seed:
                evt = models.SecurityEvent(**evt_data)
                db.add(evt)
        else:
            print(f"[*] Security events already present ({existing_events_count} events), skipping event seeding.")

        # 4. Seed Threats & Correlated Alerts
        existing_threats_count = db.query(models.Threat).count()
        if existing_threats_count == 0:
            print("[*] Seeding correlated threats and alerts...")
            threat1 = models.Threat(
                event_type="BRUTE_FORCE",
                source_ip="185.220.101.5",
                target_username="root",
                description="Possible brute-force login attack detected.",
                severity="HIGH",
                confidence=90,
                status="ACTIVE",
                first_seen=now - datetime.timedelta(minutes=15),
                last_seen=now - datetime.timedelta(minutes=11),
                event_count=5
            )
            db.add(threat1)
            db.flush()

            alert1 = models.Alert(
                threat_id=threat1.id,
                device_id="DEV-CORP-SOC-01",
                title="HIGH Threat: Brute Force",
                message="Possible brute-force login attack detected. Source IP: 185.220.101.5 targeting root.",
                severity="HIGH",
                status="NEW",
                created_at=now - datetime.timedelta(minutes=11)
            )
            db.add(alert1)

            threat2 = models.Threat(
                event_type="REQUEST_ABUSE",
                source_ip="103.251.167.20",
                target_username="api_client",
                description="Abnormally high request rate detected.",
                severity="HIGH",
                confidence=85,
                status="ACTIVE",
                first_seen=now - datetime.timedelta(minutes=8),
                last_seen=now - datetime.timedelta(minutes=8),
                event_count=35
            )
            db.add(threat2)
            db.flush()

            alert2 = models.Alert(
                threat_id=threat2.id,
                device_id="DEV-PROD-SRV-02",
                title="HIGH Threat: Request Abuse",
                message="Abnormally high request rate detected. Source IP: 103.251.167.20 targeting api_client.",
                severity="HIGH",
                status="ACKNOWLEDGED",
                created_at=now - datetime.timedelta(minutes=8)
            )
            db.add(alert2)
        else:
            print(f"[*] Correlated threats already present ({existing_threats_count} threats), skipping threat seeding.")

        db.commit()
        print("[+] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[!] Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
