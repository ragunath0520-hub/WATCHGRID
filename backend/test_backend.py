import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "WATCHGRID Security API"
    assert data["status"] == "online"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "service" in data


def test_login_and_auth_flow():
    # Login as admin
    login_payload = {
        "email": "admin@watchgrid.sec",
        "password": "AdminPass123!"
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    token = data["access_token"]
    assert data["user"]["role"] == "admin"

    # Test /api/auth/me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "admin"


def test_device_registration_and_heartbeat():
    device_data = {
        "device_id": "TEST-DEVICE-01",
        "device_name": "Test Security Sensor",
        "hostname": "test-sensor-node",
        "ip_address": "192.168.1.55",
        "operating_system": "Linux 6.1 (Debian)",
        "agent_version": "1.0.0"
    }
    reg_resp = client.post("/api/devices/register", json=device_data)
    assert reg_resp.status_code == 201
    assert reg_resp.json()["device_id"] == "TEST-DEVICE-01"

    # Heartbeat
    hb_resp = client.patch("/api/devices/TEST-DEVICE-01/heartbeat", json={"status": "online", "agent_version": "1.0.1"})
    assert hb_resp.status_code == 200
    assert hb_resp.json()["agent_version"] == "1.0.1"


def test_event_ingestion_and_bruteforce_detection():
    # Send 5 LOGIN_FAILURE events from a unique IP
    attacker_ip = "198.51.100.99"
    for i in range(5):
        evt_payload = {
            "device_id": "TEST-DEVICE-01",
            "event_type": "LOGIN_FAILURE",
            "username": "victim_user",
            "source_ip": attacker_ip,
            "description": f"Failed password attempt {i+1}",
            "severity": "LOW",
            "metadata": {"attempt": i+1}
        }
        res = client.post("/api/events", json=evt_payload)
        assert res.status_code == 201

    # Verify that a HIGH Threat was detected for this IP
    threats_resp = client.get(f"/api/threats?severity=HIGH")
    assert threats_resp.status_code == 200
    threats = threats_resp.json()
    matched = [t for t in threats if t["source_ip"] == attacker_ip and t["event_type"] == "BRUTE_FORCE"]
    assert len(matched) >= 1
    assert matched[0]["confidence"] >= 90

    # Verify that an Alert was generated
    alerts_resp = client.get("/api/alerts?status=NEW")
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert len(alerts) >= 1

    # Test alert acknowledge and resolve
    alert_id = alerts[0]["id"]
    # Login to get admin token for alert resolution
    login_resp = client.post("/api/auth/login", json={"email": "admin@watchgrid.sec", "password": "AdminPass123!"})
    auth_headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}

    ack_resp = client.patch(f"/api/alerts/{alert_id}/acknowledge", headers=auth_headers)
    assert ack_resp.status_code == 200
    assert ack_resp.json()["status"] == "ACKNOWLEDGED"

    res_resp = client.patch(f"/api/alerts/{alert_id}/resolve", headers=auth_headers)
    assert res_resp.status_code == 200
    assert res_resp.json()["status"] == "RESOLVED"


def test_dashboard_stats():
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_events" in data
    assert "total_threats" in data
    assert "events_by_severity" in data
    assert "events_over_time" in data


if __name__ == "__main__":
    pytest.main(["-v", "test_backend.py"])
