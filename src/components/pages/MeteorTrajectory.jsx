import React, { useEffect, useState } from "react";
import "./MeteorTrajectory.css";

const API_BASE = "http://localhost:8000";

const MeteorTrajectory = () => {
  const [currentTab, setCurrentTab] = useState("meteors");
  const [apiStatus, setApiStatus] = useState("Checking API...");
  const [feedStartDate, setFeedStartDate] = useState("");
  const [feedEndDate, setFeedEndDate] = useState("");
  const [feedResults, setFeedResults] = useState(null);
  const [browsePage, setBrowsePage] = useState(0);
  const [browseResults, setBrowseResults] = useState(null);

  // On load: set default dates & check API
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    setFeedStartDate(today);
    setFeedEndDate(nextWeek);

    const checkAPI = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (data.status === "healthy") setApiStatus("API Online");
        else throw new Error("API unhealthy");
      } catch (error) {
        setApiStatus("API Offline");
      }
    };
    checkAPI();
  }, []);

  const switchTab = (tabName) => setCurrentTab(tabName);

  // Get NEO Feed
  const getFeed = async () => {
    setFeedResults({ loading: true });
    try {
      const res = await fetch(
        `${API_BASE}/meteors/feed?start_date=${feedStartDate}&end_date=${feedEndDate}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");
      setFeedResults(data);
    } catch (error) {
      setFeedResults({ error: error.message });
    }
  };

  // Browse NEOs
  const browseNEOs = async (page = browsePage) => {
    setBrowseResults({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/meteors/browse?page=${page}&size=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");
      setBrowseResults(data);
    } catch (error) {
      setBrowseResults({ error: error.message });
    }
  };

  const handleAnalyzeNEO = async (neoId) => {
    setFeedResults({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/meteors/${neoId}/trajectory?days_forward=365`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");
      setFeedResults(data);
      setTimeout(() => renderTrajectoryCanvas(data.trajectory_points), 100); // render canvas
    } catch (error) {
      setFeedResults({ error: error.message });
    }
  };

  // Risk class helper
  const getRiskClass = (riskText) => {
    if (!riskText) return "risk-minimal";
    if (riskText.includes("CRITICAL")) return "risk-critical";
    if (riskText.includes("HIGH")) return "risk-high";
    if (riskText.includes("MODERATE")) return "risk-moderate";
    if (riskText.includes("LOW")) return "risk-low";
    return "risk-minimal";
  };

  // Map distance to color for canvas
  const mapDistanceToColor = (d) => {
    if (d <= 0.005) return "#e53935";
    if (d <= 0.02) return "#ff7043";
    if (d <= 0.1) return "#ffca28";
    if (d <= 0.5) return "#66bb6a";
    return "#42a5f5";
  };

  // Canvas rendering
  const renderTrajectoryCanvas = (points) => {
    if (!points || points.length === 0) return;
    const canvas = document.getElementById("orbitCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const margin = 24;
    const maxPointRadius = Math.max(...points.map((p) => Math.hypot(p.x_au || p.x, p.y_au || p.y)));
    const maxRadius = Math.max(1.0, maxPointRadius);
    const scale = (Math.min(w, h) / 2 - margin) / maxRadius;
    const cx = w / 2;
    const cy = h / 2;

    // Sun
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = "#ffd54f";
    ctx.fill();

    // Earth's orbit
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 1.0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Earth
    const earthX = cx + scale * 1.0;
    const earthY = cy;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#4fc3f7";
    ctx.fill();
    ctx.closePath();
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.fillStyle = "#9be7ff";
    ctx.textAlign = "left";
    ctx.fillText("Earth (1 AU)", earthX + 8, earthY + 4);

    const pts2D = points.map((p, idx) => {
      const x = p.x_au ?? p.x;
      const y = p.y_au ?? p.y;
      return {
        idx,
        day: p.day,
        x_c: cx + x * scale,
        y_c: cy - y * scale,
        distance_to_earth_au: p.distance_to_earth_au ?? p.distance_to_earth ?? 10,
        distance_from_sun_au: p.distance_from_sun_au ?? p.distance_from_sun ?? 1,
      };
    });

    // Trajectory line
    ctx.beginPath();
    pts2D.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x_c, pt.y_c) : ctx.lineTo(pt.x_c, pt.y_c)));
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Closest approach
    let closestIdx = 0;
    let minDist = Infinity;
    pts2D.forEach((p, i) => {
      if (p.distance_to_earth_au < minDist) {
        minDist = p.distance_to_earth_au;
        closestIdx = i;
      }
    });

    pts2D.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(p.x_c, p.y_c, i === closestIdx ? 4.5 : 3.0, 0, Math.PI * 2);
      ctx.fillStyle = mapDistanceToColor(p.distance_to_earth_au);
      ctx.fill();
    });

    const closestPoint = pts2D[closestIdx];
    ctx.beginPath();
    ctx.arc(closestPoint.x_c, closestPoint.y_c, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 99, 71, 0.95)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const closestLabel = document.getElementById("closestLabel");
    if (closestLabel)
      closestLabel.innerHTML = `Closest Approach: Day ${closestPoint.day} — ${closestPoint.distance_to_earth_au.toFixed(
        4
      )} AU (${(closestPoint.distance_to_earth_au * 149597870.7 / 1000).toFixed(0)} thousand km)`;

    // Tooltip
    const tooltip = document.getElementById("vizTooltip");
    canvas.onmousemove = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const mx = evt.clientX - rect.left;
      const my = evt.clientY - rect.top;
      let hit = null;
      for (let p of pts2D) {
        if (Math.hypot(mx - p.x_c, my - p.y_c) <= 6) {
          hit = p;
          break;
        }
      }
      if (hit) {
        tooltip.style.display = "block";
        tooltip.style.left = `${evt.clientX}px`;
        tooltip.style.top = `${evt.clientY - 10}px`;
        tooltip.innerHTML = `Day ${hit.day} — Sun ${hit.distance_from_sun_au.toFixed(
          3
        )} AU — Earth ${hit.distance_to_earth_au.toFixed(4)} AU`;
      } else tooltip.style.display = "none";
    };
    canvas.onmouseleave = () => (tooltip.style.display = "none");
  };

  return (
    <div className="container">
      <header>
        <h1>Meteor Trajectory Predictor</h1>
        <p className="subtitle">NASA-powered trajectory analysis & impact probability calculation</p>
        <div className={`api-status ${apiStatus === "API Online" ? "status-healthy" : "status-error"}`}>
          {apiStatus}
        </div>
      </header>

      <div className="tabs">
        <div className={`tab ${currentTab === "meteors" ? "active" : ""}`} onClick={() => switchTab("meteors")}>
          NEOs Feed
        </div>
        <div className={`tab ${currentTab === "browse" ? "active" : ""}`} onClick={() => switchTab("browse")}>
          Browse NEOs
        </div>
      </div>

      {currentTab === "meteors" && (
        <div className="tab-content active">
          <div className="card">
            <h2>Upcoming NEO Close Approaches</h2>
            <div className="info-box">View asteroids approaching Earth in the next 7 days</div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={feedStartDate} onChange={(e) => setFeedStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={feedEndDate} onChange={(e) => setFeedEndDate(e.target.value)} />
            </div>
            <button className="btn" onClick={getFeed}>Get NEO Feed</button>

            <div id="feedResults" className="results">
              {feedResults?.loading && (
                <div className="loading"><div className="spinner"></div>Loading NEO feed...</div>
              )}
              {feedResults?.error && <div className="error-message">{feedResults.error}</div>}
              {/* Here you can map feedResults.approaching_objects to JSX */}
            </div>
          </div>
        </div>
      )}

      {currentTab === "browse" && (
        <div className="tab-content active">
          <div className="card">
            <h2>Browse All Near Earth Objects</h2>
            <div className="form-group">
              <label>Page Number</label>
              <input type="number" value={browsePage} min={0} onChange={(e) => setBrowsePage(Number(e.target.value))} />
            </div>
            <button className="btn" onClick={() => browseNEOs()}>Load NEOs</button>
            <div id="browseResults" className="results">
              {browseResults?.loading && (
                <div className="loading"><div className="spinner"></div>Loading NEOs...</div>
              )}
              {browseResults?.error && <div className="error-message">{browseResults.error}</div>}
              {/* Here you can map browseResults.neos to JSX */}
            </div>
          </div>
        </div>
      )}

      <div className="tooltip" id="vizTooltip"></div>
    </div>
  );
};

export default MeteorTrajectory;
