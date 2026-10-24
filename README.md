# Aegis Robotics Diagnostics

An AI-assisted hardware diagnostics and automated testing platform for robots and UAVs. This repository contains a responsive operator dashboard, a Python diagnostic API, and a deterministic simulator so the workflow can be explored without connecting physical hardware.

## System layout

```text
Robot / UAV sensors and actuators
        │ adapters (future hardware integration)
        ▼
Python Diagnostic Service ── telemetry, calibration and test results
        │
        ├── Rule-based triage (safe default, no API key required)
        └── Optional LLM provider (server-side only)
        ▼
React-ready operator dashboard (static HTML/CSS/JS demo)
```

## Run locally

The dashboard runs as static files: open `dashboard/index.html` or serve the `dashboard` directory with any static web server. The simulator is built in, so no device or credentials are required.

Run the Python API from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn service.app:app --reload
```

The API exposes `GET /health`, `GET /api/v1/devices`, `GET /api/v1/telemetry/{device_id}`, `GET /api/v1/tests`, and `POST /api/v1/diagnostics/run`. The dashboard can be pointed at it by setting `window.DIAGNOSTICS_API_URL` before `app.js` loads. The hosted static demo uses its built-in simulator.

## Safety and integration boundaries

- The included simulator never connects to real equipment or sends actuator commands.
- Hardware adapters should be implemented behind a device interface and start in read-only mode. Require an explicit operator action and hardware interlocks before any actuation.
- Triage is advisory. It presents measured evidence and bounded next checks; a human operator decides whether to service or return equipment to operation.
- LLM credentials belong only in a protected backend environment. The UI and repository must never contain provider secrets.
- The default service triage is deterministic. An LLM provider can later implement `service/triage.py` without changing the dashboard contract.

## Deployment

`dashboard/` is a static site suitable for GitHub Pages or another static host. The API is a separate Python service and needs a Python-capable host. Configure CORS for the dashboard origin and set `window.DIAGNOSTICS_API_URL` to the API origin when connecting the two.

## License

MIT
