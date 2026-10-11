#!/usr/bin/env python3
"""
WATCHGRID — Endpoint Security Agent & Telemetry Monitor
Level 5 Cybersecurity Academic Demonstration Agent

Defensive monitoring client that registers host devices, sends keepalive
heartbeats, and dispatches real-time security events to WATCHGRID backend.
"""

import sys
import time
import argparse
import socket
import platform
from datetime import datetime
import requests
import psutil

import config


class WatchgridAgent:
    def __init__(self):
        self.api_url = config.API_URL
        self.api_key = config.API_KEY
        self.device_id = config.DEVICE_ID
        self.device_name = config.DEVICE_NAME
        self.agent_version = config.AGENT_VERSION
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "X-API-Key": self.api_key,
            "User-Agent": f"WATCHGRID-Agent/{self.agent_version}"
        })

    def get_system_info(self) -> dict:
        """Collects non-invasive system metrics and identification."""
        try:
            local_ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            local_ip = "127.0.0.1"

        os_str = f"{platform.system()} {platform.release()} ({platform.machine()})"
        return {
            "device_id": self.device_id,
            "device_name": self.device_name,
            "hostname": socket.gethostname(),
            "ip_address": local_ip,
            "operating_system": os_str,
            "agent_version": self.agent_version
        }

    def register(self) -> bool:
        """Registers device with WATCHGRID API."""
        payload = self.get_system_info()
        print(f"[*] Registering device '{self.device_id}' at {self.api_url}...")
        try:
            res = self.session.post(f"{self.api_url}/api/devices/register", json=payload, timeout=8)
            if res.status_code in [200, 201]:
                data = res.json()
                print(f"[+] Device Registered Successfully!")
                print(f"    - Device ID: {data.get('device_id')}")
                print(f"    - Hostname:  {data.get('hostname')}")
                print(f"    - OS:        {data.get('operating_system')}")
                print(f"    - Status:    {data.get('status')}")
                return True
            else:
                print(f"[!] Registration failed: {res.status_code} - {res.text}")
                return False
        except requests.RequestException as e:
            print(f"[!] Connection error contacting {self.api_url}: {e}")
            return False

    def send_heartbeat(self) -> bool:
        """Sends a keepalive ping to the backend."""
        payload = {
            "status": "online",
            "agent_version": self.agent_version
        }
        try:
            res = self.session.patch(
                f"{self.api_url}/api/devices/{self.device_id}/heartbeat",
                json=payload,
                timeout=5
            )
            if res.status_code == 200:
                print(f"[+] [{datetime.now().strftime('%H:%M:%S')}] Heartbeat acknowledged by server (Status: ONLINE)")
                return True
            elif res.status_code == 404:
                print(f"[!] Device not registered. Attempting automatic registration...")
                if self.register():
                    return self.send_heartbeat()
            else:
                print(f"[!] Heartbeat failed: {res.status_code} - {res.text}")
        except requests.RequestException as e:
            print(f"[!] Heartbeat error: {e}")
        return False

    def send_event(
        self,
        event_type: str,
        source_ip: str,
        description: str,
        severity: str = "INFO",
        username: str = None,
        metadata: dict = None
    ) -> bool:
        """Dispatches an individual security telemetry event."""
        payload = {
            "device_id": self.device_id,
            "event_type": event_type,
            "source_ip": source_ip,
            "description": description,
            "severity": severity,
            "username": username,
            "metadata": metadata or {}
        }
        try:
            res = self.session.post(f"{self.api_url}/api/events", json=payload, timeout=6)
            if res.status_code in [200, 201]:
                return True
            else:
                print(f"[!] Event dispatch error: {res.status_code} - {res.text}")
                return False
        except requests.RequestException as e:
            print(f"[!] Network error sending event: {e}")
            return False

    def check_status(self):
        """Prints local and remote health status."""
        sys_info = self.get_system_info()
        print("=" * 60)
        print(" WATCHGRID SECURITY AGENT — STATUS REPORT")
        print("=" * 60)
        print(f" Target API:        {self.api_url}")
        print(f" Device ID:         {sys_info['device_id']}")
        print(f" Device Name:       {sys_info['device_name']}")
        print(f" Hostname:          {sys_info['hostname']}")
        print(f" Local IP:          {sys_info['ip_address']}")
        print(f" Operating System:  {sys_info['operating_system']}")
        print(f" Agent Version:     {sys_info['agent_version']}")
        print(f" CPU Usage:         {psutil.cpu_percent()}%")
        print(f" RAM Usage:         {psutil.virtual_memory().percent}%")
        print("-" * 60)
        
        try:
            res = self.session.get(f"{self.api_url}/health", timeout=5)
            if res.status_code == 200:
                health = res.json()
                print(f"[+] Remote API Status: ONLINE ({health.get('status', 'healthy')})")
                print(f"[+] Database:          {health.get('database', 'unknown')}")
            else:
                print(f"[!] Remote API Status: ERROR ({res.status_code})")
        except requests.RequestException as e:
            print(f"[!] Remote API Status: UNREACHABLE ({e})")
        print("=" * 60)

    # -------------------------------------------------------------------------
    # Academic Simulation Scenarios
    # -------------------------------------------------------------------------

    def simulate_bruteforce_attack(self, attacker_ip="198.51.100.77", target_user="admin"):
        """
        Simulates Rule 1: Brute Force Attack.
        Sends 6 failed login attempts in rapid succession.
        """
        print("\n" + "=" * 60)
        print(f" [SIMULATION] Launching Brute-Force Login Attack Vector")
        print(f" Attacker IP: {attacker_ip} | Target: '{target_user}'")
        print("=" * 60)
        self.register()

        for i in range(1, 7):
            print(f"[*] Dispatched failed authentication attempt {i}/6...")
            success = self.send_event(
                event_type="LOGIN_FAILURE",
                source_ip=attacker_ip,
                username=target_user,
                description=f"Failed password validation for account '{target_user}' (attempt #{i})",
                severity="LOW" if i < 5 else "HIGH",
                metadata={"service": "SSH/WebConsole", "auth_attempt": i}
            )
            time.sleep(0.3)

        print("[+] Simulation complete. Backend Threat Detection Engine triggered!")
        print("[+] Check your WATCHGRID SOC Dashboard (/dashboard, /threats, /alerts) to view the HIGH severity detection.\n")

    def simulate_request_abuse(self, attacker_ip="203.0.113.88"):
        """
        Simulates Rule 3: Rapid Request Abuse.
        Sends 32 rapid request events in under 5 seconds.
        """
        print("\n" + "=" * 60)
        print(f" [SIMULATION] Launching Rapid Request Flood Abuse Vector")
        print(f" Source IP: {attacker_ip}")
        print("=" * 60)
        self.register()

        print("[*] Sending 32 rapid HTTP request events...")
        for i in range(1, 33):
            self.send_event(
                event_type="REQUEST",
                source_ip=attacker_ip,
                username="api_crawler",
                description=f"High frequency endpoint traversal on /api/v1/resource/{i}",
                severity="HIGH" if i >= 30 else "INFO",
                metadata={"request_id": i, "endpoint": f"/api/v1/resource/{i}"}
            )
            time.sleep(0.05)

        print("[+] Rapid request flood complete! Check WATCHGRID for 'REQUEST_ABUSE' threat.\n")

    def simulate_multi_account_attack(self, attacker_ip="192.0.2.14"):
        """
        Simulates Rule 2: Distributed Account Attack.
        Sends authentication attempts against 4 different usernames.
        """
        targets = ["admin", "root", "devops", "secops_lead"]
        print("\n" + "=" * 60)
        print(f" [SIMULATION] Launching Multi-Account Credential Spray Vector")
        print(f" Source IP: {attacker_ip} | Targets: {', '.join(targets)}")
        print("=" * 60)
        self.register()

        for user in targets:
            print(f"[*] Probing account '{user}'...")
            self.send_event(
                event_type="LOGIN_FAILURE",
                source_ip=attacker_ip,
                username=user,
                description=f"Invalid credentials submitted for '{user}'",
                severity="LOW",
                metadata={"vector": "credential_spray"}
            )
            time.sleep(0.4)

        print("[+] Multi-account simulation complete! Check WATCHGRID for 'MULTI_ACCOUNT_ATTACK' threat.\n")

    def simulate_normal_activity(self):
        """Sends normal benign system & login events."""
        print("\n[*] Sending benign telemetry events...")
        self.register()
        self.send_event(
            event_type="LOGIN_SUCCESS",
            source_ip=self.get_system_info()["ip_address"],
            username="authorized_analyst",
            description="User logged into local workstation securely with MFA",
            severity="INFO",
            metadata={"mfa_verified": True}
        )
        self.send_event(
            event_type="SYSTEM",
            source_ip=self.get_system_info()["ip_address"],
            username="system",
            description=f"Telemetry report: CPU {psutil.cpu_percent()}%, RAM {psutil.virtual_memory().percent}%",
            severity="INFO",
            metadata={"cpu": psutil.cpu_percent(), "ram": psutil.virtual_memory().percent}
        )
        print("[+] Benign events sent successfully.\n")

    def run_daemon(self):
        """Continuously runs the agent in background daemon mode."""
        print("\n" + "=" * 60)
        print(" WATCHGRID SECURITY AGENT — DAEMON MODE ACTIVE")
        print(f" Pinging heartbeat every {config.HEARTBEAT_INTERVAL_SECONDS}s to {self.api_url}")
        print(" Press Ctrl+C to stop.")
        print("=" * 60 + "\n")
        self.register()

        while True:
            try:
                self.send_heartbeat()
                time.sleep(config.HEARTBEAT_INTERVAL_SECONDS)
            except KeyboardInterrupt:
                print("\n[*] Stopping WATCHGRID Security Agent daemon.")
                sys.exit(0)


def main():
    parser = argparse.ArgumentParser(description="WATCHGRID Distributed Endpoint Security Agent")
    parser.add_argument("--register", action="store_true", help="Register device with WATCHGRID backend")
    parser.add_argument("--heartbeat", action="store_true", help="Send an immediate heartbeat ping")
    parser.add_argument("--status", action="store_true", help="Check system & agent connectivity status")
    parser.add_argument("--test-bruteforce", action="store_true", help="Simulate a 6-attempt Brute Force attack")
    parser.add_argument("--test-request-abuse", action="store_true", help="Simulate rapid Request Flooding (32 reqs)")
    parser.add_argument("--test-multi-account", action="store_true", help="Simulate multi-user credential spraying")
    parser.add_argument("--test-normal", action="store_true", help="Send benign login and system telemetry")
    parser.add_argument("--daemon", action="store_true", help="Run in continuous background monitoring mode")

    args = parser.parse_args()
    agent = WatchgridAgent()

    if args.register:
        agent.register()
    elif args.heartbeat:
        agent.send_heartbeat()
    elif args.status:
        agent.check_status()
    elif args.test_bruteforce:
        agent.simulate_bruteforce_attack()
    elif args.test_request_abuse:
        agent.simulate_request_abuse()
    elif args.test_multi_account:
        agent.simulate_multi_account_attack()
    elif args.test_normal:
        agent.simulate_normal_activity()
    elif args.daemon:
        agent.run_daemon()
    else:
        # Default action: display status overview
        agent.check_status()
        print("\nAvailable simulation commands:")
        print("  python agent.py --register")
        print("  python agent.py --heartbeat")
        print("  python agent.py --test-bruteforce")
        print("  python agent.py --test-request-abuse")
        print("  python agent.py --test-multi-account")
        print("  python agent.py --test-normal")
        print("  python agent.py --daemon")


if __name__ == "__main__":
    main()
