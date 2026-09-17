import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api, BASE_URL } from '../../utils/api';
import RichTextEditor from '../components/RichTextEditor';

const ConferenceAboutManager = () => {
  const { activeConferenceId, refreshConferences } = useAdmin();
  const { toast } = useAdminDialog();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confDetails, setConfDetails] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    tittle: '',
    slug: '',
    description: '',
    startDate: '',
    endDate: '',
    venue: '',
    contactEmail: '',
    contactPhone: '',
    themePrimary: '#e74c3c',
    themePrimaryHover: '#c0392b',
    themeAccent: '#f39c12',
    showCommittee: true
  });

  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [aboutImagePreview, setAboutImagePreview] = useState('');

  useEffect(() => {
    if (activeConferenceId) {
      fetchConferenceDetails();
    }
  }, [activeConferenceId]);

  const fetchConferenceDetails = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/conference-details?id=${activeConferenceId}`);
      if (data) {
        setConfDetails(data);
        const titleVal = data.tittle || data.title || '';
        setFormData({
          title: titleVal,
          tittle: titleVal,
          slug: data.slug || '',
          description: data.description || '',
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          venue: data.venue || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          themePrimary: data.themePrimary || '#e74c3c',
          themePrimaryHover: data.themePrimaryHover || '#c0392b',
          themeAccent: data.themeAccent || '#f39c12',
          showCommittee: data.showCommittee !== false
        });

        if (data.aboutImage) {
          setAboutImagePreview(
            data.aboutImage.startsWith('http')
              ? data.aboutImage
              : `${BASE_URL}/uploads/conference/${data.aboutImage}`
          );
        } else {
          setAboutImagePreview('');
        }
      }
    } catch (err) {
      toast.error('Failed to load conference details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAboutImageFile(file);
      setAboutImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId || !confDetails) {
      toast.warning('Please select a valid conference.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...confDetails,
        ...formData,
        tittle: formData.title,
        title: formData.title
      };

      const saved = await api.post('/api/admin/conference-details', payload);

      if (aboutImageFile && saved.id) {
        const ad = new FormData();
        ad.append('file', aboutImageFile);
        await api.postMultipart(`/api/admin/conference-details/${saved.id}/about-image`, ad);
        setAboutImageFile(null);
      }

      toast.success('✓ Conference details & About Congress saved successfully!');
      if (refreshConferences) refreshConferences();
      fetchConferenceDetails();
    } catch (err) {
      toast.error('Failed to save conference details.');
    } finally {
      setSaving(false);
    }
  };

  if (!activeConferenceId) {
    return (
      <div className="admin-page">
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#64748b' }}>Please select a conference to edit its details.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card" style={{ textAlign: 'center', padding: '50px' }}>
          <p style={{ color: '#64748b' }}>Loading conference details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>About Congress & Conference Details</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Edit the conference title, About Congress section overview, imagery, dates, and venue information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Conference Title & Headline */}
        <div className="admin-card">
          <div className="dashboard-section-title" style={{ marginBottom: '16px' }}>
            🏷️ Conference Title & Headline
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
              Conference Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value, tittle: e.target.value })}
              placeholder="e.g. 5th International Conference on&#10;Renewable Energy & Sustainability"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '15px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
            <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              💡 Press <strong>Enter</strong> to create line breaks in the hero banner title.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                City / Venue Summary
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. London, United Kingdom"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* About the Congress Section */}
        <div className="admin-card">
          <div className="dashboard-section-title" style={{ marginBottom: '16px' }}>
            📖 About the Congress Content
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                About Congress Description (Multi-Paragraph & Formatting)
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                placeholder="Provide a thorough overview of the congress, mission, themes, and what delegates can expect..."
                minHeight="280px"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                About Congress Section Image
              </label>
              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer'
                }}
                onClick={() => document.getElementById('aboutImgFile').click()}
              >
                {aboutImagePreview ? (
                  <div>
                    <img
                      src={aboutImagePreview}
                      alt="About Congress Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '180px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        marginBottom: '10px'
                      }}
                    />
                    <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6', fontWeight: '600' }}>
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '32px' }}>📷</span>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b' }}>
                      Click to upload About Congress image
                    </p>
                  </div>
                )}
                <input
                  id="aboutImgFile"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Theme Branding */}
        <div className="admin-card">
          <div className="dashboard-section-title" style={{ marginBottom: '16px' }}>
            🎨 Contact & Branding Colors
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@intelevoresearch.com"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                Primary Theme Color
              </label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={formData.themePrimary}
                  onChange={(e) => setFormData({ ...formData, themePrimary: e.target.value })}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={formData.themePrimary}
                  onChange={(e) => setFormData({ ...formData, themePrimary: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={saving}
            className="btn-admin-primary"
            style={{ padding: '12px 36px', fontSize: '15px' }}
          >
            {saving ? 'Saving Details...' : 'Save Conference Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConferenceAboutManager;
