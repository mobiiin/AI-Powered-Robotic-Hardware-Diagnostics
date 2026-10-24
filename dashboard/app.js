/* Simulated frontend adapter. Set window.DIAGNOSTICS_API_URL before this file to use the Python service. */
const API_BASE = window.DIAGNOSTICS_API_URL || "";
const scenarios = ["nominal", "battery", "imu", "motor", "gps"];
const el = (id) => document.getElementById(id);
let runCount = 24;
let toastTimer;

function toast(message) {
  const node = el("toast");
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 2800);
}

function simulatedFindings(scenario) {
  const findings = [
    { key: "battery_voltage", name: "Battery voltage", value: "23.8 V", status: "pass", detail: "23.8 V · within 22.0–25.2 V" },
    { key: "imu_calibration", name: "IMU calibration", value: "0.08°", status: "pass", detail: "0.08° · within ±0.5° tolerance" },
    { key: "motor_vibration", name: "Motor vibration", value: "1.4 mm/s", status: "pass", detail: "1.4 mm/s · below 2.0 mm/s limit" },
    { key: "gps_lock", name: "GPS lock", value: "18 sats", status: "pass", detail: "18 satellites · above 12 minimum" },
  ];
  const overrides = {
    battery: [0, "20.6 V", "fail", "20.6 V · below 22.0 V minimum"],
    imu: [1, "0.84°", "fail", "0.84° · exceeds ±0.5° tolerance"],
    motor: [2, "3.7 mm/s", "warning", "3.7 mm/s · above 2.0 mm/s baseline"],
    gps: [3, "7 sats", "warning", "7 satellites · below 12 minimum"],
  };
  if (overrides[scenario]) {
    const [index, value, status, detail] = overrides[scenario];
    findings[index] = { ...findings[index], value, status, detail };
  }
  return findings;
}

function triage(findings) {
  const issue = findings.find((item) => item.status !== "pass");
  if (!issue) return { severity: "nominal", summary: "All simulated checks passed. No fault evidence was recorded." };
  const explanations = {
    battery_voltage: "Battery voltage is below the configured service threshold. Inspect pack voltage and connector seating before the next mission.",
    imu_calibration: "IMU calibration is outside the configured tolerance. Reseat the airframe on a level surface and repeat calibration.",
    motor_vibration: "Motor vibration is above the configured baseline. Inspect propellers and motor mounts with power isolated.",
    gps_lock: "GPS lock quality is below the configured minimum. Check antenna seating and repeat acquisition outdoors.",
  };
  return { severity: issue.status === "fail" ? "critical" : "warning", summary: explanations[issue.key] };
}

async function runDiagnostics() {
  const button = el("run-btn");
  button.disabled = true;
  button.innerHTML = '<span class="button-play">◌</span> Running checks…';
  try {
    let data;
    if (API_BASE) {
      const response = await fetch(`${API_BASE}/api/v1/diagnostics/run`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: "uav-01", scenario: "nominal" }),
      });
      if (!response.ok) throw new Error(`Service returned ${response.status}`);
      data = await response.json();
      data.findings = data.findings.map((item) => ({ ...item, value: `${item.value} ${item.unit}` }));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 750));
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      data = { findings: simulatedFindings(scenario) };
      data.triage = triage(data.findings);
    }
    renderResult(data);
    runCount += 1;
    el("test-count").textContent = runCount;
    el("result-dialog").showModal();
  } catch (error) {
    toast(`Diagnostics unavailable: ${error.message}`);
  } finally {
    button.disabled = false;
    button.innerHTML = '<span class="button-play">▶</span> Run diagnostics';
  }
}

function renderResult(data) {
  const findings = data.findings || [];
  const issueCount = findings.filter((item) => item.status !== "pass").length;
  const critical = findings.some((item) => item.status === "fail");
  el("dialog-status").textContent = critical ? "REVIEW REQUIRED" : issueCount ? "CHECK WARNINGS" : "PASS";
  el("dialog-status").classList.toggle("alert", issueCount > 0);
  el("dialog-summary").textContent = data.triage?.summary || "Automated checks completed.";
  el("dialog-findings").innerHTML = findings.map((item) => `<div class="finding"><span>${escapeHtml(item.name)}</span><strong class="${item.status !== "pass" ? "fail" : ""}">${escapeHtml(item.value)}</strong></div>`).join("");
  if (issueCount) {
    el("triage-summary").textContent = data.triage?.summary || "A diagnostic measurement needs operator review.";
    el("alert-count").textContent = String(issueCount).padStart(2, "0");
  }
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

el("run-btn").addEventListener("click", runDiagnostics);
el("export-btn").addEventListener("click", () => {
  const report = { exported_at: new Date().toISOString(), mode: "simulated", fleet: ["UAV-01", "ROVER-03", "UAV-04"], note: "Demo data only; not a maintenance release." };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `aegis-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
  toast("Report exported · JSON");
});
el("triage-detail").addEventListener("click", () => {
  toast("Suggested checks: verify pack voltage, inspect connector seating, then rerun the test.");
});
document.querySelectorAll(".range-button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".range-button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  toast(`Showing ${button.textContent} telemetry window`);
}));
