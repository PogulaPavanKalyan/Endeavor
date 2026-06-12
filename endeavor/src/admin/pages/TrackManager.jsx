import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const TrackManager = () => {
  const { activeConferenceId } = useAdmin();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);
  const [formData, setFormData] = useState({ name: "", isEnabled: true, displayOrder: 0 });

  useEffect(() => {
    fetchTracks();
  }, [activeConferenceId]);

  const fetchTracks = async () => {
    if (!activeConferenceId) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/tracks?conferenceId=${activeConferenceId}`);
      setTracks(data || []);
    } catch (err) {
      setError("Failed to fetch scientific tracks.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (track = null) => {
    setEditingTrack(track);
    if (track) {
      setFormData({
        name: track.name || "",
        isEnabled: track.isEnabled !== false,
        displayOrder: track.displayOrder || 0
      });
    } else {
      setFormData({ name: "", isEnabled: true, displayOrder: tracks.length });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { ...formData, conferenceId: parseInt(activeConferenceId) };
      
      if (editingTrack) {
        await api.put(`/api/admin/tracks/${editingTrack.id}`, payload);
        setSuccess("Track updated successfully!");
      } else {
        await api.post("/api/admin/tracks", payload);
        setSuccess("Track created successfully!");
      }
      setShowModal(false);
      fetchTracks();
    } catch (err) {
      setError("Failed to save track.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this track? This will not delete the sessions associated with it, but they will lose their track reference.")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/tracks/${id}`);
      setSuccess("Track deleted successfully.");
      fetchTracks();
    } catch (err) {
      setError("Failed to delete track.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tracks.length - 1) return;

    const newTracks = [...tracks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const temp = newTracks[index];
    newTracks[index] = newTracks[swapIndex];
    newTracks[swapIndex] = temp;

    setTracks(newTracks);

    try {
      const trackIds = newTracks.map(t => t.id);
      await api.put('/api/admin/tracks/reorder', trackIds);
      setSuccess("Tracks reordered successfully.");
    } catch (err) {
      setError("Failed to save track order.");
      fetchTracks(); // Revert on failure
    }
  };

  const handleToggleEnable = async (track) => {
    try {
      const payload = { ...track, isEnabled: !track.isEnabled };
      await api.put(`/api/admin/tracks/${track.id}`, payload);
      setSuccess(`Track ${payload.isEnabled ? 'enabled' : 'disabled'}.`);
      fetchTracks();
    } catch (err) {
      setError("Failed to update track status.");
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (!activeConferenceId) {
    return <div className="admin-page"><div className="admin-card" style={{padding: '40px', textAlign: 'center'}}>Please select a conference to manage tracks.</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Tracks</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage tracks to group your scientific sessions and presentations.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search tracks..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '240px', margin: 0}}
          />
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Track
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && tracks.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading tracks...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{width: '80px', padding: '16px 24px'}}>Order</th>
                  <th>Track Name</th>
                  <th>Status</th>
                  <th style={{padding: '16px 24px', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((t, index) => (
                  <tr key={t.id} style={{borderBottom: '1px solid #e2e8f0', opacity: t.isEnabled ? 1 : 0.6}}>
                    <td style={{padding: '16px 24px'}}>
                      <div style={{display: 'flex', gap: '4px'}}>
                        <button 
                          onClick={() => handleReorder(index, 'up')} 
                          disabled={index === 0}
                          style={{background: 'none', border: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b'}}
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => handleReorder(index, 'down')} 
                          disabled={index === tracks.length - 1}
                          style={{background: 'none', border: 'none', cursor: index === tracks.length - 1 ? 'not-allowed' : 'pointer', color: index === tracks.length - 1 ? '#cbd5e1' : '#64748b'}}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{t.name}</td>
                    <td>
                      <button 
                        onClick={() => handleToggleEnable(t)}
                        style={{
                          background: t.isEnabled ? '#dcfce7' : '#fee2e2',
                          color: t.isEnabled ? '#15803d' : '#b91c1c',
                          border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        {t.isEnabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td style={{padding: '16px 24px', textAlign: 'right'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(t)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredTracks.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No tracks found. Create your first track!
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
            background: '#fff', borderRadius: '16px', width: '500px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingTrack ? "Edit Track" : "Add New Track"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <form id="trackForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Track Name <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" placeholder="e.g. Nanomedicine Breakthroughs" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>
                <div>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500'}}>
                    <input type="checkbox" checked={formData.isEnabled} onChange={e => setFormData({...formData, isEnabled: e.target.checked})} style={{width: '16px', height: '16px'}} />
                    Track is Enabled
                  </label>
                  <p style={{margin: '4px 0 0 24px', fontSize: '12px', color: '#64748b'}}>Disabled tracks will not appear on the public website.</p>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="trackForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Track"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackManager;
