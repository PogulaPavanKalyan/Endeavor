import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./AdminHome.css";

const StatisticsManagement = () => {
  const [stats, setStats] = useState({
    conferencesCount: 150,
    countriesCount: 50,
    researchersCount: 10000,
    publicationsCount: 500,
    galleryVisible: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    api.get("/api/admin/statistics")
      .then((data) => setStats(data))
      .catch(() => showToast("Failed to load statistics", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setStats((prev) => ({ ...prev, [name]: checked }));
    } else {
      const val = parseInt(value, 10);
      setStats((prev) => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/statistics", stats);
      showToast("Settings and statistics updated successfully!");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { name: "conferencesCount", label: "Conferences Hosted", icon: "🎤", hint: "Total number of international conferences organized" },
    { name: "countriesCount", label: "Countries Represented", icon: "🌍", hint: "Number of countries from which attendees participate" },
    { name: "researchersCount", label: "Researchers Connected", icon: "👩‍🔬", hint: "Total researchers and attendees connected globally" },
    { name: "publicationsCount", label: "Publications Indexed", icon: "📚", hint: "Papers published and indexed in journals" },
  ];

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header">
        <div>
          <h1>Statistics Management</h1>
          <p>Update the homepage statistics strip. Changes are live immediately.</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading statistics...</div>
      ) : (
        <form onSubmit={handleSave} className="stats-form-card">
          <div className="stats-edit-grid">
            {FIELDS.map((f) => (
              <div className="stats-edit-item" key={f.name}>
                <div className="stats-edit-icon">{f.icon}</div>
                <div className="stats-edit-body">
                  <label htmlFor={f.name}>{f.label}</label>
                  <input
                    id={f.name}
                    type="number"
                    name={f.name}
                    value={stats[f.name] ?? 0}
                    onChange={handleChange}
                    min={0}
                    required
                  />
                  <p className="hint">{f.hint}</p>
                </div>
                <div className="stats-preview-val">
                  {(stats[f.name] ?? 0).toLocaleString()}+
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "32px", padding: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>⚙️ Homepage Configurations</h3>
            <p className="hint" style={{ marginBottom: "20px" }}>Toggle section visibility on the landing landing homepage.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Large Congress Gallery Section</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>Show or hide the visual timeline gallery section on the landing homepage.</p>
              </div>
              <label style={{ position: "relative", display: "inline-block", width: "48px", height: "24px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="galleryVisible"
                  checked={stats.galleryVisible ?? true}
                  onChange={handleChange}
                  style={{ opacity: 0, width: 0, height: 0, margin: 0 }}
                />
                <span style={{
                  position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: (stats.galleryVisible ?? true) ? "#22c55e" : "#cbd5e1",
                  transition: "0.3s", borderRadius: "24px"
                }}>
                  <span style={{
                    position: "absolute", content: '""', height: "18px", width: "18px", left: "3px", bottom: "3px",
                    backgroundColor: "white", transition: "0.3s", borderRadius: "50%",
                    transform: (stats.galleryVisible ?? true) ? "translateX(24px)" : "translateX(0)"
                  }} />
                </span>
              </label>
            </div>
          </div>

          <div className="stats-form-footer" style={{ marginTop: "24px" }}>
            <p className="hint">These settings and numbers are updated live on the homepage immediately upon saving.</p>
            <button type="submit" className="btn-admin-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StatisticsManagement;
