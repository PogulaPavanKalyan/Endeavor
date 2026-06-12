import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const SessionManager = () => {
  const { activeConferenceId } = useAdmin();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    name: "", timeRange: "", type: "KEYNOTE", speakerName: "", affiliation: "", description: "", trackId: ""
  });
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    fetchSessions();
    fetchTracks();
  }, [activeConferenceId]);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/sessions${qs}`);
      setSessions(data || []);
    } catch (err) {
      setError("Failed to fetch scientific program sessions.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    if (!activeConferenceId) return;
    try {
      const data = await api.get(`/api/tracks?conferenceId=${activeConferenceId}`);
      setTracks(data || []);
    } catch (err) {
      console.error("Failed to fetch tracks", err);
    }
  };

  const handleOpenModal = (session = null) => {
    setEditingSession(session);
    if (session) {
      setFormData({
        name: session.name || "",
        timeRange: session.timeRange || "",
        type: session.type || "KEYNOTE",
        speakerName: session.speakerName || "",
        affiliation: session.affiliation || "",
        description: session.description || "",
        trackId: session.trackId || ""
      });
    } else {
      setFormData({ name: "", timeRange: "", type: "KEYNOTE", speakerName: "", affiliation: "", description: "", trackId: "" });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { ...formData };
      if (activeConferenceId) {
        payload.conferenceId = parseInt(activeConferenceId);
      }

      if (editingSession) {
        await api.put(`/api/admin/sessions/${editingSession.id}`, payload);
        setSuccess("Session updated successfully!");
      } else {
        await api.post("/api/admin/sessions", payload);
        setSuccess("Session created successfully!");
      }
      setShowModal(false);
      fetchSessions();
    } catch (err) {
      setError("Failed to save session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/sessions/${id}`);
      setSuccess("Session deleted successfully.");
      fetchSessions();
    } catch (err) {
      setError("Failed to delete session.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.speakerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Program Sessions</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage presentation sessions, timings, tracks, and speakers for the scientific program.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search sessions..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '240px', margin: 0}}
          />
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Session
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && sessions.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading program schedule...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Time & Type</th>
                  <th>Session Title</th>
                  <th>Speaker Details</th>
                  <th>Description</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map(s => (
                  <tr key={s.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px'}}>
                      <strong style={{color: '#0f172a', fontSize: '14px'}}>{s.timeRange}</strong>
                      <br />
                      <span style={{
                        background: s.type === 'KEYNOTE' ? '#dbeafe' : '#f1f5f9',
                        color: s.type === 'KEYNOTE' ? '#1d4ed8' : '#475569',
                        padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                        display: 'inline-block', marginTop: '4px'
                      }}>
                        {s.type}
                      </span>
                    </td>
                    <td style={{color: '#0f172a', fontWeight: '600'}}>{s.name}</td>
                    <td>
                      {s.speakerName ? (
                        <>
                          <strong style={{color: '#334155'}}>{s.speakerName}</strong>
                          {s.affiliation && <div style={{color: '#64748b', fontSize: '12px'}}>{s.affiliation}</div>}
                        </>
                      ) : (
                        <span style={{color: '#94a3b8', fontStyle: 'italic'}}>N/A</span>
                      )}
                    </td>
                    <td style={{fontSize: '13px', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {s.description || 'No description'}
                    </td>
                    <td style={{padding: '16px 24px'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(s)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredSessions.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No sessions scheduled yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingSession ? "Edit Session" : "Add New Session"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px', overflowY: 'auto'}}>
              <form id="sessionForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Time Range <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="09:00 AM - 09:30 AM" value={formData.timeRange} onChange={e => setFormData({...formData, timeRange: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Session Type <span style={{color: '#ef4444'}}>*</span></label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="KEYNOTE">Keynote Session</option>
                      <option value="ORAL">Oral Presentation</option>
                      <option value="POSTER">Poster Session</option>
                      <option value="PANEL">Panel Discussion</option>
                      <option value="BREAK">Break / Lunch</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Session Title <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. Nanomedicine Breakthroughs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Scientific Track</label>
                    <select value={formData.trackId} onChange={e => setFormData({...formData, trackId: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="">-- No Track --</option>
                      {tracks.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Speaker Name</label>
                    <input type="text" placeholder="Dr. John Smith" value={formData.speakerName} onChange={e => setFormData({...formData, speakerName: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Affiliation</label>
                    <input type="text" placeholder="Oxford University" value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Description</label>
                  <textarea rows="3" placeholder="Brief outline..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="sessionForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;
