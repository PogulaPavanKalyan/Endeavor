import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const TrustBadgeManager = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [formData, setFormData] = useState({
    icon: "", title: "", description: "", displayOrder: 0, active: true
  });

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/admin/trust-badges");
      setBadges(data || []);
    } catch (err) {
      setError("Failed to fetch trust badges.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (badge = null) => {
    setEditingBadge(badge);
    if (badge) {
      setFormData({
        icon: badge.icon || "",
        title: badge.title || "",
        description: badge.description || "",
        displayOrder: badge.displayOrder || 0,
        active: badge.active !== false
      });
    } else {
      setFormData({ icon: "", title: "", description: "", displayOrder: 0, active: true });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingBadge) {
        await api.put(`/api/admin/trust-badges/${editingBadge.id}`, formData);
        setSuccess("Trust badge updated successfully!");
      } else {
        await api.post("/api/admin/trust-badges", formData);
        setSuccess("Trust badge created successfully!");
      }
      setShowModal(false);
      fetchBadges();
    } catch (err) {
      setError("Failed to save trust badge.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this trust badge?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/trust-badges/${id}`);
      setSuccess("Trust badge deleted successfully.");
      fetchBadges();
    } catch (err) {
      setError("Failed to delete trust badge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Trust Badges</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage the credibility highlights (e.g. Peer Reviewed, Open Access) displayed on the main footer/home.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
          + Add Trust Badge
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && badges.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading trust badges...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Icon</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {badges.map(badge => (
                  <tr key={badge.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px', fontSize: '24px'}}>{badge.icon}</td>
                    <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{badge.title}</td>
                    <td style={{fontSize: '13px', color: '#64748b', maxStyle: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {badge.description}
                    </td>
                    <td>{badge.displayOrder}</td>
                    <td>
                      <span style={{
                        background: badge.active ? '#dcfce7' : '#f1f5f9',
                        color: badge.active ? '#15803d' : '#475569',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                      }}>
                        {badge.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{padding: '16px 24px'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(badge)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(badge.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {badges.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No trust badges created yet.
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingBadge ? "Edit Trust Badge" : "Add Trust Badge"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <form id="badgeForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Icon Emoji/Symbol <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. 🎓 or 📝" value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Display Order</label>
                    <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Title <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" placeholder="e.g. Peer Reviewed Proceedings" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Description</label>
                  <textarea rows="3" placeholder="Brief explanatory text..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>

                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <input 
                    type="checkbox" 
                    id="badge-active"
                    checked={formData.active} 
                    onChange={e => setFormData({...formData, active: e.target.checked})} 
                  />
                  <label htmlFor="badge-active" style={{fontWeight: '600', fontSize: '13.5px', color: '#334155', cursor: 'pointer'}}>Is Badge Active?</label>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="badgeForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Badge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustBadgeManager;
