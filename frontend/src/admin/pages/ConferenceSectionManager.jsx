import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';
import './ConferenceSectionManager.css';

const ConferenceSectionManager = () => {
  const { activeConferenceId } = useAdmin();
  
  // Lists
  const [sections, setSections] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Load states
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Drag states (for sidebar sections)
  const [draggedSecIndex, setDraggedSecIndex] = useState(null);
  const [dragOverSecIndex, setDragOverSecIndex] = useState(null);

  // Drag states (for section items)
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);

  // Section modal state
  const [showSecModal, setShowSecModal] = useState(false);
  const [isEditingSec, setIsEditingSec] = useState(false);
  const [currentSecId, setCurrentSecId] = useState(null);
  const [secName, setSecName] = useState('');
  const [secSlug, setSecSlug] = useState('');
  const [secVisible, setSecVisible] = useState(true);
  const [secSlugChecking, setSecSlugChecking] = useState(false);
  const [secSlugAvailable, setSecSlugAvailable] = useState(true);

  // Item modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemDesignation, setItemDesignation] = useState('');
  const [itemOrganization, setItemOrganization] = useState('');
  const [itemCountry, setItemCountry] = useState('');
  const [itemImagePath, setItemImagePath] = useState('');
  const [itemWebsiteUrl, setItemWebsiteUrl] = useState('');
  const [itemLinkedinUrl, setItemLinkedinUrl] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemVisible, setItemVisible] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (activeConferenceId) {
      fetchSections();
    } else {
      setSections([]);
      setItems([]);
      setSelectedSection(null);
    }
  }, [activeConferenceId]);

  useEffect(() => {
    if (selectedSection) {
      fetchItems(selectedSection.id);
    } else {
      setItems([]);
    }
  }, [selectedSection]);

  const fetchSections = async () => {
    setLoadingSections(true);
    setError('');
    try {
      const data = await api.get(`/api/admin/conference-sections?conferenceId=${activeConferenceId}`);
      setSections(data || []);
      
      // Auto-select first section if none selected
      if (data && data.length > 0) {
        if (!selectedSection || !data.some(s => s.id === selectedSection.id)) {
          setSelectedSection(data[0]);
        } else {
          // Keep current section selected but update its data
          const updated = data.find(s => s.id === selectedSection.id);
          setSelectedSection(updated || data[0]);
        }
      } else {
        setSelectedSection(null);
      }
    } catch (err) {
      setError('Failed to fetch conference sections.');
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchItems = async (sectionId) => {
    setLoadingItems(true);
    try {
      const data = await api.get(`/api/admin/conference-sections/${sectionId}/items`);
      setItems(data || []);
    } catch (err) {
      setError('Failed to fetch items for this section.');
    } finally {
      setLoadingItems(false);
    }
  };

  // ── SECTION ACTIONS ───────────────────────────────────────────────

  const handleSecNameChange = (val) => {
    setSecName(val);
    if (!isEditingSec) {
      const generated = val.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSecSlug(generated);
      checkSecSlugAvailability(generated, null);
    }
  };

  const handleSecSlugChange = (val) => {
    const sanitized = val.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSecSlug(sanitized);
    checkSecSlugAvailability(sanitized, currentSecId);
  };

  const checkSecSlugAvailability = async (slugToCheck, excludeId) => {
    if (!slugToCheck || !activeConferenceId) return;
    setSecSlugChecking(true);
    try {
      const data = await api.get(`/api/admin/conference-sections?conferenceId=${activeConferenceId}`);
      const alreadyTaken = (data || []).some(s => s.sectionSlug === slugToCheck && s.id !== excludeId);
      setSecSlugAvailable(!alreadyTaken);
    } catch (err) {
      console.error(err);
    } finally {
      setSecSlugChecking(false);
    }
  };

  const handleOpenAddSecModal = () => {
    setIsEditingSec(false);
    setCurrentSecId(null);
    setSecName('');
    setSecSlug('');
    setSecVisible(true);
    setSecSlugAvailable(true);
    setShowSecModal(true);
  };

  const handleOpenEditSecModal = (sec) => {
    setIsEditingSec(true);
    setCurrentSecId(sec.id);
    setSecName(sec.sectionName);
    setSecSlug(sec.sectionSlug);
    setSecVisible(sec.isVisible !== false);
    setSecSlugAvailable(true);
    setShowSecModal(true);
  };

  const handleToggleSecVisible = async (sec) => {
    try {
      const updated = { ...sec, isVisible: !sec.isVisible };
      await api.put(`/api/admin/conference-sections/${sec.id}`, updated);
      setSuccess(`Section "${sec.sectionName}" visibility toggled!`);
      fetchSections();
    } catch (err) {
      setError('Failed to update section visibility.');
    }
  };

  const handleDeleteSec = async (sec) => {
    if (!window.confirm(`WARNING: Deleting section "${sec.sectionName}" will permanently delete ALL entries in it. Continue?`)) return;
    try {
      await api.delete(`/api/admin/conference-sections/${sec.id}`);
      setSuccess(`Section "${sec.sectionName}" deleted.`);
      fetchSections();
    } catch (err) {
      setError('Failed to delete section.');
    }
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!secName.trim() || !secSlug.trim()) return;
    if (!secSlugAvailable) {
      setError('Slug already taken.');
      return;
    }

    const payload = {
      conferenceId: activeConferenceId,
      sectionName: secName,
      sectionSlug: secSlug,
      isVisible: secVisible,
      displayOrder: isEditingSec ? undefined : sections.length + 1
    };

    try {
      if (isEditingSec) {
        await api.put(`/api/admin/conference-sections/${currentSecId}`, payload);
        setSuccess('Section updated successfully.');
      } else {
        await api.post('/api/admin/conference-sections', payload);
        setSuccess('Section created successfully.');
      }
      setShowSecModal(false);
      fetchSections();
    } catch (err) {
      setError(err?.error || 'Failed to save section.');
    }
  };

  // ── ITEM ACTIONS ──────────────────────────────────────────────────

  const handleOpenAddItemModal = () => {
    setIsEditingItem(false);
    setCurrentItemId(null);
    setItemName('');
    setItemDesignation('');
    setItemOrganization('');
    setItemCountry('');
    setItemImagePath('');
    setItemWebsiteUrl('');
    setItemLinkedinUrl('');
    setItemDescription('');
    setItemVisible(true);
    setShowItemModal(true);
  };

  const handleOpenEditItemModal = (item) => {
    setIsEditingItem(true);
    setCurrentItemId(item.id);
    setItemName(item.name);
    setItemDesignation(item.designation || '');
    setItemOrganization(item.organization || '');
    setItemCountry(item.country || '');
    setItemImagePath(item.imagePath || '');
    setItemWebsiteUrl(item.websiteUrl || '');
    setItemLinkedinUrl(item.linkedinUrl || '');
    setItemDescription(item.description || '');
    setItemVisible(item.isVisible !== false);
    setShowItemModal(true);
  };

  const handleToggleItemVisible = async (item) => {
    try {
      const updated = { ...item, isVisible: !item.isVisible };
      await api.put(`/api/admin/conference-sections/items/${item.id}`, updated);
      setSuccess(`Entry "${item.name}" visibility updated!`);
      if (selectedSection) fetchItems(selectedSection.id);
    } catch (err) {
      setError('Failed to update entry visibility.');
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete the entry "${item.name}"?`)) return;
    try {
      await api.delete(`/api/admin/conference-sections/items/${item.id}`);
      setSuccess(`Entry "${item.name}" deleted.`);
      if (selectedSection) fetchItems(selectedSection.id);
    } catch (err) {
      setError('Failed to delete entry.');
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!itemName.trim() || !selectedSection) return;

    const payload = {
      sectionId: selectedSection.id,
      name: itemName,
      designation: itemDesignation,
      organization: itemOrganization,
      country: itemCountry,
      imagePath: itemImagePath,
      websiteUrl: itemWebsiteUrl,
      linkedinUrl: itemLinkedinUrl,
      description: itemDescription,
      isVisible: itemVisible,
      displayOrder: isEditingItem ? undefined : items.length + 1
    };

    try {
      if (isEditingItem) {
        await api.put(`/api/admin/conference-sections/items/${currentItemId}`, payload);
        setSuccess('Entry updated successfully.');
      } else {
        await api.post('/api/admin/conference-sections/items', payload);
        setSuccess('Entry created successfully.');
      }
      setShowItemModal(false);
      fetchItems(selectedSection.id);
    } catch (err) {
      setError('Failed to save entry.');
    }
  };

  const handleImageUpload = async (file) => {
    if (!currentItemId) {
      alert("Please save the entry details first, then edit it to upload a profile photo/logo.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setUploadingImage(true);

    try {
      const response = await fetch(`/api/admin/conference-sections/items/${currentItemId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const updated = await response.json();
      setItemImagePath(updated.imagePath);
      setSuccess('Profile image uploaded successfully.');
      fetchItems(selectedSection.id);
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // ── DRAG AND DROP SECTIONS (SIDEBAR) ──────────────────────────────

  const handleSecDragStart = (e, idx) => {
    setDraggedSecIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSecDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverSecIndex(idx);
  };

  const handleSecDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedSecIndex === null || draggedSecIndex === targetIdx) {
      clearSecDrag();
      return;
    }

    const reordered = [...sections];
    const draggedItem = reordered[draggedSecIndex];
    reordered.splice(draggedSecIndex, 1);
    reordered.splice(targetIdx, 0, draggedItem);

    const updated = reordered.map((sec, i) => ({
      ...sec,
      displayOrder: i + 1
    }));

    setSections(updated);
    clearSecDrag();

    try {
      await api.post('/api/admin/conference-sections/reorder', updated);
      setSuccess('Reordered sections successfully!');
      fetchSections();
    } catch (err) {
      setError('Failed to save section order.');
    }
  };

  const clearSecDrag = () => {
    setDraggedSecIndex(null);
    setDragOverSecIndex(null);
  };

  // ── DRAG AND DROP ITEMS (GRID CARDS) ──────────────────────────────

  const handleItemDragStart = (e, idx) => {
    setDraggedItemIndex(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleItemDragOver = (e, idx) => {
    e.preventDefault();
    setDragOverItemIndex(idx);
  };

  const handleItemDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIdx) {
      clearItemDrag();
      return;
    }

    const reordered = [...items];
    const draggedCard = reordered[draggedItemIndex];
    reordered.splice(draggedItemIndex, 1);
    reordered.splice(targetIdx, 0, draggedCard);

    const updated = reordered.map((item, i) => ({
      ...item,
      displayOrder: i + 1
    }));

    setItems(updated);
    clearItemDrag();

    try {
      await api.post('/api/admin/conference-sections/items/reorder', updated);
      setSuccess('Reordered entries successfully!');
      if (selectedSection) fetchItems(selectedSection.id);
    } catch (err) {
      setError('Failed to save entry order.');
    }
  };

  const clearItemDrag = () => {
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  return (
    <div className="section-mgr-container">
      <div className="admin-page-header">
        <div>
          <h2>Conference Tab Sections</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage dynamic content tab sections on the homepage (Sponsors, Committees, Speakers) and add unlimited entries under each tab.
          </p>
        </div>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontWeight: '500' }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', fontWeight: '500' }}>{success}</div>}

      {!activeConferenceId ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#64748b', margin: 0 }}>Please select a conference from the header selector to manage its dynamic tabs.</p>
        </div>
      ) : (
        <div className="sections-flex-layout">
          
          {/* Left Sidebar: Sections (Tabs) list */}
          <div className="sections-sidebar-card">
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: '#0f172a' }}>Tab Sections</strong>
              <button 
                onClick={handleOpenAddSecModal}
                style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
              >
                + Add Tab
              </button>
            </div>

            {loadingSections && sections.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading tabs...</div>
            ) : (
              <div className="sidebar-section-list">
                {sections.map((sec, index) => {
                  const isActive = selectedSection && selectedSection.id === sec.id;
                  const isDragOver = dragOverSecIndex === index;
                  return (
                    <div
                      key={sec.id}
                      draggable
                      onDragStart={(e) => handleSecDragStart(e, index)}
                      onDragOver={(e) => handleSecDragOver(e, index)}
                      onDrop={(e) => handleSecDrop(e, index)}
                      onDragEnd={clearSecDrag}
                      className={`sidebar-section-item ${isActive ? 'active' : ''} ${isDragOver ? 'section-drag-over-class' : ''}`}
                      onClick={() => setSelectedSection(sec)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        <span className="section-drag-handle">☰</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {sec.sectionName}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '8px', zIndex: 10 }} onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOpenEditSecModal(sec)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#fff' : '#3b82f6', fontSize: '11px', fontWeight: '700' }}
                          title="Rename"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleToggleSecVisible(sec)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#fff' : '#64748b', fontSize: '11px' }}
                          title={sec.isVisible ? 'Hide from navbar' : 'Show in navbar'}
                        >
                          {sec.isVisible ? '👁️' : '🕶️'}
                        </button>
                        <button 
                          onClick={() => handleDeleteSec(sec)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isActive ? '#fff' : '#ef4444', fontSize: '11px' }}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
                {sections.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No tabs created yet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Pane: Selected Section Items Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedSection ? (
              <div className="section-card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>
                      Entries under "{selectedSection.sectionName}"
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
                      Drag and drop cards to reorder how they display on the public website.
                    </p>
                  </div>
                  <button 
                    onClick={handleOpenAddItemModal}
                    style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                  >
                    + Add New Entry
                  </button>
                </div>

                {loadingItems && items.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading entries...</div>
                ) : (
                  <>
                    <div className="items-grid-container">
                      {items.map((item, index) => {
                        const isDragOver = dragOverItemIndex === index;
                        return (
                          <div
                            key={item.id}
                            draggable
                            onDragStart={(e) => handleItemDragStart(e, index)}
                            onDragOver={(e) => handleItemDragOver(e, index)}
                            onDrop={(e) => handleItemDrop(e, index)}
                            onDragEnd={clearItemDrag}
                            className={`item-card ${isDragOver ? 'section-drag-over-class' : ''}`}
                          >
                            <div className="item-card-header">
                              <img 
                                src={item.imagePath || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'} 
                                alt={item.name} 
                                className="item-card-avatar"
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'; }}
                              />
                              <div className="item-card-info">
                                <h4 className="item-card-name">{item.name}</h4>
                                <span className="item-card-meta">{item.designation || 'No title'}</span>
                                <span className="item-card-meta" style={{ fontWeight: '500' }}>
                                  {item.organization ? `${item.organization}` : ''} {item.country ? `(${item.country})` : ''}
                                </span>
                              </div>
                            </div>
                            <div className="item-card-body">
                              {item.description || <em style={{ color: '#94a3b8' }}>No description provided.</em>}
                            </div>
                            <div className="item-card-footer">
                              <span className={item.isVisible ? 'badge-visible' : 'badge-hidden'}>
                                {item.isVisible ? 'VISIBLE' : 'HIDDEN'}
                              </span>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  className="item-actions-btn btn-item-edit"
                                  onClick={() => handleOpenEditItemModal(item)}
                                >
                                  Edit
                                </button>
                                <button 
                                  className="item-actions-btn btn-item-delete"
                                  onClick={() => handleDeleteItem(item)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {items.length === 0 && (
                      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                        <p style={{ margin: 0, fontWeight: '500' }}>No entries found inside this tab.</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Click "+ Add New Entry" to populate this tab section.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="admin-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                Please create or select a tab section from the left sidebar to manage its entries.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION TABS MODAL */}
      {showSecModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '450px' }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                {isEditingSec ? 'Edit Tab Section' : 'Add New Tab Section'}
              </h3>
              <button onClick={() => setShowSecModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleSaveSection}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label">Tab Section Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Sponsors, Media Partners"
                    value={secName}
                    onChange={(e) => handleSecDragOver ? handleSecNameChange(e.target.value) : setSecName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Tab Slug Path</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. sponsors, media-partners"
                    value={secSlug}
                    onChange={(e) => handleSecSlugChange(e.target.value)}
                    required
                  />
                  {secSlugChecking && <span className="slug-badge">Checking...</span>}
                  {!secSlugChecking && secSlug && (
                    <span className="slug-badge" style={{ color: secSlugAvailable ? '#10b981' : '#ef4444' }}>
                      {secSlugAvailable ? '✓ Slug is available' : '✗ Slug is already taken'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Visible on Page:</label>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={secVisible} 
                      onChange={(e) => setSecVisible(e.target.checked)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setShowSecModal(false)} className="form-input" style={{ width: 'auto', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={!secSlugAvailable} className="form-input" style={{ width: 'auto', background: '#22c55e', color: '#fff', border: 'none', cursor: !secSlugAvailable ? 'not-allowed' : 'pointer', fontWeight: '600', marginLeft: '8px' }}>Save Tab</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION ITEMS MODAL */}
      {showItemModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '650px' }}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
                {isEditingItem ? `Edit Entry: ${itemName}` : 'Add New Entry'}
              </h3>
              <button onClick={() => setShowItemModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-grid">
                  <div>
                    <label className="form-label">Full Name / Company Name</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Google, Prof. Jane Doe"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Designation / Subtitle</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Platinum Sponsor, Guest Speaker"
                      value={itemDesignation}
                      onChange={(e) => setItemDesignation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Organization / Affiliation</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Google Inc., MIT University"
                      value={itemOrganization}
                      onChange={(e) => setItemOrganization(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Country</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. USA, UK"
                      value={itemCountry}
                      onChange={(e) => setItemCountry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Website URL</label>
                    <input 
                      type="url" 
                      className="form-input"
                      placeholder="https://example.com"
                      value={itemWebsiteUrl}
                      onChange={(e) => setItemWebsiteUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">LinkedIn URL</label>
                    <input 
                      type="url" 
                      className="form-input"
                      placeholder="https://linkedin.com/in/username"
                      value={itemLinkedinUrl}
                      onChange={(e) => setItemLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group-full">
                  <label className="form-label">Description / Short Biography</label>
                  <textarea 
                    className="form-input"
                    rows="3"
                    placeholder="Provide short details, company bio, or speaker profile information..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {isEditingItem ? (
                  <div>
                    <label className="form-label">Profile Image / Company Logo</label>
                    <div className="image-upload-wrapper">
                      {itemImagePath ? (
                        <img src={itemImagePath} alt={itemName} className="image-preview" />
                      ) : (
                        <div style={{ width: '100px', height: '60px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b' }}>No Image</div>
                      )}
                      <div>
                        <label className="btn-upload-label">
                          {uploadingImage ? 'Uploading...' : 'Choose Image File'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => handleImageUpload(e.target.files[0])}
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', color: '#64748b' }}>
                    💡 Image/Logo uploading becomes available once the entry is saved.
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <label className="form-label" style={{ margin: 0 }}>Visible on Tab Content:</label>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={itemVisible} 
                      onChange={(e) => setItemVisible(e.target.checked)} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setShowItemModal(false)} className="form-input" style={{ width: 'auto', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="form-input" style={{ width: 'auto', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600', marginLeft: '8px' }}>Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceSectionManager;
