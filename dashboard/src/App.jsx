import { useState } from "react";

const API_BASE = import.meta.env.VITE_DIAGNOSTICS_API_URL || "";
const tests = [
  { key: "battery_voltage", name: "Battery voltage", nominal: "23.8 V", detail: "23.8 V · within 22.0–25.2 V", fault: "20.6 V", faultDetail: "20.6 V · below 22.0 V minimum" },
  { key: "imu_calibration", name: "IMU calibration", nominal: "0.08°", detail: "0.08° · within ±0.5° tolerance", fault: "0.84°", faultDetail: "0.84° · exceeds ±0.5° tolerance" },
  { key: "motor_vibration", name: "Motor vibration", nominal: "1.4 mm/s", detail: "1.4 mm/s · below 2.0 mm/s limit", fault: "3.7 mm/s", faultDetail: "3.7 mm/s · above 2.0 mm/s baseline" },
  { key: "gps_lock", name: "GPS lock", nominal: "18 sats", detail: "18 satellites · above 12 minimum", fault: "7 sats", faultDetail: "7 satellites · below 12 minimum" },
];
const faultScenarios = ["battery_voltage", "imu_calibration", "motor_vibration", "gps_lock"];

function Icon({ children, className = "" }) { return <span className={className}>{children}</span>; }
function Sidebar() {
  return <aside className="sidebar">
    <a className="brand" href="#overview"><span className="brand-mark">A</span><span>AEGIS<span className="brand-sub">ROBOTICS / LAB</span></span></a>
    <div className="workspace-label">WORKSPACE</div>
    <nav className="main-nav" aria-label="Main navigation">
      <a className="nav-item active" href="#overview"><Icon className="nav-icon">◫</Icon>Overview</a>
      <a className="nav-item" href="#devices"><Icon className="nav-icon">⌘</Icon>Devices <span className="nav-count">03</span></a>
      <a className="nav-item" href="#test-runs"><Icon className="nav-icon">◉</Icon>Test runs</a>
      <a className="nav-item" href="#diagnostics"><Icon className="nav-icon">⌁</Icon>Diagnostics <span className="nav-dot" /></a>
      <a className="nav-item" href="#logs"><Icon className="nav-icon">≡</Icon>Event logs</a>
    </nav>
    <div className="sidebar-bottom">
      <div className="connection-card"><span className="pulse" /><div><strong>SIMULATOR ONLINE</strong><small>All systems nominal</small></div><span className="tiny-chevron">⌄</span></div>
      <a className="nav-item" href="#settings"><Icon className="nav-icon">⚙</Icon>Settings</a>
      <div className="user-row"><div className="avatar">ML</div><div className="user-meta"><strong>Mission Control</strong><small>Operator workspace</small></div><span className="more">···</span></div>
    </div>
  </aside>;
}

function Header() {
  return <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><b>/</b><strong>Overview</strong></div><div className="top-actions"><div className="live-indicator"><i />LIVE TELEMETRY</div><button className="icon-button" aria-label="Notifications">♧<span className="notification-dot" /></button><div className="top-avatar">ML</div></div></header>;
}

function Stats({ runCount, alerts }) {
  return <section className="stat-grid" aria-label="Fleet summary">
    <article className="stat-card"><div className="stat-top"><span>FLEET STATUS</span><span className="stat-icon green">⌘</span></div><div className="stat-main"><strong>2<span className="stat-divider">/</span>3</strong><span className="stat-label">devices healthy</span></div><div className="stat-foot"><span className="status-pill ok"><i /> 2 online</span><span className="stat-muted">· 1 needs attention</span></div></article>
    <article className="stat-card"><div className="stat-top"><span>TESTS TODAY</span><span className="stat-icon blue">◉</span></div><div className="stat-main"><strong>{runCount}</strong><span className="stat-label">automated checks</span></div><div className="stat-foot"><span className="trend-up">↗ 12%</span><span className="stat-muted"> vs. previous 24h</span></div></article>
    <article className="stat-card"><div className="stat-top"><span>PASS RATE</span><span className="stat-icon orange">⌁</span></div><div className="stat-main"><strong>96.8<span className="percent">%</span></strong><span className="stat-label">last 7 days</span></div><div className="stat-foot"><div className="mini-progress"><span /></div><span className="stat-muted">target 95%</span></div></article>
    <article className="stat-card"><div className="stat-top"><span>OPEN ALERTS</span><span className="stat-icon red">!</span></div><div className="stat-main"><strong>{String(alerts).padStart(2, "0")}</strong><span className="stat-label">requires review</span></div><div className="stat-foot"><span className="status-pill warning"><i /> Battery voltage</span></div></article>
  </section>;
}

function Telemetry() {
  const [range, setRange] = useState("24H");
  return <article className="panel telemetry-panel"><div className="panel-heading"><div><div className="panel-kicker">FLEET TELEMETRY</div><h2>Health over time</h2></div><div className="chart-controls">{["24H", "7D", "30D"].map((item) => <button key={item} onClick={() => setRange(item)} className={`range-button ${range === item ? "active" : ""}`}>{item}</button>)}<span className="chart-menu">···</span></div></div>
    <div className="chart-legend"><span><i className="legend-dot cyan" />Battery</span><span><i className="legend-dot violet" />IMU</span><span className="chart-unit">NORMALIZED HEALTH SCORE</span></div>
    <div className="chart-wrap"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span></div><div className="chart-area"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg className="chart-svg" viewBox="0 0 760 190" preserveAspectRatio="none" role="img" aria-label="Battery and IMU health line chart"><defs><linearGradient id="area-cyan" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#4dd7c0" stopOpacity=".17" /><stop offset="1" stopColor="#4dd7c0" stopOpacity="0" /></linearGradient></defs><path className="area-fill" d="M0 56 C40 53 40 62 83 60 S130 48 166 52 S214 62 250 55 S296 48 332 53 S374 60 416 51 S461 42 500 48 S548 55 583 45 S626 39 667 43 S718 32 760 36 L760 190 L0 190Z" /><path className="line-cyan" d="M0 56 C40 53 40 62 83 60 S130 48 166 52 S214 62 250 55 S296 48 332 53 S374 60 416 51 S461 42 500 48 S548 55 583 45 S626 39 667 43 S718 32 760 36" /><path className="line-violet" d="M0 97 C38 92 48 102 83 96 S131 88 166 92 S213 98 250 91 S297 83 332 87 S379 99 416 91 S461 79 500 84 S548 91 583 82 S628 72 667 77 S716 66 760 70" /><circle cx="500" cy="48" r="4" className="point-cyan" /><circle cx="500" cy="84" r="4" className="point-violet" /></svg><div className="chart-tooltip"><span>14:00 UTC</span><strong>Battery <b>94%</b></strong><strong>IMU <b>82%</b></strong></div><div className="chart-x-labels"><span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>NOW</span></div></div></div>
  </article>;
}

function Coverage() {
  return <article className="panel distribution-panel"><div className="panel-heading"><div><div className="panel-kicker">TEST COVERAGE</div><h2>Checks by category</h2></div><button className="chart-menu" aria-label="More options">···</button></div><div className="donut-wrap"><div className="donut"><div className="donut-center"><strong>24</strong><span>TESTS</span></div></div></div><div className="distribution-list"><div><span><i className="legend-dot cyan" />Calibration</span><strong>09 <small>· 100%</small></strong></div><div><span><i className="legend-dot blue" />Power system</span><strong>06 <small>· 83%</small></strong></div><div><span><i className="legend-dot violet" />Motion &amp; IMU</span><strong>05 <small>· 100%</small></strong></div><div><span><i className="legend-dot orange" />Navigation</span><strong>04 <small>· 75%</small></strong></div></div></article>;
}

function Devices() {
  const devices = [["UAV-01", "Surveyor · Quadrotor", "drone", "Healthy", "v2.8.1", "2 min ago"], ["ROVER-03", "Atlas · Ground rover", "rover", "Healthy", "v1.6.4", "18 min ago"], ["UAV-04", "Scout · Quadrotor", "drone muted-device", "Attention", "v2.7.9", "1 hr ago"]];
  return <article className="panel devices-panel" id="devices"><div className="panel-heading"><div><div className="panel-kicker">CONNECTED HARDWARE <span className="count-badge">03</span></div><h2>Device fleet</h2></div><button className="text-button">View all <span>↗</span></button></div><div className="table-wrap"><table><thead><tr><th>DEVICE</th><th>STATUS</th><th>FIRMWARE</th><th>LAST TEST</th><th /></tr></thead><tbody>{devices.map(([name, description, icon, status, firmware, time]) => <tr key={name} className={status === "Attention" ? "attention-row" : ""}><td><div className="device-cell"><span className={`device-icon ${icon}`}>{icon.includes("rover") ? "▰" : "✣"}</span><span><strong>{name}</strong><small>{description}</small></span></div></td><td><span className={`status-text ${status === "Healthy" ? "healthy" : "attention"}`}><i />{status}</span></td><td className="mono">{firmware}</td><td className="muted-cell">{time}</td><td className="row-more">···</td></tr>)}</tbody></table></div></article>;
}

function Triage({ summary, onDetails }) {
  return <article className="panel triage-panel" id="diagnostics"><div className="panel-heading"><div><div className="panel-kicker">AI TRIAGE <span className="ai-badge">✦ ASSIST</span></div><h2>Needs attention</h2></div><span className="severity-tag"><i /> REVIEW</span></div><div className="triage-device"><span className="device-icon drone muted-device">✣</span><div><strong>UAV-04 · Scout</strong><small>Diagnostic run · 09:42:18 UTC</small></div><span className="triage-time">12m</span></div><div className="triage-summary"><div className="summary-icon">⌁</div><p>{summary || "Battery voltage is below the configured service threshold. Verify the pack before the next mission."}</p></div><div className="evidence-label">EVIDENCE</div><div className="evidence-row"><span>Battery voltage</span><strong className="evidence-bad">20.6 V <small>↓</small></strong><span className="limit-text">min. 22.0 V</span></div><div className="evidence-row"><span>Cell delta</span><strong>0.04 V</strong><span className="limit-text">max. 0.10 V</span></div><button className="triage-link" onClick={onDetails}>View recommended checks <span>→</span></button></article>;
}

function Runs({ run }) {
  return <article className="panel runs-panel" id="test-runs"><div className="panel-heading"><div><div className="panel-kicker">RECENT ACTIVITY</div><h2>Latest test runs</h2></div><button className="text-button">All test runs <span>↗</span></button></div><div className="runs-list">{run && <div className="run-row"><span className={`run-result ${run.issue ? "warning-result" : "passed"}`}>{run.issue ? "!" : "✓"}</span><div className="run-name"><strong>Full system check</strong><small>UAV-01 · Surveyor · just now</small></div><div className="run-tests"><strong>{run.issue ? "03 / 04" : "04 / 04"}</strong><small>{run.issue ? "needs review" : "checks passed"}</small></div><div className="run-duration">00:14</div><div className="run-time">just now</div><span className="row-more">···</span></div>}<div className="run-row"><span className="run-result passed">✓</span><div className="run-name"><strong>Full system check</strong><small>UAV-01 · Surveyor</small></div><div className="run-tests"><strong>12 / 12</strong><small>checks passed</small></div><div className="run-duration">00:14</div><div className="run-time">2 min ago</div><span className="row-more">···</span></div><div className="run-row"><span className="run-result passed">✓</span><div className="run-name"><strong>Calibration sequence</strong><small>ROVER-03 · Atlas</small></div><div className="run-tests"><strong>08 / 08</strong><small>checks passed</small></div><div className="run-duration">00:32</div><div className="run-time">18 min ago</div><span className="row-more">···</span></div><div className="run-row failed-run"><span className="run-result warning-result">!</span><div className="run-name"><strong>Pre-flight inspection</strong><small>UAV-04 · Scout</small></div><div className="run-tests"><strong>09 / 10</strong><small>checks passed</small></div><div className="run-duration">00:21</div><div className="run-time">1 hr ago</div><span className="row-more">···</span></div></div></article>;
}

function Dialog({ result, onClose }) {
  if (!result) return null;
  const issue = result.findings.some((item) => item.status !== "pass");
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="result-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button className="dialog-close" aria-label="Close" onClick={onClose}>×</button><div className="dialog-kicker">AUTOMATED DIAGNOSTICS</div><div className="dialog-title-row"><h2 id="dialog-title">Run complete</h2><span className={`dialog-status ${issue ? "alert" : ""}`}>{issue ? "REVIEW REQUIRED" : "PASS"}</span></div><p>{result.triage.summary}</p><div className="dialog-findings">{result.findings.map((item) => <div className="finding" key={item.key}><span>{item.name}</span><strong className={item.status !== "pass" ? "fail" : ""}>{item.value}</strong></div>)}</div><div className="operator-note">✦ <span>AI triage is advisory. Review evidence and follow your maintenance procedures before returning hardware to service.</span></div><button className="primary-button dialog-done" onClick={onClose}>Done</button></section></div>;
}

export default function App() {
  const [runCount, setRunCount] = useState(24);
  const [alerts, setAlerts] = useState(1);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [triageSummary, setTriageSummary] = useState("");
  const [toast, setToast] = useState("");
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };

  async function runDiagnostics() {
    setBusy(true);
    try {
      let response;
      if (API_BASE) {
        const scenario = "nominal";
        const res = await fetch(`${API_BASE}/api/v1/diagnostics/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ device_id: "uav-01", scenario }) });
        if (!res.ok) throw new Error(`Service returned ${res.status}`);
        response = await res.json();
        response.findings = response.findings.map((item) => ({ ...item, value: `${item.value} ${item.unit}` }));
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        const fault = Math.random() < 0.32 ? faultScenarios[Math.floor(Math.random() * faultScenarios.length)] : null;
        response = { findings: tests.map((item) => ({ key: item.key, name: item.name, value: fault === item.key ? item.fault : item.nominal, status: fault === item.key ? (fault === "battery_voltage" || fault === "imu_calibration" ? "fail" : "warning") : "pass", detail: fault === item.key ? item.faultDetail : item.detail })) };
        const finding = response.findings.find((item) => item.status !== "pass");
        const explanations = { battery_voltage: "Battery pack voltage is below the service threshold. Inspect pack voltage and connector seating before the next mission.", imu_calibration: "IMU calibration is outside tolerance. Reseat the airframe on a level surface and repeat calibration.", motor_vibration: "Motor vibration is above its baseline. Inspect propellers and motor mounts with power isolated.", gps_lock: "GPS lock quality is below minimum. Check antenna seating and repeat acquisition outdoors." };
        response.triage = { summary: finding ? explanations[finding.key] : "All simulated checks passed. No fault evidence was recorded." };
      }
      const issueCount = response.findings.filter((item) => item.status !== "pass").length;
      if (issueCount) { setAlerts(issueCount); setTriageSummary(response.triage.summary); }
      setRunCount((value) => value + 1);
      setResult(response);
    } catch (error) { notify(`Diagnostics unavailable: ${error.message}`); }
    finally { setBusy(false); }
  }

  function exportReport() {
    const data = { exported_at: new Date().toISOString(), mode: "simulated", fleet: ["UAV-01", "ROVER-03", "UAV-04"], note: "Demo data only; not a maintenance release." };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `aegis-diagnostics-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url); notify("Report exported · JSON");
  }

  return <div className="app-shell"><Sidebar /><main className="main-content" id="overview"><Header /><div className="page-wrap">
    <section className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line" />FLIGHT SYSTEMS / DIAGNOSTICS</div><h1>System overview<span className="heading-period">.</span></h1><p className="subheading">Monitor fleet health, run automated checks, and investigate anomalies.</p></div><div className="heading-actions"><button className="secondary-button" onClick={exportReport}><span>↓</span> Export report</button><button className="primary-button" onClick={runDiagnostics} disabled={busy}><span className="button-play">{busy ? "◌" : "▶"}</span>{busy ? "Running checks…" : "Run diagnostics"}</button></div></section>
    <Stats runCount={runCount} alerts={alerts} />
    <section className="content-grid"><Telemetry /><Coverage /></section>
    <section className="content-grid lower-grid"><Devices /><Triage summary={triageSummary} onDetails={() => notify("Suggested checks: verify pack voltage, inspect connector seating, then rerun the test.")} /></section>
    <Runs run={result} />
    <footer className="footer"><span><i className="footer-pulse" />SIMULATOR MODE <span className="footer-sep">·</span> Data is generated for demonstration</span><span>AEGIS DIAGNOSTICS <b>v1.0.0</b></span></footer>
  </div></main>{toast && <div className="toast visible" role="status" aria-live="polite">{toast}</div>}<Dialog result={result} onClose={() => setResult(null)} /></div>;
}
