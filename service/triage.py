"""Deterministic, evidence-based triage for the demo service."""

from typing import Any


def analyze(findings: list[dict[str, Any]]) -> dict[str, Any]:
    """Turn diagnostic findings into bounded next steps; never authorize flight."""
    failed = [item for item in findings if item.get("status") == "fail"]
    warnings = [item for item in findings if item.get("status") == "warning"]
    if not failed and not warnings:
        return {
            "severity": "nominal",
            "summary": "All simulated checks passed. No fault evidence was recorded.",
            "likely_causes": [],
            "recommended_checks": ["Review the test record before returning hardware to service."],
            "evidence": [],
            "requires_operator_review": True,
        }

    evidence = [item.get("detail", item.get("name", "Unknown finding")) for item in failed + warnings]
    causes: list[str] = []
    checks: list[str] = []
    for item in failed + warnings:
        key = item.get("key", "")
        if key == "battery_voltage":
            causes.append("Battery pack voltage is below the configured service threshold.")
            checks.extend(["Inspect pack voltage with a calibrated meter.", "Check connector seating and cell balance."])
        elif key == "imu_calibration":
            causes.append("IMU calibration is outside the configured tolerance.")
            checks.extend(["Reseat the airframe on a level surface and repeat IMU calibration.", "Inspect IMU mounting for looseness or vibration damage."])
        elif key == "motor_vibration":
            causes.append("Motor vibration is above the configured baseline.")
            checks.extend(["Inspect propellers and motor mounts with power isolated.", "Compare motor bearing noise and spin resistance by hand."])
        elif key == "gps_lock":
            causes.append("GPS lock quality is lower than the configured minimum.")
            checks.extend(["Check antenna seating and cable routing.", "Repeat the satellite acquisition test outdoors with a clear sky view."])
        else:
            causes.append("A diagnostic measurement crossed its configured limit.")
            checks.append("Review the raw measurement and applicable maintenance procedure.")

    return {
        "severity": "critical" if failed else "warning",
        "summary": "One or more checks need operator review before the vehicle is returned to service.",
        "likely_causes": list(dict.fromkeys(causes)),
        "recommended_checks": list(dict.fromkeys(checks)),
        "evidence": evidence,
        "requires_operator_review": True,
    }
