import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SponsorManager = () => {
  const { activeConferenceId } = useAdmin();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    sponsorName: "", description: "", tier: "SILVER"
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchSponsors();
  }, [activeConferenceId]);

  const fetchSponsors = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/sponsors${qs}`);
      setSponsors(data || []);
    } catch (err) {
      setError("Failed to fetch sponsors.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sponsor = null) => {
    setEditingSponsor(sponsor);
    if (sponsor) {
      setFormData({
        sponsorName: sponsor.sponsorName || "",
        description: sponsor.description || "",
        tier: sponsor.tier || "SILVER"
      });
    } else {
      setFormData({ sponsorName: "", description: "", tier: "SILVER" });
    }
    setImageFile(null);
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

      let savedSponsor;
      if (editingSponsor) {
        savedSponsor = await api.put(`/api/admin/sponsors/${editingSponsor.id}`, payload);
        setSuccess("Sponsor updated successfully!");
      } else {
        savedSponsor = await api.post("/api/admin/sponsors", payload);
        setSuccess("Sponsor created successfully!");
      }

      if (imageFile && savedSponsor.id) {
        const fileData = new FormData();
        fileData.append("file", imageFile);
        await api.postMultipart(`/api/admin/sponsors/${savedSponsor.id}/image`, fileData);
      }

      setShowModal(false);
      fetchSponsors();
    } catch (err) {
      setError("Failed to save sponsor details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/sponsors/${id}`);
      setSuccess("Sponsor deleted successfully.");
      fetchSponsors();
    } catch (err) {
      setError("Failed to delete sponsor.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(s => 
    s.sponsorName?.toLowerCase().includes(search.toLowerCase()) ||
    s.tier?.toLowerCase().includes(search.toLowerCase())
  );

  const getTierColor = (tier) => {
    switch (tier) {
      case 'PLATINUM': return { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'GOLD': return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'SILVER': return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
      case 'BRONZE': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'PARTNER': return { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Sponsors & Partners</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage corporate sponsors, partners, tier levels and their logo displays.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search sponsors..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '240px', margin: 0}}
          />
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Sponsor
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && sponsors.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading sponsors...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Logo</th>
                  <th>Sponsor Name</th>
                  <th>Tier Level</th>
                  <th>Description</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSponsors.map(s => {
                  const colors = getTierColor(s.tier);
                  return (
                    <tr key={s.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '16px 24px'}}>
                        <div style={{
                          width: '100px', height: '50px', background: '#f8fafc',
                          border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {s.image?.fileName ? (
                            <img 
                              src={`${BASE_URL}/uploads/sponsors/${s.image.fileName}`} 
                              alt={s.sponsorName}
                              style={{maxWidth: '90%', maxHeight: '90%', objectFit: 'contain'}}
                            />
                          ) : (
                            <span style={{color: '#94a3b8', fontSize: '11px', fontWeight: '600'}}>NO LOGO</span>
                          )}
                        </div>
                      </td>
                      <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{s.sponsorName}</td>
                      <td>
                        <span style={{
                          background: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                        }}>
                          {s.tier}
                        </span>
                      </td>
                      <td style={{fontSize: '13px', color: '#64748b', maxStyle: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        {s.description || 'No description'}
                      </td>
                      <td style={{padding: '16px 24px'}}>
                        <button className="btn-action-edit" onClick={() => handleOpenModal(s)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSponsors.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No sponsors added for this conference yet.
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
            background: '#fff', borderRadius: '16px', width: '550px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingSponsor ? "Edit Sponsor" : "Add New Sponsor"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <form id="sponsorForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Sponsor Name <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. Acme Corp" value={formData.sponsorName} onChange={e => setFormData({...formData, sponsorName: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Tier Level <span style={{color: '#ef4444'}}>*</span></label>
                    <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="PLATINUM">Platinum</option>
                      <option value="GOLD">Gold</option>
                      <option value="SILVER">Silver</option>
                      <option value="BRONZE">Bronze</option>
                      <option value="PARTNER">Partner</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Brief Description</label>
                  <textarea rows="3" placeholder="Sponsor services, booth number..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Logo Image</label>
                  <div style={{border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc'}}>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{width: '100%', fontSize: '14px', color: '#64748b'}} />
                  </div>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="sponsorForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Sponsor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorManager;
