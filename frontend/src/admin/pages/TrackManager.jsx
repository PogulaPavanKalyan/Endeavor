import React, { useState, useEffect, useRef } from 'react';
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
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    detailedDescription: "",
    trackIcon: "",
    trackBannerImage: "",
    keywords: "",
    isFeatured: false,
    isEnabled: true,
    displayOrder: 0
  });

  const [iconFile, setIconFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

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
    setIconFile(null);
    setBannerFile(null);
    
    if (track) {
      setFormData({
        name: track.name || "",
        shortDescription: track.shortDescription || "",
        detailedDescription: track.detailedDescription || "",
        trackIcon: track.trackIcon || "",
        trackBannerImage: track.trackBannerImage || "",
        keywords: track.keywords || "",
        isFeatured: track.isFeatured || false,
        isEnabled: track.isEnabled !== false,
        displayOrder: track.displayOrder || 0
      });
    } else {
      setFormData({
        name: "",
        shortDescription: "",
        detailedDescription: "",
        trackIcon: "",
        trackBannerImage: "",
        keywords: "",
        isFeatured: false,
        isEnabled: true,
        displayOrder: tracks.length + 1
      });
    }
    setShowModal(true);
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch('/api/admin/tracks/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      return data.path;
    } catch (err) {
      console.error("Upload failed", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let iconPath = formData.trackIcon;
      let bannerPath = formData.trackBannerImage;

      if (iconFile) {
        const uploadedIcon = await handleFileUpload(iconFile);
        if (uploadedIcon) iconPath = uploadedIcon;
      }
      if (bannerFile) {
        const uploadedBanner = await handleFileUpload(bannerFile);
        if (uploadedBanner) bannerPath = uploadedBanner;
      }

      const payload = { 
        ...formData, 
        trackIcon: iconPath,
        trackBannerImage: bannerPath,
        conferenceId: parseInt(activeConferenceId) 
      };
      
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
    if (!window.confirm("Are you sure you want to delete this track?")) return;
    setLoading(true);
    setError("");
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
    
    // Swap display order numbers
    const tempOrder = newTracks[index].displayOrder;
    newTracks[index].displayOrder = newTracks[swapIndex].displayOrder;
    newTracks[swapIndex].displayOrder = tempOrder;

    const temp = newTracks[index];
    newTracks[index] = newTracks[swapIndex];
    newTracks[swapIndex] = temp;

    setTracks(newTracks);

    try {
      const trackIds = newTracks.map(t => t.id);
      await api.put('/api/admin/tracks/reorder', trackIds);
    } catch (err) {
      setError("Failed to save track order.");
      fetchTracks(); 
    }
  };

  const handleToggleEnable = async (track) => {
    try {
      const payload = { ...track, isEnabled: !track.isEnabled };
      await api.put(`/api/admin/tracks/${track.id}`, payload);
      fetchTracks();
    } catch (err) {
      setError("Failed to update track status.");
    }
  };

  const handleBulkImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await fetch(`/api/admin/tracks/bulk-import?conferenceId=${activeConferenceId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      setSuccess("Tracks imported successfully!");
      fetchTracks();
    } catch (err) {
      setError("Failed to import CSV.");
    } finally {
      setUploading(false);
      setBulkFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredTracks = tracks.filter(t => 
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.keywords?.toLowerCase().includes(search.toLowerCase())
  );

  if (!activeConferenceId) {
    return <div className="admin-page"><div className="admin-card" style={{padding: '40px', textAlign: 'center'}}>Please select a conference to manage tracks.</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Tracks Management</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage tracks, featured sessions, and bulk import CSV lists.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search tracks or keywords..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '260px', margin: 0}}
          />
          <div className="bulk-import-wrapper" style={{position: 'relative'}}>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef}
              onChange={handleBulkImport} 
              style={{position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer'}} 
              title="Upload CSV (Title, Short Desc, Detailed Desc, Keywords, isFeatured)"
            />
            <button className="btn-admin-secondary" disabled={uploading}>
              {uploading ? "Importing..." : "📥 Bulk Import CSV"}
            </button>
          </div>
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
                  <th style={{width: '60px'}}>Icon</th>
                  <th>Track Name</th>
                  <th>Keywords</th>
                  <th>Featured</th>
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
                        >▲</button>
                        <button 
                          onClick={() => handleReorder(index, 'down')} 
                          disabled={index === tracks.length - 1}
                          style={{background: 'none', border: 'none', cursor: index === tracks.length - 1 ? 'not-allowed' : 'pointer', color: index === tracks.length - 1 ? '#cbd5e1' : '#64748b'}}
                        >▼</button>
                      </div>
                    </td>
                    <td>
                      {t.trackIcon ? (
                        <img src={t.trackIcon} alt="Icon" style={{width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px'}} />
                      ) : (
                        <div style={{width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px'}}>N/A</div>
                      )}
                    </td>
                    <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{t.name}</td>
                    <td style={{color: '#64748b', fontSize: '13px'}}>{t.keywords || "-"}</td>
                    <td>
                      {t.isFeatured ? <span style={{color: '#d97706', fontWeight: 'bold'}}>★ Featured</span> : <span style={{color: '#cbd5e1'}}>Normal</span>}
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleEnable(t)}
                        style={{
                          background: t.isEnabled ? '#dcfce7' : '#fee2e2',
                          color: t.isEnabled ? '#15803d' : '#b91c1c',
                          border: 'none', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        {t.isEnabled ? 'Active' : 'Hidden'}
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
                    <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No tracks found.
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
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, overflowY: 'auto'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '650px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', margin: 'auto', marginTop: '40px', marginBottom: '40px'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingTrack ? "Edit Track" : "Add New Track"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px', overflowY: 'auto', maxHeight: '70vh'}}>
              <form id="trackForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Track Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div style={{display: 'flex', gap: '24px', marginTop: '8px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500'}}>
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} style={{width: '16px', height: '16px'}} />
                    Mark as Featured Track
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500'}}>
                    <input type="checkbox" checked={formData.isEnabled} onChange={e => setFormData({...formData, isEnabled: e.target.checked})} style={{width: '16px', height: '16px'}} />
                    Enable Public Visibility
                  </label>
                </div>

              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="trackForm" disabled={loading} style={{padding: '10px 24px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer'}}>
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
