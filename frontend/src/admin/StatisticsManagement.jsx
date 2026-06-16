import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./AdminHome.css";

const StatisticsManagement = () => {
  const [stats, setStats] = useState({
    conferencesCount: 150,
    countriesCount: 50,
    researchersCount: 10000,
    publicationsCount: 500,
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
    const val = parseInt(e.target.value, 10);
    setStats({ ...stats, [e.target.name]: isNaN(val) ? 0 : val });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/admin/statistics", stats);
      showToast("Statistics updated successfully!");
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

          <div className="stats-form-footer">
            <p className="hint">These numbers appear on the homepage stats strip with animated counters.</p>
            <button type="submit" className="btn-admin-primary" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Statistics"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StatisticsManagement;
