# Aegis Robotics Diagnostics

An AI-assisted hardware diagnostics and automated testing platform for robots and UAVs. This repository contains a responsive React dashboard, a Python diagnostic API, and a deterministic simulator so the workflow can be explored without connecting physical hardware.

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
React operator dashboard (Vite)
```

## Run locally

Run the React dashboard:

```bash
cd dashboard
npm install
npm run dev
```

The simulator is built in, so no device or credentials are required.

Run the Python API from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn service.app:app --reload
```

The API exposes `GET /health`, `GET /api/v1/devices`, `GET /api/v1/telemetry/{device_id}`, `GET /api/v1/tests`, and `POST /api/v1/diagnostics/run`. Set `VITE_DIAGNOSTICS_API_URL` in the dashboard build environment to connect the dashboard to the API. The hosted demo uses its built-in simulator when this variable is unset.

## Safety and integration boundaries

- The included simulator never connects to real equipment or sends actuator commands.
- Hardware adapters should be implemented behind a device interface and start in read-only mode. Require an explicit operator action and hardware interlocks before any actuation.
- Triage is advisory. It presents measured evidence and bounded next checks; a human operator decides whether to service or return equipment to operation.
- LLM credentials belong only in a protected backend environment. The UI and repository must never contain provider secrets.
- The default service triage is deterministic. An LLM provider can later implement `service/triage.py` without changing the dashboard contract.

## Deployment

`dashboard/` builds to a static site suitable for GitHub Pages or Vercel. GitHub Pages deployment is configured in `.github/workflows/pages.yml`. The API is a separate Python service and needs a Python-capable host. Restrict CORS to the dashboard origin and set `VITE_DIAGNOSTICS_API_URL` when connecting the two.

## License

MIT
