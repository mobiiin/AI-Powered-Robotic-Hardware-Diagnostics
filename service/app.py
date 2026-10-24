"""Read-only demo API for simulated robotics hardware diagnostics."""

from datetime import datetime, timezone
from random import Random
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .triage import analyze

app = FastAPI(title="Aegis Robotics Diagnostics API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to the dashboard origin in production.
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

DEVICES = [
    {"id": "uav-01", "name": "UAV-01 · Surveyor", "type": "quadrotor", "status": "online", "firmware": "v2.8.1", "last_seen": "now"},
    {"id": "rover-03", "name": "Rover-03 · Atlas", "type": "ground rover", "status": "online", "firmware": "v1.6.4", "last_seen": "now"},
    {"id": "uav-04", "name": "UAV-04 · Scout", "type": "quadrotor", "status": "warning", "firmware": "v2.7.9", "last_seen": "now"},
]


class DiagnosticRequest(BaseModel):
    device_id: str = "uav-01"
    scenario: str = Field(default="nominal", pattern="^(nominal|battery|imu|motor|gps)$")


def _findings(scenario: str) -> list[dict[str, Any]]:
    values = [
        {"key": "battery_voltage", "name": "Battery voltage", "value": 23.8, "unit": "V", "status": "pass", "detail": "23.8 V · within 22.0–25.2 V"},
        {"key": "imu_calibration", "name": "IMU calibration", "value": 0.08, "unit": "°", "status": "pass", "detail": "0.08° · within ±0.5° tolerance"},
        {"key": "motor_vibration", "name": "Motor vibration", "value": 1.4, "unit": "mm/s", "status": "pass", "detail": "1.4 mm/s · below 2.0 mm/s limit"},
        {"key": "gps_lock", "name": "GPS lock", "value": 18, "unit": "satellites", "status": "pass", "detail": "18 satellites · above 12 minimum"},
    ]
    overrides = {
        "battery": (0, 20.6, "fail", "20.6 V · below 22.0 V minimum"),
        "imu": (1, 0.84, "fail", "0.84° · exceeds ±0.5° tolerance"),
        "motor": (2, 3.7, "warning", "3.7 mm/s · above 2.0 mm/s baseline"),
        "gps": (3, 7, "warning", "7 satellites · below 12 minimum"),
    }
    if scenario in overrides:
        index, value, status, detail = overrides[scenario]
        values[index] = {**values[index], "value": value, "status": status, "detail": detail}
    return values


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "mode": "simulated", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/v1/devices")
def devices() -> dict[str, Any]:
    return {"devices": DEVICES, "mode": "simulated"}


@app.get("/api/v1/telemetry/{device_id}")
def telemetry(device_id: str) -> dict[str, Any]:
    if not any(device["id"] == device_id for device in DEVICES):
        return {"error": "unknown_device", "device_id": device_id}
    rng = Random(device_id)
    return {
        "device_id": device_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "simulated",
        "battery_voltage": round(23.4 + rng.random() * 0.8, 1),
        "temperature_c": round(36 + rng.random() * 3, 1),
        "gps_satellites": 18,
        "imu_drift_deg": round(rng.random() * 0.15, 2),
    }


@app.get("/api/v1/tests")
def tests() -> dict[str, Any]:
    return {"tests": ["battery_voltage", "imu_calibration", "motor_vibration", "gps_lock"], "mode": "simulated"}


@app.post("/api/v1/diagnostics/run")
def run_diagnostics(request: DiagnosticRequest) -> dict[str, Any]:
    findings = _findings(request.scenario)
    return {
        "run_id": f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "device_id": request.device_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mode": "simulated",
        "findings": findings,
        "triage": analyze(findings),
    }
