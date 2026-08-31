import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api, BASE_URL } from '../../utils/api';

const AboutManager = () => {
  const { confirmDialog, toast } = useAdminDialog();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('homepage'); // 'homepage' | 'pillars' | 'preview'

  // Section fields
  const [section, setSection] = useState({
    id: 1,
    overviewLabel: 'About Organization',
    overviewTitle: 'Empowering Global Scientific Discovery',
    overviewLead: 'Intelevo Research acts as a pivotal axis connecting international experts, ideas, and publication pathways across 50+ countries.',
    overviewBody: 'Intelevo Research brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking.',
    overviewImage1: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    overviewImage2: 'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&q=80',
    overviewBadgeIcon: '🏆',
    overviewBadgeTitle: 'Est. 2015',
    overviewBadgeText: '10+ Years of Excellence',
    statCountries: 50,
  });

  // Service Pillars
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: '👤',
    tag: '',
    displayOrder: 0,
    isActive: true,
  });

  // Image Upload State
  const [uploadingImg1, setUploadingImg1] = useState(false);
  const [uploadingImg2, setUploadingImg2] = useState(false);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/about');
      if (data) {
        if (data.section) {
          setSection(prev => ({ ...prev, ...data.section }));
        }
        if (data.services && Array.isArray(data.services)) {
          setServices(data.services);
        }
      }
    } catch (err) {
      console.error('Failed to load about data:', err);
      toast.error('Failed to load About Us details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/api/admin/about/section', section);
      setSection(saved);
      toast.success('✓ About Us section updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save About Us section.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const isField1 = field === 'overviewImage1';
    if (isField1) setUploadingImg1(true);
    else setUploadingImg2(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.postMultipart('/api/admin/about/upload', formData);
      const fullUrl = res.url?.startsWith('http') ? res.url : `${BASE_URL}${res.url}`;
      setSection(prev => ({ ...prev, [field]: fullUrl }));
      toast.success('✓ Image uploaded successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload image.');
    } finally {
      if (isField1) setUploadingImg1(false);
      else setUploadingImg2(false);
    }
  };

  // --- Pillars / Services CRUD ---
  const handleOpenServiceModal = (svc = null) => {
    setEditingService(svc);
    if (svc) {
      setServiceForm({
        title: svc.title || '',
        description: svc.description || '',
        icon: svc.icon || '✨',
        tag: svc.tag || '',
        displayOrder: svc.displayOrder || 0,
        isActive: svc.isActive !== undefined ? svc.isActive : true,
      });
    } else {
      setServiceForm({
        title: '',
        description: '',
        icon: '👤',
        tag: '',
        displayOrder: services.length + 1,
        isActive: true,
      });
    }
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      toast.error('Service title is required.');
      return;
    }
    try {
      if (editingService) {
        const updated = await api.put(`/api/admin/about/services/${editingService.id}`, serviceForm);
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
        toast.success('✓ Service pillar updated.');
      } else {
        const created = await api.post('/api/admin/about/services', serviceForm);
        setServices(prev => [...prev, created]);
        toast.success('✓ Service pillar added.');
      }
      setShowServiceModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save service pillar.');
    }
  };

  const handleDeleteService = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete Service Pillar',
      message: 'Are you sure you want to remove this highlight card from the Homepage About section?',
      confirmText: 'Delete Card',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/about/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('✓ Service pillar deleted.');
    } catch (err) {
      toast.error('Failed to delete service pillar.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏢 About Us & Homepage Section</h1>
          <p className="admin-page-subtitle">
            Manage the dynamic About Organization content, floating badge, statistics, and service highlight cards displayed on the Main Homepage and About Us page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={fetchAboutData} 
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'homepage' ? 'active' : ''}`}
          onClick={() => setActiveTab('homepage')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '15px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'homepage' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'homepage' ? '#2563eb' : '#64748b'
          }}
        >
          📄 Homepage Content & Media
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'pillars' ? 'active' : ''}`}
          onClick={() => setActiveTab('pillars')}
          style={{
            padding: '12px 20px',
            fontWeight: '600',
            fontSize: '15px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'pillars' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'pillars' ? '#2563eb' : '#64748b'
          }}
        >
          ✨ Service Highlights / Pillars ({services.length})
        </button>
      </div>

      {/* TAB 1: Homepage Content & Media */}
      {activeTab === 'homepage' && (
        <form onSubmit={handleSaveSection}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            
            {/* Left Card: Text Settings */}
            <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                ✍️ Headings & Description
              </h3>

              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Section Tag / Pill Label
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. About Organization"
                  value={section.overviewLabel || ''}
                  onChange={e => setSection({ ...section, overviewLabel: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Main Heading
                </label>
                <input
                  type="text"
                  className="admin-form-input"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="e.g. Empowering Global Scientific Discovery"
                  value={section.overviewTitle || ''}
                  onChange={e => setSection({ ...section, overviewTitle: e.target.value })}
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Lead Paragraph (Homepage Summary)
                </label>
                <textarea
                  rows={4}
                  className="admin-form-textarea"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  placeholder="Summary paragraph displayed beneath the heading..."
                  value={section.overviewLead || ''}
                  onChange={e => setSection({ ...section, overviewLead: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Detailed Description (Full Body)
                </label>
                <textarea
                  rows={4}
                  className="admin-form-textarea"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  placeholder="Detailed background and company context..."
                  value={section.overviewBody || ''}
                  onChange={e => setSection({ ...section, overviewBody: e.target.value })}
                />
              </div>
            </div>

            {/* Right Card: Media, Floating Badge & Stats */}
            <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a', fontWeight: '700' }}>
                📸 Images & Floating Badges
              </h3>

              {/* Main Image */}
              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Primary Photo (Main Conference Image)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="https://... or upload below"
                    value={section.overviewImage1 || ''}
                    onChange={e => setSection({ ...section, overviewImage1: e.target.value })}
                  />
                  <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    {uploadingImg1 ? 'Uploading...' : '📁 Upload'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'overviewImage1')} />
                  </label>
                </div>
                {section.overviewImage1 && (
                  <div style={{ marginTop: '8px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={section.overviewImage1} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Secondary Image */}
              <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                <label className="admin-form-label" style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>
                  Secondary Photo (Workshop / Networking)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="https://... or upload below"
                    value={section.overviewImage2 || ''}
                    onChange={e => setSection({ ...section, overviewImage2: e.target.value })}
                  />
                  <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    {uploadingImg2 ? 'Uploading...' : '📁 Upload'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'overviewImage2')} />
                  </label>
                </div>
                {section.overviewImage2 && (
                  <div style={{ marginTop: '8px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={section.overviewImage2} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Floating Badge & Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Icon</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px' }}
                    value={section.overviewBadgeIcon || '🏆'}
                    onChange={e => setSection({ ...section, overviewBadgeIcon: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Badge Title</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="Est. 2015"
                    value={section.overviewBadgeTitle || ''}
                    onChange={e => setSection({ ...section, overviewBadgeTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Badge Subtitle</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="10+ Years of Excellence"
                    value={section.overviewBadgeText || ''}
                    onChange={e => setSection({ ...section, overviewBadgeText: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Global Countries Count</label>
                <input
                  type="number"
                  className="admin-form-input"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  placeholder="50"
                  value={section.statCountries || 50}
                  onChange={e => setSection({ ...section, statCountries: parseInt(e.target.value) || 0 })}
                />
              </div>

            </div>
          </div>

          {/* Bottom Save Button Bar */}
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                padding: '12px 32px',
                fontSize: '15px',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
              }}
            >
              {saving ? 'Saving Changes...' : '💾 Save Homepage About Section'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Service Highlights / Pillars */}
      {activeTab === 'pillars' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              These 4 highlight cards appear in the 2×2 grid right beside the main About heading on the homepage.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenServiceModal()}
              style={{
                padding: '10px 20px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add Highlight Card
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {services.map((svc, idx) => (
              <div 
                key={svc.id || idx}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '28px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                      {svc.icon || '✨'}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: svc.isActive !== false ? '#16a34a' : '#dc2626' }}>
                      {svc.isActive !== false ? '● ACTIVE' : '○ HIDDEN'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                    {svc.title}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                    {svc.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenServiceModal(svc)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <p style={{ margin: '0 0 12px 0', color: '#64748b' }}>No custom highlight cards found. Default fallback cards will be displayed.</p>
                <button
                  type="button"
                  onClick={() => handleOpenServiceModal()}
                  style={{ padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  + Add First Highlight Card
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Pillar Modal */}
      {showServiceModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="admin-modal-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
              {editingService ? '✏️ Edit Highlight Card' : '✨ Add Highlight Card'}
            </h3>

            <form onSubmit={handleSaveService}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Icon</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px' }}
                    value={serviceForm.icon}
                    onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Card Title</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="e.g. Who We Are"
                    value={serviceForm.title}
                    onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Description</label>
                <textarea
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  placeholder="Short explanation displayed on the card..."
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={serviceForm.isActive}
                    onChange={e => setServiceForm({ ...serviceForm, isActive: e.target.checked })}
                  />
                  Active (Visible on Homepage)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingService ? 'Update Card' : 'Add Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutManager;
