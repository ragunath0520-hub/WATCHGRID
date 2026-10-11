import os
import uuid
import socket
import platform

# Base API URL
API_URL = os.getenv("WATCHGRID_API_URL", "http://localhost:8000").rstrip("/")

# Authentication / Ingestion key
API_KEY = os.getenv("WATCHGRID_API_KEY", "watchgrid-agent-key-alpha-99")

# Generate or read persistent Device ID
def get_device_id() -> str:
    env_id = os.getenv("WATCHGRID_DEVICE_ID")
    if env_id:
        return env_id
    
    # Generate a deterministic ID based on node
    node_id = hex(uuid.getnode())[2:].upper()
    return f"DEV-NODE-{node_id[:8]}"

DEVICE_ID = get_device_id()
DEVICE_NAME = os.getenv("WATCHGRID_DEVICE_NAME", f"Endpoint-{socket.gethostname()}")
AGENT_VERSION = "1.0.0"
HEARTBEAT_INTERVAL_SECONDS = int(os.getenv("WATCHGRID_HEARTBEAT_INTERVAL", "30"))
