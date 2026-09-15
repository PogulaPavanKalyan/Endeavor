import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SponsorManager = () => {
  const { confirmDialog, toast } = useAdminDialog();
  const { activeConferenceId } = useAdmin();

  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [formData, setFormData] = useState({
    sponsorName: '',
    description: '',
    tier: 'SILVER',
    websiteUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (activeConferenceId) {
      fetchSponsors();
    } else {
      setSponsors([]);
    }
  }, [activeConferenceId]);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const url = activeConferenceId ? `/api/sponsors?conferenceId=${activeConferenceId}` : '/api/sponsors';
      const data = await api.get(url);
      setSponsors(data || []);
    } catch (err) {
      toast.error('Failed to fetch sponsors.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sponsor = null) => {
    setEditingSponsor(sponsor);
    if (sponsor) {
      setFormData({
        sponsorName: sponsor.sponsorName || '',
        description: sponsor.description || '',
        tier: sponsor.tier || 'SILVER',
        websiteUrl: sponsor.websiteUrl || ''
      });
      if (sponsor.image?.filePath && sponsor.image.filePath.startsWith('http')) {
        setImagePreview(sponsor.image.filePath);
      } else if (sponsor.image?.fileName) {
        setImagePreview(`${BASE_URL}/uploads/sponsors/${sponsor.image.fileName}`);
      } else {
        setImagePreview('');
      }
    } else {
      setFormData({
        sponsorName: '',
        description: '',
        tier: 'SILVER',
        websiteUrl: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      toast.warning('Please select a conference first.');
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        conferenceId: parseInt(activeConferenceId)
      };

      let savedSponsor;
      if (editingSponsor) {
        savedSponsor = await api.put(`/api/admin/sponsors/${editingSponsor.id}`, payload);
        toast.success('✓ Sponsor updated successfully!');
      } else {
        savedSponsor = await api.post('/api/admin/sponsors', payload);
        toast.success('✓ Sponsor added successfully!');
      }

      if (imageFile && savedSponsor && savedSponsor.id) {
        const fileData = new FormData();
        fileData.append('file', imageFile);
        await api.postMultipart(`/api/admin/sponsors/${savedSponsor.id}/image`, fileData);
      }

      setShowModal(false);
      fetchSponsors();
    } catch (err) {
      toast.error('Failed to save sponsor details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Are you sure you want to delete this sponsor?', 'Delete Sponsor'))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/sponsors/${id}`);
      toast.success('✓ Sponsor deleted successfully!');
      fetchSponsors();
    } catch (err) {
      toast.error('Failed to delete sponsor.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter(s =>
    s.sponsorName?.toLowerCase().includes(search.toLowerCase()) ||
    s.tier?.toLowerCase().includes(search.toLowerCase())
  );

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'PLATINUM':
        return { label: 'Platinum Sponsor', bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' };
      case 'GOLD':
        return { label: 'Gold Sponsor', bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'SILVER':
        return { label: 'Silver Sponsor', bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
      case 'BRONZE':
        return { label: 'Bronze Sponsor', bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'MEDIA_PARTNER':
        return { label: 'Media Partner', bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' };
      case 'EXHIBITOR':
        return { label: 'Exhibitor', bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' };
      case 'PARTNER':
      default:
        return { label: 'Academic / Institutional Partner', bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' };
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Sponsors & Media Partners</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage corporate sponsors, official media partners, exhibitors, and institutional collaborators.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search sponsors or partners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-form-input"
            style={{ width: '240px', margin: 0 }}
          />
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Sponsor / Partner
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && sponsors.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading sponsors & media partners...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px 24px', width: '120px' }}>Logo</th>
                  <th>Partner / Sponsor Name</th>
                  <th>Tier Category</th>
                  <th>Description</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSponsors.map(s => {
                  const badge = getTierBadge(s.tier);
                  const logoSrc = (s.image?.filePath && s.image.filePath.startsWith('http'))
                    ? s.image.filePath
                    : (s.image?.fileName
                        ? `${BASE_URL}/uploads/sponsors/${s.image.fileName}`
                        : null);

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{
                          width: '100px', height: '50px', background: '#f8fafc',
                          border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {logoSrc ? (
                            <img
                              src={logoSrc}
                              alt={s.sponsorName}
                              style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>NO LOGO</span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px' }}>
                        {s.sponsorName}
                      </td>
                      <td>
                        <span style={{
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: '#64748b', maxWidth: '300px' }}>
                        {s.description || 'No description'}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => handleOpenModal(s)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDelete(s.id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSponsors.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No sponsors or media partners added for this conference yet.
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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                {editingSponsor ? 'Edit Sponsor / Media Partner' : 'Add Sponsor / Media Partner'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form id="sponsorForm" onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                    Organization / Company Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Springer Nature / BioTech Media"
                    value={formData.sponsorName}
                    onChange={e => setFormData({ ...formData, sponsorName: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                    Tier / Category <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={formData.tier}
                    onChange={e => setFormData({ ...formData, tier: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
                  >
                    <option value="MEDIA_PARTNER">📰 Media Partner</option>
                    <option value="PLATINUM">💎 Platinum Sponsor</option>
                    <option value="GOLD">🥇 Gold Sponsor</option>
                    <option value="SILVER">🥈 Silver Sponsor</option>
                    <option value="BRONZE">🥉 Bronze Sponsor</option>
                    <option value="EXHIBITOR">🎪 Exhibitor</option>
                    <option value="PARTNER">🤝 Academic / Institutional Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                  Brief Description / Booth # / Journal
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Official open-access publication partner..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                  Partner / Sponsor Logo
                </label>
                <div style={{ border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
                  {imagePreview && (
                    <div style={{ marginBottom: '10px' }}>
                      <img src={imagePreview} alt="Logo Preview" style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    style={{ width: '100%', fontSize: '14px', color: '#64748b' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-admin-primary"
                  style={{ padding: '8px 24px' }}
                >
                  {loading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorManager;
