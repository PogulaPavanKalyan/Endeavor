import React, { useState, useEffect } from 'react';
import { api, BASE_URL } from '../../utils/api';

const AboutUsManager = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // DB Data States
  const [section, setSection] = useState({});
  const [features, setFeatures] = useState([]);
  const [services, setServices] = useState([]);
  const [whyChoose, setWhyChoose] = useState([]);
  const [partners, setPartners] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [locations, setLocations] = useState([]);
  const [connections, setConnections] = useState([]);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "feature", "service", "whyChoose", "partner", "timeline", "leader", "location", "connection"
  const [editingItem, setEditingItem] = useState(null);
  const [modalFormData, setModalFormData] = useState({});
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/about");
      setSection(data.section || {});
      setFeatures(data.features || []);
      setServices(data.services || []);
      setWhyChoose(data.whyChoose || []);
      setPartners(data.partners || []);
      setMilestones(data.milestones || []);
      setLeaders(data.leaders || []);
      setLocations(data.locations || []);
      setConnections(data.connections || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch About Us configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updated = await api.put("/api/admin/about/section", section);
      setSection(updated);
      setSuccess("General section settings saved successfully!");
    } catch (err) {
      setError("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.postMultipart("/api/admin/about/upload", formData);
    return res.fileName;
  };

  const handleImageFieldUpload = async (field, file) => {
    if (!file) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const fileName = await handleFileUpload(file);
      const updatedSection = { ...section, [field]: fileName };
      const saved = await api.put("/api/admin/about/section", updatedSection);
      setSection(saved);
      setSuccess("Image uploaded and updated successfully!");
    } catch (err) {
      setError("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (pathOrName, fallback) => {
    if (!pathOrName) return fallback;
    if (pathOrName.startsWith("http://") || pathOrName.startsWith("https://")) {
      return pathOrName;
    }
    return `${BASE_URL}/uploads/about/${pathOrName}`;
  };

  // Reordering helpers
  const handleReorder = async (listType, list, index, direction) => {
    const newList = [...list];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;

    // Swap items
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    setLoading(true);
    try {
      const orderedIds = newList.map(item => item.id);
      await api.put(`/api/admin/about/${listType}/reorder`, orderedIds);
      setSuccess("Order updated successfully.");
      fetchData();
    } catch (err) {
      setError("Failed to update ordering.");
    } finally {
      setLoading(false);
    }
  };

  // CRUD Item Modal Operations
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setUploadFile(null);

    if (item) {
      setModalFormData({ ...item });
    } else {
      // Default forms
      if (type === "feature") setModalFormData({ title: "", description: "", displayOrder: features.length + 1 });
      else if (type === "service") setModalFormData({ title: "", description: "", icon: "🏛️", tag: "150+ Events", displayOrder: services.length + 1 });
      else if (type === "whyChoose") setModalFormData({ title: "", description: "", icon: "🌐", displayOrder: whyChoose.length + 1 });
      else if (type === "partner") setModalFormData({ name: "", logoFileName: "", displayOrder: partners.length + 1 });
      else if (type === "timeline") setModalFormData({ year: "", title: "", description: "", side: "left", displayOrder: milestones.length + 1 });
      else if (type === "leader") setModalFormData({ name: "", role: "", institution: "", country: "", emoji: "👩‍🔬", photoFileName: "", displayOrder: leaders.length + 1 });
      else if (type === "location") setModalFormData({ name: "", x: 500, y: 240, isOffice: false, officeTitle: "", officeAddress: "" });
      else if (type === "connection") setModalFormData({ startX: 180, startY: 150, controlX: 500, controlY: 100, endX: 680, endY: 230, opacity: 0.4, dashArray: "8 5" });
    }
    setShowModal(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let finalFormData = { ...modalFormData };

      // Handle custom file upload inside modal
      if (uploadFile) {
        const uploadedName = await handleFileUpload(uploadFile);
        if (modalType === "partner") finalFormData.logoFileName = uploadedName;
        else if (modalType === "leader") finalFormData.photoFileName = uploadedName;
      }

      let url = "";
      if (modalType === "feature") url = "/api/admin/about/features";
      else if (modalType === "service") url = "/api/admin/about/services";
      else if (modalType === "whyChoose") url = "/api/admin/about/why-choose";
      else if (modalType === "partner") url = "/api/admin/about/partners";
      else if (modalType === "timeline") url = "/api/admin/about/timeline";
      else if (modalType === "leader") url = "/api/admin/about/leaders";
      else if (modalType === "location") url = "/api/admin/about/locations";
      else if (modalType === "connection") url = "/api/admin/about/connections";

      if (editingItem) {
        await api.put(`${url}/${editingItem.id}`, finalFormData);
        setSuccess("Item updated successfully!");
      } else {
        await api.post(url, finalFormData);
        setSuccess("Item created successfully!");
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to save item details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    setError("");
    setSuccess("");

    let url = "";
    if (type === "feature") url = "/api/admin/about/features";
    else if (type === "service") url = "/api/admin/about/services";
    else if (type === "whyChoose") url = "/api/admin/about/why-choose";
    else if (type === "partner") url = "/api/admin/about/partners";
    else if (type === "timeline") url = "/api/admin/about/timeline";
    else if (type === "leader") url = "/api/admin/about/leaders";
    else if (type === "location") url = "/api/admin/about/locations";
    else if (type === "connection") url = "/api/admin/about/connections";

    try {
      await api.delete(`${url}/${id}`);
      setSuccess("Item deleted successfully.");
      fetchData();
    } catch (err) {
      setError("Failed to delete item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>About Us Page Manager</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Fully manage the dynamic, database-driven sections, lists, images, and maps on the About Us page.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => window.open("/about", "_blank")}>
          👁️ Preview Public Page
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{success}</div>}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: "hero", label: "Hero & CTA" },
          { id: "overview", label: "Overview & Mission" },
          { id: "services", label: "Services & Why Choose" },
          { id: "stats", label: "Statistics & Partners" },
          { id: "map", label: "Global Presence Map" },
          { id: "timeline", label: "Timeline & Board" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TABS CONTENT */}
      <div className="admin-card" style={{ padding: '24px' }}>

        {/* --- TAB 1: HERO & CTA --- */}
        {activeTab === "hero" && (
          <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', color: '#0f172a' }}>Hero Banner Content</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Hero Badge</label>
                <input type="text" value={section.heroBadge || ""} onChange={e => setSection({ ...section, heroBadge: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Hero Title (use newline for accent separation)</label>
                <textarea rows="2" value={section.heroTitle || ""} onChange={e => setSection({ ...section, heroTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Hero Description</label>
              <textarea rows="3" value={section.heroDescription || ""} onChange={e => setSection({ ...section, heroDescription: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Button 1 Text</label>
                <input type="text" value={section.heroCtaText1 || ""} onChange={e => setSection({ ...section, heroCtaText1: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Button 1 Link</label>
                <input type="text" value={section.heroCtaLink1 || ""} onChange={e => setSection({ ...section, heroCtaLink1: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Button 2 Text</label>
                <input type="text" value={section.heroCtaText2 || ""} onChange={e => setSection({ ...section, heroCtaText2: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Button 2 Link</label>
                <input type="text" value={section.heroCtaLink2 || ""} onChange={e => setSection({ ...section, heroCtaLink2: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Hero Background Image</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <img 
                  src={section.heroBgImage ? (section.heroBgImage.startsWith("http") ? section.heroBgImage : `${BASE_URL}/uploads/about/${section.heroBgImage}`) : "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format"} 
                  alt="Background Preview" 
                  style={{ width: '120px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                />
                <input type="file" accept="image/*" onChange={e => handleImageFieldUpload("heroBgImage", e.target.files[0])} />
              </div>
            </div>

            <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginTop: '20px', color: '#0f172a' }}>Join Community CTA (Bottom Section)</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Title</label>
                <input type="text" value={section.ctaTitle || ""} onChange={e => setSection({ ...section, ctaTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>CTA Description</label>
                <textarea rows="2" value={section.ctaDesc || ""} onChange={e => setSection({ ...section, ctaDesc: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Button 1 Text</label>
                <input type="text" value={section.ctaButton1Text || ""} onChange={e => setSection({ ...section, ctaButton1Text: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Button 1 Link</label>
                <input type="text" value={section.ctaButton1Link || ""} onChange={e => setSection({ ...section, ctaButton1Link: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Button 2 Text</label>
                <input type="text" value={section.ctaButton2Text || ""} onChange={e => setSection({ ...section, ctaButton2Text: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Button 2 Link</label>
                <input type="text" value={section.ctaButton2Link || ""} onChange={e => setSection({ ...section, ctaButton2Link: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>

            <button type="submit" className="btn-admin-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>Save Settings</button>
          </form>
        )}

        {/* --- TAB 2: OVERVIEW & MISSION --- */}
        {activeTab === "overview" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', color: '#0f172a' }}>Company Overview details</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Section Label</label>
                  <input type="text" value={section.overviewLabel || ""} onChange={e => setSection({ ...section, overviewLabel: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Section Title</label>
                  <input type="text" value={section.overviewTitle || ""} onChange={e => setSection({ ...section, overviewTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Overview Lead text</label>
                  <textarea rows="2" value={section.overviewLead || ""} onChange={e => setSection({ ...section, overviewLead: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Overview Body text</label>
                  <textarea rows="3" value={section.overviewBody || ""} onChange={e => setSection({ ...section, overviewBody: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              {/* Floating Badge */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Floating Badge Icon</label>
                  <input type="text" value={section.overviewBadgeIcon || ""} onChange={e => setSection({ ...section, overviewBadgeIcon: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Floating Badge Title</label>
                  <input type="text" value={section.overviewBadgeTitle || ""} onChange={e => setSection({ ...section, overviewBadgeTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Floating Badge Text</label>
                  <input type="text" value={section.overviewBadgeText || ""} onChange={e => setSection({ ...section, overviewBadgeText: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              {/* Images */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Overview Image 1 (Main)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <img src={getImageUrl(section.overviewImage1, "")} alt="Img 1" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    <input type="file" onChange={e => handleImageFieldUpload("overviewImage1", e.target.files[0])} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Overview Image 2 (Secondary)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <img src={getImageUrl(section.overviewImage2, "")} alt="Img 2" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    <input type="file" onChange={e => handleImageFieldUpload("overviewImage2", e.target.files[0])} />
                  </div>
                </div>
              </div>

              <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginTop: '20px', color: '#0f172a' }}>Mission & Vision Cards</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#E91E63', marginBottom: '12px' }}>🎯 Mission Card</h4>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Mission Title</label>
                  <input type="text" value={section.missionTitle || ""} onChange={e => setSection({ ...section, missionTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }} />
                  
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Mission Description</label>
                  <textarea rows="3" value={section.missionDesc || ""} onChange={e => setSection({ ...section, missionDesc: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }} />

                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Mission Points (one point per line)</label>
                  <textarea rows="3" value={section.missionPoints || ""} onChange={e => setSection({ ...section, missionPoints: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ flex: 1, minWidth: '280px', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#6366f1', marginBottom: '12px' }}>👁️ Vision Card</h4>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Vision Title</label>
                  <input type="text" value={section.visionTitle || ""} onChange={e => setSection({ ...section, visionTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }} />

                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Vision Description</label>
                  <textarea rows="3" value={section.visionDesc || ""} onChange={e => setSection({ ...section, visionDesc: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }} />

                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Vision Points (one point per line)</label>
                  <textarea rows="3" value={section.visionPoints || ""} onChange={e => setSection({ ...section, visionPoints: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <button type="submit" className="btn-admin-primary" style={{ alignSelf: 'flex-start', padding: '12px 24px' }}>Save Settings</button>
            </form>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Company Overview Checklist Features</h3>
                <button className="btn-admin-primary" onClick={() => openModal("feature")}>+ Add Feature</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Title</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{f.title}</td>
                      <td>{f.description}</td>
                      <td>
                        <button disabled={i === 0} onClick={() => handleReorder("features", features, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                        <button disabled={i === features.length - 1} onClick={() => handleReorder("features", features, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("feature", f)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("feature", f.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: SERVICES & WHY CHOOSE US --- */}
        {activeTab === "services" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Services Section (What We Do)</h3>
                <button className="btn-admin-primary" onClick={() => openModal("service")}>+ Add Service Card</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Icon</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Tag</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontSize: '20px' }}>{s.icon}</td>
                      <td style={{ fontWeight: '600' }}>{s.title}</td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{s.description}</td>
                      <td><span className="abt-what-tag" style={{ border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>{s.tag}</span></td>
                      <td>
                        <button disabled={i === 0} onClick={() => handleReorder("services", services, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                        <button disabled={i === services.length - 1} onClick={() => handleReorder("services", services, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("service", s)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("service", s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Why Choose Us Benefits</h3>
                <button className="btn-admin-primary" onClick={() => openModal("whyChoose")}>+ Add Benefit Card</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Icon</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {whyChoose.map((w, i) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontSize: '20px' }}>{w.icon}</td>
                      <td style={{ fontWeight: '600' }}>{w.title}</td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{w.description}</td>
                      <td>
                        <button disabled={i === 0} onClick={() => handleReorder("why-choose", whyChoose, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                        <button disabled={i === whyChoose.length - 1} onClick={() => handleReorder("why-choose", whyChoose, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("whyChoose", w)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("whyChoose", w.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 4: STATISTICS & PARTNERS --- */}
        {activeTab === "stats" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <form onSubmit={handleSaveSection} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', color: '#0f172a' }}>Statistics Section Counters</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Conferences Hosted</label>
                  <input type="number" value={section.statConferences || 0} onChange={e => setSection({ ...section, statConferences: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Researchers Connected</label>
                  <input type="number" value={section.statResearchers || 0} onChange={e => setSection({ ...section, statResearchers: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Countries Represented</label>
                  <input type="number" value={section.statCountries || 0} onChange={e => setSection({ ...section, statCountries: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Publications Indexed</label>
                  <input type="number" value={section.statPublications || 0} onChange={e => setSection({ ...section, statPublications: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Keynote Speakers</label>
                  <input type="number" value={section.statSpeakers || 0} onChange={e => setSection({ ...section, statSpeakers: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Delegate Satisfaction %</label>
                  <input type="number" value={section.statSatisfaction || 0} onChange={e => setSection({ ...section, statSatisfaction: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <button type="submit" className="btn-admin-primary" style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>Save Statistics</button>
            </form>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Partner Networks Strip</h3>
                <button className="btn-admin-primary" onClick={() => openModal("partner")}>+ Add Partner Logo</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Logo</th>
                    <th>Partner Name</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p, i) => {
                    const isDefault = !p.logoFileName || ["ieee", "springer", "elsevier", "scopus", "crossref", "google"].includes(p.logoFileName);
                    const logoUrl = p.logoFileName?.startsWith("http") ? p.logoFileName : `${BASE_URL}/uploads/about/${p.logoFileName}`;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          {isDefault ? (
                            <span style={{ fontSize: '12px', background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' }}>SVG Default ({p.logoFileName})</span>
                          ) : (
                            <img src={logoUrl} alt="logo" style={{ maxHeight: '28px', objectFit: 'contain' }} />
                          )}
                        </td>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        <td>
                          <button disabled={i === 0} onClick={() => handleReorder("partners", partners, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                          <button disabled={i === partners.length - 1} onClick={() => handleReorder("partners", partners, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-action-edit" onClick={() => openModal("partner", p)}>Edit</button>
                          <button className="btn-action-delete" onClick={() => handleDeleteItem("partner", p.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 5: GLOBAL PRESENCE MAP --- */}
        {activeTab === "map" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ color: '#0f172a', margin: 0 }}>Map Presence Markers</h3>
                  <p style={{ color: '#64748b', fontSize: '12.5px', marginTop: '2px' }}>Coordinates range: X (0 to 1100), Y (0 to 480) inside the world map SVG layout.</p>
                </div>
                <button className="btn-admin-primary" onClick={() => openModal("location")}>+ Add Location Marker</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Marker Label</th>
                    <th>X Coord</th>
                    <th>Y Coord</th>
                    <th>Type</th>
                    <th>Office Title & Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map(loc => (
                    <tr key={loc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '600' }}>{loc.name}</td>
                      <td>{loc.x}px</td>
                      <td>{loc.y}px</td>
                      <td>
                        <span style={{
                          background: loc.isOffice ? '#dbeafe' : '#f1f5f9',
                          color: loc.isOffice ? '#1d4ed8' : '#475569',
                          padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                        }}>
                          {loc.isOffice ? "OFFICE HUB" : "NODE MARKER"}
                        </span>
                      </td>
                      <td>
                        {loc.isOffice ? (
                          <div style={{ fontSize: '12.5px' }}>
                            <strong>{loc.officeTitle}</strong>: <span style={{ color: '#64748b' }}>{loc.officeAddress}</span>
                          </div>
                        ) : "-"}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("location", loc)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("location", loc.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Map Connection Curves (Bezier Curves)</h3>
                <button className="btn-admin-primary" onClick={() => openModal("connection")}>+ Add Path Connection</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Start Point</th>
                    <th>Bezier Control</th>
                    <th>End Point</th>
                    <th>Opacity</th>
                    <th>Dash array</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map(conn => (
                    <tr key={conn.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px' }}>({conn.startX}, {conn.startY})</td>
                      <td>({conn.controlX}, {conn.controlY})</td>
                      <td>({conn.endX}, {conn.endY})</td>
                      <td>{conn.opacity}</td>
                      <td>{conn.dashArray || "Solid"}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("connection", conn)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("connection", conn.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 6: TIMELINE & BOARD --- */}
        {activeTab === "timeline" && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Milestones & Growth Timeline</h3>
                <button className="btn-admin-primary" onClick={() => openModal("timeline")}>+ Add Timeline Milestone</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Year</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Side alignment</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {milestones.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: '800', color: '#E91E63' }}>{m.year}</td>
                      <td style={{ fontWeight: '600' }}>{m.title}</td>
                      <td style={{ fontSize: '13px', color: '#64748b' }}>{m.description}</td>
                      <td>{m.side === "right" ? "👉 Right" : "👈 Left"}</td>
                      <td>
                        <button disabled={i === 0} onClick={() => handleReorder("timeline", milestones, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                        <button disabled={i === milestones.length - 1} onClick={() => handleReorder("timeline", milestones, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn-action-edit" onClick={() => openModal("timeline", m)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteItem("timeline", m.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#0f172a', margin: 0 }}>Advisory & Steering board Members</h3>
                <button className="btn-admin-primary" onClick={() => openModal("leader")}>+ Add Advisory Leader</button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '12px' }}>Photo</th>
                    <th>Name</th>
                    <th>Designation & Role</th>
                    <th>Institution & Country</th>
                    <th>Order</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((l, i) => {
                    const avatarUrl = l.photoFileName ? (l.photoFileName.startsWith("http") ? l.photoFileName : `${BASE_URL}/uploads/about/${l.photoFileName}`) : null;
                    return (
                      <tr key={l.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', overflow: 'hidden' }}>
                            {avatarUrl ? (
                              <img src={avatarUrl} alt={l.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              l.emoji || "👩‍🔬"
                            )}
                          </div>
                        </td>
                        <td style={{ fontWeight: '600' }}>{l.name}</td>
                        <td>
                          <span style={{ fontSize: '13px' }}>{l.role}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{l.institution}, {l.country}</span>
                        </td>
                        <td>
                          <button disabled={i === 0} onClick={() => handleReorder("leaders", leaders, i, "up")} style={{ cursor: 'pointer', marginRight: '4px' }}>▲</button>
                          <button disabled={i === leaders.length - 1} onClick={() => handleReorder("leaders", leaders, i, "down")} style={{ cursor: 'pointer' }}>▼</button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn-action-edit" onClick={() => openModal("leader", l)}>Edit</button>
                          <button className="btn-action-delete" onClick={() => handleDeleteItem("leader", l.id)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '560px', maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                {editingItem ? `Edit ${modalType.toUpperCase()}` : `Add New ${modalType.toUpperCase()}`}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <form id="modalForm" onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Feature Form fields */}
                {modalType === "feature" && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Feature Title *</label>
                      <input required type="text" value={modalFormData.title || ""} onChange={e => setModalFormData({ ...modalFormData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Feature Description *</label>
                      <textarea required rows="3" value={modalFormData.description || ""} onChange={e => setModalFormData({ ...modalFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </>
                )}

                {/* Service Form fields */}
                {modalType === "service" && (
                  <>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Icon Emoji *</label>
                        <input required type="text" value={modalFormData.icon || ""} onChange={e => setModalFormData({ ...modalFormData, icon: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Tag Value *</label>
                        <input required type="text" placeholder="e.g. 150+ Events" value={modalFormData.tag || ""} onChange={e => setModalFormData({ ...modalFormData, tag: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Service Title *</label>
                      <input required type="text" value={modalFormData.title || ""} onChange={e => setModalFormData({ ...modalFormData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description *</label>
                      <textarea required rows="3" value={modalFormData.description || ""} onChange={e => setModalFormData({ ...modalFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </>
                )}

                {/* Why Choose Form fields */}
                {modalType === "whyChoose" && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Icon Emoji/SVG *</label>
                      <input required type="text" value={modalFormData.icon || ""} onChange={e => setModalFormData({ ...modalFormData, icon: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Benefit Title *</label>
                      <input required type="text" value={modalFormData.title || ""} onChange={e => setModalFormData({ ...modalFormData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description *</label>
                      <textarea required rows="3" value={modalFormData.description || ""} onChange={e => setModalFormData({ ...modalFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </>
                )}

                {/* Partner Network Form fields */}
                {modalType === "partner" && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Partner Name *</label>
                      <input required type="text" value={modalFormData.name || ""} onChange={e => setModalFormData({ ...modalFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Upload Logo (or type default logo slug like: ieee, springer, elsevier)</label>
                      <input type="text" placeholder="Optional slug" value={modalFormData.logoFileName || ""} onChange={e => setModalFormData({ ...modalFormData, logoFileName: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }} />
                      <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files[0])} />
                    </div>
                  </>
                )}

                {/* Timeline Milestone Form fields */}
                {modalType === "timeline" && (
                  <>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Milestone Year *</label>
                        <input required type="text" placeholder="e.g. 2026" value={modalFormData.year || ""} onChange={e => setModalFormData({ ...modalFormData, year: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Side alignment</label>
                        <select value={modalFormData.side || "left"} onChange={e => setModalFormData({ ...modalFormData, side: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }}>
                          <option value="left">Left Card</option>
                          <option value="right">Right Card</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Milestone Title *</label>
                      <input required type="text" value={modalFormData.title || ""} onChange={e => setModalFormData({ ...modalFormData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description *</label>
                      <textarea required rows="3" value={modalFormData.description || ""} onChange={e => setModalFormData({ ...modalFormData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                  </>
                )}

                {/* Advisory Leader Form fields */}
                {modalType === "leader" && (
                  <>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Name *</label>
                        <input required type="text" value={modalFormData.name || ""} onChange={e => setModalFormData({ ...modalFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Fallback Emoji</label>
                        <input type="text" placeholder="e.g. 👩‍🔬" value={modalFormData.emoji || "👩‍🔬"} onChange={e => setModalFormData({ ...modalFormData, emoji: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Role / Designation *</label>
                        <input required type="text" value={modalFormData.role || ""} onChange={e => setModalFormData({ ...modalFormData, role: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Institution *</label>
                        <input required type="text" value={modalFormData.institution || ""} onChange={e => setModalFormData({ ...modalFormData, institution: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Country *</label>
                      <input required type="text" value={modalFormData.country || ""} onChange={e => setModalFormData({ ...modalFormData, country: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Photo File</label>
                      <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files[0])} />
                    </div>
                  </>
                )}

                {/* Map Location Marker Form fields */}
                {modalType === "location" && (
                  <>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Label Name *</label>
                        <input required type="text" placeholder="e.g. Europe" value={modalFormData.name || ""} onChange={e => setModalFormData({ ...modalFormData, name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '24px', gap: '8px' }}>
                        <input type="checkbox" id="isOffice" checked={modalFormData.isOffice || false} onChange={e => setModalFormData({ ...modalFormData, isOffice: e.target.checked })} />
                        <label htmlFor="isOffice" style={{ fontWeight: '600', fontSize: '13.5px', color: '#334155', cursor: 'pointer' }}>Is Office Hub?</label>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>X coordinate (0 - 1100)</label>
                        <input type="number" value={modalFormData.x || 0} onChange={e => setModalFormData({ ...modalFormData, x: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Y coordinate (0 - 480)</label>
                        <input type="number" value={modalFormData.y || 0} onChange={e => setModalFormData({ ...modalFormData, y: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>

                    {modalFormData.isOffice && (
                      <div style={{ border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ margin: 0, color: '#0f172a' }}>Office Overlay Information</h4>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Office Title</label>
                          <input type="text" placeholder="e.g. USA Office" value={modalFormData.officeTitle || ""} onChange={e => setModalFormData({ ...modalFormData, officeTitle: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Office Address</label>
                          <input type="text" placeholder="e.g. San Jose, California" value={modalFormData.officeAddress || ""} onChange={e => setModalFormData({ ...modalFormData, officeAddress: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff' }} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Map Connection Bezier Path Form fields */}
                {modalType === "connection" && (
                  <>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Start X *</label>
                        <input required type="number" value={modalFormData.startX || 0} onChange={e => setModalFormData({ ...modalFormData, startX: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Start Y *</label>
                        <input required type="number" value={modalFormData.startY || 0} onChange={e => setModalFormData({ ...modalFormData, startY: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Control X (Curve apex) *</label>
                        <input required type="number" value={modalFormData.controlX || 0} onChange={e => setModalFormData({ ...modalFormData, controlX: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Control Y (Curve apex) *</label>
                        <input required type="number" value={modalFormData.controlY || 0} onChange={e => setModalFormData({ ...modalFormData, controlY: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>End X *</label>
                        <input required type="number" value={modalFormData.endX || 0} onChange={e => setModalFormData({ ...modalFormData, endX: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>End Y *</label>
                        <input required type="number" value={modalFormData.endY || 0} onChange={e => setModalFormData({ ...modalFormData, endY: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Opacity (0.1 to 1.0)</label>
                        <input type="number" step="0.05" min="0.1" max="1" value={modalFormData.opacity || 0.4} onChange={e => setModalFormData({ ...modalFormData, opacity: parseFloat(e.target.value) || 0.4 })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Dashed style array</label>
                        <input type="text" placeholder="e.g. 8 5" value={modalFormData.dashArray || ""} onChange={e => setModalFormData({ ...modalFormData, dashArray: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                  </>
                )}

              </form>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" form="modalForm" disabled={loading} style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUsManager;
