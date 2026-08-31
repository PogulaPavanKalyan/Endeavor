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
      // Ensure clean payload
      const payload = {
        ...section,
        id: 1,
        statCountries: Number(section.statCountries) || 50,
      };
      const saved = await api.put('/api/admin/about/section', payload);
      if (saved) {
        setSection(prev => ({ ...prev, ...saved }));
      }
      toast.success('✓ About Us settings saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings. Please try again.');
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
        toast.success('✓ Activity card updated.');
      } else {
        const created = await api.post('/api/admin/about/services', serviceForm);
        setServices(prev => [...prev, created]);
        toast.success('✓ Activity card added.');
      }
      setShowServiceModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save activity card.');
    }
  };

  const handleDeleteService = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete Activity Card',
      message: 'Are you sure you want to delete this activity card?',
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/about/services/${id}`);
      setServices(prev => prev.filter(s => s.id !== id));
      toast.success('✓ Activity card deleted.');
    } catch (err) {
      toast.error('Failed to delete card.');
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
    <div className="about-admin-wrapper" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Mobile Responsive Injected Styles */}
      <style>{`
        .about-admin-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .about-admin-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .about-tabs-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 8px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          scrollbar-width: none;
        }
        .about-tabs-scroll::-webkit-scrollbar {
          display: none;
        }
        .about-tab-item {
          flex-shrink: 0;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          border: 1px solid transparent;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .about-tab-item.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37,99,235,0.25);
        }
        .about-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }
        @media (max-width: 640px) {
          .about-admin-header {
            flex-direction: column;
            align-items: stretch;
          }
          .about-admin-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .about-form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="about-admin-header">
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
            🏢 About Us Page Management
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
            Customize dynamic content across the About Us page (<code>/about</code>) and the Homepage About section.
          </p>
        </div>
        <div className="about-admin-actions">
          <button 
            type="button" 
            onClick={fetchAboutData} 
            className="btn btn-outline"
            disabled={loading}
            style={{ padding: '9px 14px', fontSize: '13px', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1', background: '#fff' }}
          >
            {loading ? '...' : '🔄 Refresh'}
          </button>
          <button
            type="button"
            onClick={handleSaveSection}
            className="btn btn-primary"
            disabled={saving}
            style={{
              padding: '9px 18px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
            }}
          >
            {saving ? 'Saving...' : '💾 Save Page Settings'}
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Tabs Navigation (Mobile Responsive) */}
      <div className="about-tabs-scroll">
        <button
          className={`about-tab-item ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          🌟 Hero & Banner
        </button>
        <button
          className={`about-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          🏢 Who We Are
        </button>
        <button
          className={`about-tab-item ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🎯 What We Do ({services.length})
        </button>
        <button
          className={`about-tab-item ${activeTab === 'whyChoose' ? 'active' : ''}`}
          onClick={() => setActiveTab('whyChoose')}
        >
          💡 Why Choose Us ({whyChoose.length})
        </button>
        <button
          className={`about-tab-item ${activeTab === 'cta' ? 'active' : ''}`}
          onClick={() => setActiveTab('cta')}
        >
          🚀 Bottom CTA
        </button>
      </div>

      {/* TAB 1: HERO & BANNER */}
      {activeTab === 'hero' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>🌟 Hero Banner Settings</h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Top Tag / Subtitle</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              value={section.heroBadge || ''}
              onChange={e => setSection({ ...section, heroBadge: e.target.value })}
              placeholder="Intelligence Evolved"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Main Title</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              value={section.heroTitle || ''}
              onChange={e => setSection({ ...section, heroTitle: e.target.value })}
              placeholder="About Intelevo Research"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Hero Description</label>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
              value={section.heroDescription || ''}
              onChange={e => setSection({ ...section, heroDescription: e.target.value })}
              placeholder="Description displayed below the main heading..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Background Image URL</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.heroBgImage || ''}
                onChange={e => setSection({ ...section, heroBgImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
              />
              <label style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', background: '#f1f5f9', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                {uploadingHeroBg ? '...' : '📁 Upload'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'heroBgImage')} />
              </label>
            </div>
            {section.heroBgImage && (
              <div style={{ marginTop: '10px', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={section.heroBgImage} alt="Hero Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: WHO WE ARE (OVERVIEW) */}
      {activeTab === 'overview' && (
        <div className="about-form-grid">
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>✍️ Text & Story</h3>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Pill Tag</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.overviewLabel || ''}
                onChange={e => setSection({ ...section, overviewLabel: e.target.value })}
                placeholder="Organization Overview"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Heading</label>
              <input
                type="text"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.overviewTitle || ''}
                onChange={e => setSection({ ...section, overviewTitle: e.target.value })}
                placeholder="Who We Are"
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Primary Lead Paragraph</label>
              <textarea
                rows={3}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
                value={section.overviewLead || ''}
                onChange={e => setSection({ ...section, overviewLead: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Secondary Body Paragraph</label>
              <textarea
                rows={4}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
                value={section.overviewBody || ''}
                onChange={e => setSection({ ...section, overviewBody: e.target.value })}
              />
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>📸 Overview Photo & Badges</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Feature Image</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  value={section.overviewImage1 || ''}
                  onChange={e => setSection({ ...section, overviewImage1: e.target.value })}
                />
                <label style={{ cursor: 'pointer', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', background: '#f1f5f9', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                  {uploadingImg1 ? '...' : '📁 Upload'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'overviewImage1')} />
                </label>
              </div>
              {section.overviewImage1 && (
                <div style={{ marginTop: '10px', height: '110px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={section.overviewImage1} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Icon</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', boxSizing: 'border-box' }}
                  value={section.overviewBadgeIcon || '🏆'}
                  onChange={e => setSection({ ...section, overviewBadgeIcon: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Badge Title</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  value={section.overviewBadgeTitle || ''}
                  onChange={e => setSection({ ...section, overviewBadgeTitle: e.target.value })}
                  placeholder="Est. 2015"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Badge Text</label>
                <input
                  type="text"
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  value={section.overviewBadgeText || ''}
                  onChange={e => setSection({ ...section, overviewBadgeText: e.target.value })}
                  placeholder="10+ Years"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WHAT WE DO (SERVICES) */}
      {activeTab === 'services' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
              These cards appear in the <strong>What We Do</strong> section on the About Us page.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenServiceModal()}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Add Card
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {services.map((svc, idx) => (
              <div 
                key={svc.id || idx}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '24px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                      {svc.icon || '✨'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: svc.isActive !== false ? '#16a34a' : '#dc2626' }}>
                      {svc.isActive !== false ? '● ACTIVE' : '○ HIDDEN'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                    {svc.title}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.4' }}>
                    {svc.description}
                  </p>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenServiceModal(svc)}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteService(svc.id)}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px' }}>
              These value proposition items appear in the <strong>Why Choose Us</strong> section on the About Us page.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleOpenWhyChooseModal()}
              style={{
                padding: '8px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              + Add Item
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {whyChoose.map((item, idx) => (
              <div 
                key={item.id || idx}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <span style={{ fontSize: '24px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '10px' }}>
                    {item.icon || '🌟'}
                  </span>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                    {item.title}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.4' }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenWhyChooseModal(item)}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWhyChoose(item.id)}
                    style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
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
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>🚀 Call To Action Card</h3>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>CTA Heading</label>
            <input
              type="text"
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
              value={section.ctaTitle || ''}
              onChange={e => setSection({ ...section, ctaTitle: e.target.value })}
              placeholder="Join Our Global Research Community"
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>CTA Description</label>
            <textarea
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
              value={section.ctaDesc || ''}
              onChange={e => setSection({ ...section, ctaDesc: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 1 Label</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.ctaButton1Text || ''}
                onChange={e => setSection({ ...section, ctaButton1Text: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 1 Link</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.ctaButton1Link || ''}
                onChange={e => setSection({ ...section, ctaButton1Link: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 2 Label</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.ctaButton2Text || ''}
                onChange={e => setSection({ ...section, ctaButton2Text: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '13px' }}>Button 2 Link</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                value={section.ctaButton2Link || ''}
                onChange={e => setSection({ ...section, ctaButton2Link: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700' }}>
              {editingService ? '✏️ Edit Activity Card' : '✨ Add Activity Card'}
            </h3>

            <form onSubmit={handleSaveService}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Icon</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px', boxSizing: 'border-box' }}
                    value={serviceForm.icon}
                    onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={serviceForm.title}
                    onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Description</label>
                <textarea
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '700' }}>
              {editingWhyChoose ? '✏️ Edit Value Proposition' : '💡 Add Value Proposition'}
            </h3>

            <form onSubmit={handleSaveWhyChoose}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Icon</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px', boxSizing: 'border-box' }}
                    value={whyChooseForm.icon}
                    onChange={e => setWhyChooseForm({ ...whyChooseForm, icon: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Title</label>
                  <input
                    type="text"
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={whyChooseForm.title}
                    onChange={e => setWhyChooseForm({ ...whyChooseForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '6px', fontSize: '12px' }}>Description</label>
                <textarea
                  rows={3}
                  required
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical', boxSizing: 'border-box' }}
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
