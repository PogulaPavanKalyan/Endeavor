import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api, BASE_URL } from '../../utils/api';

const AboutManager = () => {
  const { confirmDialog, toast } = useAdminDialog();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'overview' | 'services' | 'whyChoose' | 'cta'

  // Section fields
  const [section, setSection] = useState({
    id: 1,
    heroBadge: 'Intelligence Evolved',
    heroTitle: 'About Intelevo Research',
    heroDescription: 'Intelevo Research brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking across 50+ countries worldwide.',
    heroBgImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2560&q=100',
    overviewLabel: 'Organization Overview',
    overviewTitle: 'Who We Are',
    overviewLead: 'Intelevo Research is a premier global institution dedicated to fostering academic excellence, high-impact research dissemination, and scientific discovery.',
    overviewBody: 'Our core focus is the design and execution of world-class double-blind peer-reviewed international conferences, specialized workshops, and scientific symposia.',
    overviewImage1: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    overviewImage2: 'https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&q=80',
    overviewBadgeIcon: '🏆',
    overviewBadgeTitle: 'Est. 2015',
    overviewBadgeText: '10+ Years of Excellence',
    statCountries: 50,
    ctaTitle: 'Join Our Global Research Community',
    ctaDesc: 'Submit your latest research, expand your scientific credentials, and network with leading academicians and industry professionals at our upcoming conferences.',
    ctaButton1Text: 'Explore Conferences',
    ctaButton1Link: '/conferences',
    ctaButton2Text: 'Contact Us',
    ctaButton2Link: '/contact',
  });

  // What We Do / Services
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: '🏛️',
    tag: '',
    displayOrder: 0,
    isActive: true,
  });

  // Why Choose Us
  const [whyChoose, setWhyChoose] = useState([]);
  const [editingWhyChoose, setEditingWhyChoose] = useState(null);
  const [showWhyChooseModal, setShowWhyChooseModal] = useState(false);
  const [whyChooseForm, setWhyChooseForm] = useState({
    title: '',
    description: '',
    icon: '🌐',
    displayOrder: 0,
  });

  // Image Upload State
  const [uploadingHeroBg, setUploadingHeroBg] = useState(false);
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
        if (data.whyChoose && Array.isArray(data.whyChoose)) {
          setWhyChoose(data.whyChoose);
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
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const saved = await api.put('/api/admin/about/section', section);
      setSection(prev => ({ ...prev, ...saved }));
      toast.success('✓ About Us settings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save About Us settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === 'heroBgImage') setUploadingHeroBg(true);
    else if (field === 'overviewImage1') setUploadingImg1(true);
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
      if (field === 'heroBgImage') setUploadingHeroBg(false);
      else if (field === 'overviewImage1') setUploadingImg1(false);
      else setUploadingImg2(false);
    }
  };

  // --- Services / What We Do CRUD ---
  const handleOpenServiceModal = (svc = null) => {
    setEditingService(svc);
    if (svc) {
      setServiceForm({
        title: svc.title || '',
        description: svc.description || '',
        icon: svc.icon || '🏛️',
        tag: svc.tag || '',
        displayOrder: svc.displayOrder || 0,
        isActive: svc.isActive !== undefined ? svc.isActive : true,
      });
    } else {
      setServiceForm({
        title: '',
        description: '',
        icon: '🏛️',
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
      toast.error('Title is required.');
      return;
    }
    try {
      if (editingService) {
        const updated = await api.put(`/api/admin/about/services/${editingService.id}`, serviceForm);
        setServices(prev => prev.map(s => s.id === editingService.id ? updated : s));
        toast.success('✓ Service card updated.');
      } else {
        const created = await api.post('/api/admin/about/services', serviceForm);
        setServices(prev => [...prev, created]);
        toast.success('✓ Service card added.');
      }
      setShowServiceModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save service card.');
    }
  };

  const handleDeleteService = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete Service Card',
      message: 'Are you sure you want to delete this activity card?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/about/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('✓ Service card deleted.');
    } catch (err) {
      toast.error('Failed to delete service card.');
    }
  };

  // --- Why Choose Us CRUD ---
  const handleOpenWhyChooseModal = (item = null) => {
    setEditingWhyChoose(item);
    if (item) {
      setWhyChooseForm({
        title: item.title || '',
        description: item.description || '',
        icon: item.icon || '🌐',
        displayOrder: item.displayOrder || 0,
      });
    } else {
      setWhyChooseForm({
        title: '',
        description: '',
        icon: '🌐',
        displayOrder: whyChoose.length + 1,
      });
    }
    setShowWhyChooseModal(true);
  };

  const handleSaveWhyChoose = async (e) => {
    e.preventDefault();
    if (!whyChooseForm.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    try {
      if (editingWhyChoose) {
        const updated = await api.put(`/api/admin/about/why-choose/${editingWhyChoose.id}`, whyChooseForm);
        setWhyChoose(prev => prev.map(w => w.id === editingWhyChoose.id ? updated : w));
        toast.success('✓ Value proposition updated.');
      } else {
        const created = await api.post('/api/admin/about/why-choose', whyChooseForm);
        setWhyChoose(prev => [...prev, created]);
        toast.success('✓ Value proposition added.');
      }
      setShowWhyChooseModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save value proposition.');
    }
  };

  const handleDeleteWhyChoose = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete Value Proposition',
      message: 'Are you sure you want to remove this item from the Why Choose Us section?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/about/why-choose/${id}`);
      setWhyChoose(prev => prev.filter(w => w.id !== id));
      toast.success('✓ Value proposition deleted.');
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏢 About Us Page Management</h1>
          <p className="admin-page-subtitle">
            Customize and manage all content on the dedicated About Us page (<code>/about</code>) including Hero banner, Who We Are, What We Do, Why Choose Us, and Call To Action.
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
          <button
            type="button"
            onClick={handleSaveSection}
            className="btn btn-primary"
            disabled={saving}
            style={{
              padding: '10px 24px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {saving ? 'Saving...' : '💾 Save Page Settings'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          className={`admin-tab-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
          style={{
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'hero' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'hero' ? '#2563eb' : '#64748b'
          }}
        >
          🌟 Hero & Banner
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'overview' ? '#2563eb' : '#64748b'
          }}
        >
          🏢 Who We Are
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
          style={{
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'services' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'services' ? '#2563eb' : '#64748b'
          }}
        >
          🎯 What We Do ({services.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'whyChoose' ? 'active' : ''}`}
          onClick={() => setActiveTab('whyChoose')}
          style={{
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'whyChoose' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'whyChoose' ? '#2563eb' : '#64748b'
          }}
        >
          💡 Why Choose Us ({whyChoose.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'cta' ? 'active' : ''}`}
          onClick={() => setActiveTab('cta')}
          style={{
            padding: '10px 18px',
            fontWeight: '600',
            fontSize: '14px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'cta' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'cta' ? '#2563eb' : '#64748b'
          }}
        >
          🚀 Bottom CTA
        </button>
      </div>

      {/* TAB 1: HERO & BANNER */}
      {activeTab === 'hero' && (
        <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>🌟 Hero Banner Settings</h3>
          
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Top Tag / Subtitle</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={section.heroBadge || ''}
              onChange={e => setSection({ ...section, heroBadge: e.target.value })}
              placeholder="Intelligence Evolved"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Main Title</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={section.heroTitle || ''}
              onChange={e => setSection({ ...section, heroTitle: e.target.value })}
              placeholder="About Intelevo Research"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Hero Description</label>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              value={section.heroDescription || ''}
              onChange={e => setSection({ ...section, heroDescription: e.target.value })}
              placeholder="Description displayed below the main heading..."
            />
          </div>

          <div className="admin-form-group">
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Background Image URL</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.heroBgImage || ''}
                onChange={e => setSection({ ...section, heroBgImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '10px 16px', borderRadius: '8px', fontSize: '13px' }}>
                {uploadingHeroBg ? 'Uploading...' : '📁 Upload'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'heroBgImage')} />
              </label>
            </div>
            {section.heroBgImage && (
              <div style={{ marginTop: '10px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={section.heroBgImage} alt="Hero Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WHO WE ARE (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>✍️ Text & Story</h3>
            
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Pill Tag</label>
              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.overviewLabel || ''}
                onChange={e => setSection({ ...section, overviewLabel: e.target.value })}
                placeholder="Organization Overview"
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Heading</label>
              <input
                type="text"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.overviewTitle || ''}
                onChange={e => setSection({ ...section, overviewTitle: e.target.value })}
                placeholder="Who We Are"
              />
            </div>

            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Primary Lead Paragraph</label>
              <textarea
                rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                value={section.overviewLead || ''}
                onChange={e => setSection({ ...section, overviewLead: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Secondary Body Paragraph</label>
              <textarea
                rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                value={section.overviewBody || ''}
                onChange={e => setSection({ ...section, overviewBody: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>📸 Feature Image</h3>
            
            <div className="admin-form-group" style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Primary Image</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={section.overviewImage1 || ''}
                  onChange={e => setSection({ ...section, overviewImage1: e.target.value })}
                />
                <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  {uploadingImg1 ? 'Uploading...' : '📁 Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'overviewImage1')} />
                </label>
              </div>
              {section.overviewImage1 && (
                <div style={{ marginTop: '10px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={section.overviewImage1} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT WE DO (SERVICES) */}
      {activeTab === 'services' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              These cards appear in the <strong>What We Do</strong> section on the About Us page and the dynamic 2×2 grid on the Homepage.
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
              + Add Card
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
          </div>
        </div>
      )}

      {/* TAB 4: WHY CHOOSE US */}
      {activeTab === 'whyChoose' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              These value proposition items appear in the <strong>Why Choose Us</strong> grid on the About Us page.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenWhyChooseModal()}
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
              + Add Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {whyChoose.map((item, idx) => (
              <div 
                key={item.id || idx}
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
                  <span style={{ fontSize: '28px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', display: 'inline-block', marginBottom: '12px' }}>
                    {item.icon || '🌟'}
                  </span>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenWhyChooseModal(item)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWhyChoose(item.id)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CALL TO ACTION */}
      {activeTab === 'cta' && (
        <div className="admin-card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>🚀 Call To Action Card</h3>
          
          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>CTA Heading</label>
            <input
              type="text"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              value={section.ctaTitle || ''}
              onChange={e => setSection({ ...section, ctaTitle: e.target.value })}
              placeholder="Join Our Global Research Community"
            />
          </div>

          <div className="admin-form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>CTA Description</label>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
              value={section.ctaDesc || ''}
              onChange={e => setSection({ ...section, ctaDesc: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 1 Label</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.ctaButton1Text || ''}
                onChange={e => setSection({ ...section, ctaButton1Text: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 1 Link</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.ctaButton1Link || ''}
                onChange={e => setSection({ ...section, ctaButton1Link: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 2 Label</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.ctaButton2Text || ''}
                onChange={e => setSection({ ...section, ctaButton2Text: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 2 Link</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={section.ctaButton2Link || ''}
                onChange={e => setSection({ ...section, ctaButton2Link: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="admin-modal-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
              {editingService ? '✏️ Edit Card' : '✨ Add Activity Card'}
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
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                />
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
                  {editingService ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Choose Us Modal */}
      {showWhyChooseModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="admin-modal-card" style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
              {editingWhyChoose ? '✏️ Edit Value Proposition' : '💡 Add Value Proposition'}
            </h3>

            <form onSubmit={handleSaveWhyChoose}>
              <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Icon</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '18px' }}
                    value={whyChooseForm.icon}
                    onChange={e => setWhyChooseForm({ ...whyChooseForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    value={whyChooseForm.title}
                    onChange={e => setWhyChooseForm({ ...whyChooseForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Description</label>
                <textarea
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                  value={whyChooseForm.description}
                  onChange={e => setWhyChooseForm({ ...whyChooseForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowWhyChooseModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  {editingWhyChoose ? 'Update' : 'Add'}
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
