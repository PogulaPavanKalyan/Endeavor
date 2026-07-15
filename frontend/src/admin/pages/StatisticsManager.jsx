import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const StatisticsManager = () => {
  const [stats, setStats] = useState({
    conferencesCount: 0,
    countriesCount: 0,
    researchersCount: 0,
    publicationsCount: 0,
    galleryVisible: true,
    pastCongressVisible: true,
    webinarsVisible: true
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
          publicationsCount: data.publicationsCount || 0,
          galleryVisible: data.galleryVisible !== false,
          pastCongressVisible: data.pastCongressVisible !== false,
          webinarsVisible: data.webinarsVisible !== false
        });
      }
    } catch (err) {
      setError("Failed to fetch platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setStats({ ...stats, [name]: checked });
    } else {
      setStats({ ...stats, [name]: parseInt(value) || 0 });
    }
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

        {/* Gallery Section Visibility Toggle — Premium UI */}
        <div style={{
          marginTop: '28px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px'
            }}>⚙️</div>
            <div>
              <div style={{color: '#fff', fontWeight: '700', fontSize: '15px'}}>Homepage Section Visibility</div>
              <div style={{color: '#94a3b8', fontSize: '12px', marginTop: '2px'}}>Control which sections appear on the public landing page</div>
            </div>
          </div>

          {/* Toggle Row */}
          <div style={{background: '#fff', padding: '0'}}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              gap: '16px'
            }}>
              {/* Left: Icon + Info */}
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <div style={{
                  width: '44px', height: '44px',
                  background: stats.galleryVisible
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                    : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                  transition: 'background 0.4s ease',
                  flexShrink: 0
                }}>🖼️</div>
                <div>
                  <div style={{fontWeight: '700', fontSize: '14px', color: '#0f172a'}}>Photo Gallery Section</div>
                  <div style={{fontSize: '12px', color: '#64748b', marginTop: '3px'}}>
                    Visual timeline gallery on the main landing homepage
                  </div>
                  {/* Status Pill */}
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginTop: '6px',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    background: stats.galleryVisible ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)',
                    color: stats.galleryVisible ? '#16a34a' : '#64748b',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%',
                      background: stats.galleryVisible ? '#22c55e' : '#94a3b8',
                      display: 'inline-block'
                    }} />
                    {stats.galleryVisible ? 'VISIBLE TO PUBLIC' : 'HIDDEN FROM PUBLIC'}
                  </div>
                </div>
              </div>

              {/* Right: Toggle Switch */}
              <label style={{position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer', flexShrink: 0}}>
                <input
                  type="checkbox"
                  name="galleryVisible"
                  checked={stats.galleryVisible}
                  onChange={handleChange}
                  style={{opacity: 0, width: 0, height: 0, position: 'absolute'}}
                />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: stats.galleryVisible
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : '#cbd5e1',
                  borderRadius: '30px',
                  transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: stats.galleryVisible ? '0 2px 8px rgba(34,197,94,0.4)' : 'none'
                }}>
                  <span style={{
                    position: 'absolute',
                    height: '22px', width: '22px',
                    left: '4px', top: '4px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    transform: stats.galleryVisible ? 'translateX(26px)' : 'translateX(0)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
                  }} />
                </span>
              </label>
            </div>

            {/* Past Congress Editions Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              gap: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <div style={{
                  width: '44px', height: '44px',
                  background: stats.pastCongressVisible
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                    : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                  transition: 'background 0.4s ease',
                  flexShrink: 0
                }}>🏛️</div>
                <div>
                  <div style={{fontWeight: '700', fontSize: '14px', color: '#0f172a'}}>Past Congress Editions Section</div>
                  <div style={{fontSize: '12px', color: '#64748b', marginTop: '3px'}}>
                    Review our global academic reach and symposium volumes
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', padding: '3px 10px',
                    borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em',
                    background: stats.pastCongressVisible ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)',
                    color: stats.pastCongressVisible ? '#16a34a' : '#64748b', transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: stats.pastCongressVisible ? '#22c55e' : '#94a3b8', display: 'inline-block'
                    }} />
                    {stats.pastCongressVisible ? 'VISIBLE TO PUBLIC' : 'HIDDEN FROM PUBLIC'}
                  </div>
                </div>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer', flexShrink: 0}}>
                <input
                  type="checkbox"
                  name="pastCongressVisible"
                  checked={stats.pastCongressVisible}
                  onChange={handleChange}
                  style={{opacity: 0, width: 0, height: 0, position: 'absolute'}}
                />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: stats.pastCongressVisible ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#cbd5e1',
                  borderRadius: '30px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: stats.pastCongressVisible ? '0 2px 8px rgba(34,197,94,0.4)' : 'none'
                }}>
                  <span style={{
                    position: 'absolute', height: '22px', width: '22px', left: '4px', top: '4px',
                    background: '#ffffff', borderRadius: '50%', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    transform: stats.pastCongressVisible ? 'translateX(26px)' : 'translateX(0)', boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
                  }} />
                </span>
              </label>
            </div>

            {/* Webinars Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              gap: '16px'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
                <div style={{
                  width: '44px', height: '44px',
                  background: stats.webinarsVisible
                    ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
                    : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px',
                  transition: 'background 0.4s ease',
                  flexShrink: 0
                }}>💻</div>
                <div>
                  <div style={{fontWeight: '700', fontSize: '14px', color: '#0f172a'}}>Virtual Lectures & Webinars Section</div>
                  <div style={{fontSize: '12px', color: '#64748b', marginTop: '3px'}}>
                    Join online expert-led research discussions
                  </div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', padding: '3px 10px',
                    borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.04em',
                    background: stats.webinarsVisible ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)',
                    color: stats.webinarsVisible ? '#16a34a' : '#64748b', transition: 'all 0.3s ease'
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: stats.webinarsVisible ? '#22c55e' : '#94a3b8', display: 'inline-block'
                    }} />
                    {stats.webinarsVisible ? 'VISIBLE TO PUBLIC' : 'HIDDEN FROM PUBLIC'}
                  </div>
                </div>
              </div>
              <label style={{position: 'relative', display: 'inline-block', width: '56px', height: '30px', cursor: 'pointer', flexShrink: 0}}>
                <input
                  type="checkbox"
                  name="webinarsVisible"
                  checked={stats.webinarsVisible}
                  onChange={handleChange}
                  style={{opacity: 0, width: 0, height: 0, position: 'absolute'}}
                />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: stats.webinarsVisible ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#cbd5e1',
                  borderRadius: '30px', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: stats.webinarsVisible ? '0 2px 8px rgba(34,197,94,0.4)' : 'none'
                }}>
                  <span style={{
                    position: 'absolute', height: '22px', width: '22px', left: '4px', top: '4px',
                    background: '#ffffff', borderRadius: '50%', transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    transform: stats.webinarsVisible ? 'translateX(26px)' : 'translateX(0)', boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
                  }} />
                </span>
              </label>
            </div>


            {/* Save Button Footer */}
            <div style={{padding: '16px 24px', background: '#f8fafc'}}>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: saving
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em',
                  boxShadow: saving ? 'none' : '0 4px 14px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Section Visibility'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsManager;
