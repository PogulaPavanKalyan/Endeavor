import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const StatisticsManager = () => {
  const [stats, setStats] = useState({
    conferencesCount: 0,
    countriesCount: 0,
    researchersCount: 0,
    publicationsCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/admin/statistics");
      if (data) {
        setStats({
          conferencesCount: data.conferencesCount || 0,
          countriesCount: data.countriesCount || 0,
          researchersCount: data.researchersCount || 0,
          publicationsCount: data.publicationsCount || 0
        });
      }
    } catch (err) {
      setError("Failed to fetch platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setStats({ ...stats, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/admin/statistics", stats);
      setSuccess("Statistics updated successfully!");
      fetchStats();
    } catch (err) {
      setError("Failed to update statistics.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Platform Statistics</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage live summary counts and impact metrics displayed on the main landing homepage.
          </p>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div style={{maxWidth: '600px'}}>
        <div className="admin-card">
          <div className="dashboard-section-title" style={{marginBottom: '20px'}}>📊 Update Live Counter Metrics</div>
          {loading ? (
            <p>Loading stats details...</p>
          ) : (
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Conferences Hosted</label>
                <input 
                  required 
                  type="number" 
                  name="conferencesCount"
                  value={stats.conferencesCount} 
                  onChange={handleChange}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Countries Represented</label>
                <input 
                  required 
                  type="number" 
                  name="countriesCount"
                  value={stats.countriesCount} 
                  onChange={handleChange}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Total Researchers & Attendees</label>
                <input 
                  required 
                  type="number" 
                  name="researchersCount"
                  value={stats.researchersCount} 
                  onChange={handleChange}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
                />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Published Articles & Proceedings</label>
                <input 
                  required 
                  type="number" 
                  name="publicationsCount"
                  value={stats.publicationsCount} 
                  onChange={handleChange}
                  style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
                />
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="btn-admin-primary" 
                style={{alignSelf: 'flex-start', padding: '10px 24px', marginTop: '10px'}}
              >
                {saving ? "Saving Changes..." : "Save Metrics"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsManager;
