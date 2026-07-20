import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';
import RichTextEditor from '../components/RichTextEditor';
import './NavbarMenuManager.css';

const NavbarMenuManager = () => {
  const { confirmDialog, alertDialog } = useAdminDialog();

  const { activeConferenceId } = useAdmin();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedType, setDraggedType] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [menuType, setMenuType] = useState('Speakers');
  const [title, setTitle] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [bannerPath, setBannerPath] = useState('');
  const [thumbnailPath, setThumbnailPath] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // File upload progress/loading
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  
  // Validation state
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [slugChecking, setSlugChecking] = useState(false);

  useEffect(() => {
    if (activeConferenceId) {
      fetchMenus();
    }
  }, [activeConferenceId]);

  const fetchMenus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get(`/api/admin/navbar-menus?conferenceId=${activeConferenceId}`);
      setMenus(data || []);
    } catch (err) {
      setError('Failed to fetch navbar submenus.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (val) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(generatedSlug);
      checkSlugAvailability(generatedSlug, null);
    }
  };

  const handleSlugChange = (val) => {
    const sanitized = val.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(sanitized);
    checkSlugAvailability(sanitized, currentId);
  };

  const checkSlugAvailability = async (testSlug, excludeId) => {
    if (!testSlug || !activeConferenceId) return;
    setSlugChecking(true);
    try {
      const res = await api.get(`/api/admin/navbar-menus/check-slug?conferenceId=${activeConferenceId}&slug=${testSlug}${excludeId ? `&excludeId=${excludeId}` : ''}`);
      setSlugAvailable(res.available);
    } catch (err) {
      console.error(err);
    } finally {
      setSlugChecking(false);
    }
  };

  const handleOpenAddModal = (defaultType = 'Speakers') => {
    setIsEditing(false);
    setCurrentId(null);
    setMenuType(defaultType);
    setTitle('');
    setPageTitle('');
    setSlug('');
    setContent('');
    setBannerPath('');
    setThumbnailPath('');
    setDisplayOrder(menus.filter(m => m.menuType === defaultType).length + 1);
    setIsActive(true);
    setIsVisible(true);
    setSlugAvailable(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (menu) => {
    setIsEditing(true);
    setCurrentId(menu.id);
    setMenuType(menu.menuType);
    setTitle(menu.title);
    setPageTitle(menu.pageTitle || '');
    setSlug(menu.slug);
    setContent(menu.content || '');
    setBannerPath(menu.bannerPath || '');
    setThumbnailPath(menu.thumbnailPath || '');
    setDisplayOrder(menu.displayOrder || 0);
    setIsActive(menu.isActive !== false);
    setIsVisible(menu.isVisible !== false);
    setSlugAvailable(true);
    setShowModal(true);
  };

  const handleToggleActive = async (menu) => {
    try {
      const updated = { ...menu, isActive: !menu.isActive };
      await api.put(`/api/admin/navbar-menus/${menu.id}`, updated);
      setSuccess(`Submenu "${menu.title}" status updated!`);
      fetchMenus();
    } catch (err) {
      setError('Failed to update submenu status.');
    }
  };

  const handleToggleVisible = async (menu) => {
    try {
      const updated = { ...menu, isVisible: !menu.isVisible };
      await api.put(`/api/admin/navbar-menus/${menu.id}`, updated);
      setSuccess(`Submenu "${menu.title}" visibility updated!`);
      fetchMenus();
    } catch (err) {
      setError('Failed to update submenu visibility.');
    }
  };

  const handleDelete = async (id, title) => {
    if (!(await confirmDialog(`Are you sure you want to delete the submenu "${title}"?`))) return;
    try {
      await api.delete(`/api/admin/navbar-menus/${id}`);
      setSuccess(`Submenu "${title}" deleted successfully!`);
      fetchMenus();
    } catch (err) {
      setError('Failed to delete submenu item.');
    }
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError('Title and Slug are required.');
      return;
    }
    if (!slugAvailable) {
      setError('The slug is already in use. Please select a unique slug.');
      return;
    }

    const payload = {
      conferenceId: activeConferenceId,
      menuType,
      title,
      pageTitle: pageTitle || title,
      slug,
      content,
      bannerPath,
      thumbnailPath,
      displayOrder,
      isActive,
      isVisible
    };

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/api/admin/navbar-menus/${currentId}`, payload);
        setSuccess('Submenu updated successfully!');
      } else {
        await api.post('/api/admin/navbar-menus', payload);
        setSuccess('Submenu created successfully!');
      }
      setShowModal(false);
      fetchMenus();
    } catch (err) {
      setError(err?.error || 'Failed to save submenu.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!currentId) {
      await alertDialog("Please save the page first, then edit it to upload images.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    if (type === 'banner') setUploadingBanner(true);
    else setUploadingThumbnail(true);

    try {
      const response = await fetch(`/api/admin/navbar-menus/${currentId}/upload-${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin-token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const updatedMenu = await response.json();
      if (type === 'banner') {
        setBannerPath(updatedMenu.bannerPath);
        setSuccess('Banner image uploaded successfully!');
      } else {
        setThumbnailPath(updatedMenu.thumbnailPath);
        setSuccess('Thumbnail image uploaded successfully!');
      }
      fetchMenus();
    } catch (err) {
      setError('Failed to upload image.');
    } finally {
      setUploadingBanner(false);
      setUploadingThumbnail(false);
    }
  };

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e, index, type) => {
    setDraggedIndex(index);
    setDraggedType(type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index, type) => {
    e.preventDefault();
    if (draggedType !== type) return; // Prevent drag over different menu sections
    setDragOverIndex(index);
  };

  const handleDrop = async (e, targetIndex, type) => {
    e.preventDefault();
    if (draggedIndex === null || draggedType !== type || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDraggedType(null);
      setDragOverIndex(null);
      return;
    }

    const filtered = menus.filter(m => m.menuType === type);
    const otherTypes = menus.filter(m => m.menuType !== type);

    const reorderedList = [...filtered];
    const draggedItem = reorderedList[draggedIndex];
    reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(targetIndex, 0, draggedItem);

    // Reassign order starting from 1
    const updatedFiltered = reorderedList.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1
    }));

    const completeList = [...otherTypes, ...updatedFiltered];
    setMenus(completeList);

    setDraggedIndex(null);
    setDraggedType(null);
    setDragOverIndex(null);

    // Update in database
    try {
      await api.post('/api/admin/navbar-menus/reorder', completeList);
      setSuccess('Reordered submenus successfully!');
      fetchMenus();
    } catch (err) {
      setError('Failed to save reordered list.');
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDraggedType(null);
    setDragOverIndex(null);
  };

  const moveRow = async (index, direction, type) => {
    const list = menus.filter(m => m.menuType === type);
    const otherTypes = menus.filter(m => m.menuType !== type);
    
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;

    // Swap elements
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // Recalculate displayOrder
    const updatedList = list.map((item, i) => ({
      ...item,
      displayOrder: i + 1
    }));

    const completeList = [...otherTypes, ...updatedList];
    setMenus(completeList);

    try {
      await api.post('/api/admin/navbar-menus/reorder', completeList);
      setSuccess('Submenu reordered successfully!');
      fetchMenus();
    } catch (err) {
      setError('Failed to save order.');
    }
  };

  const renderSection = (type) => {
    const filtered = menus.filter(m => m.menuType === type);

    return (
      <div className="section-card">
        <div className="section-header">
          <div className="section-title">
            <span>{type === 'Speakers' ? '🎙️' : '📋'}</span>
            Submenus under {type}
          </div>
          <button 
            className="btn-action-add" 
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
            onClick={() => handleOpenAddModal(type)}
          >
            + Add New Submenu
          </button>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead style={{ background: '#f8fafc' }}>
              <tr>
                <th style={{ width: '80px', padding: '12px 16px' }}>Reorder</th>
                <th>Menu Title</th>
                <th>Page Title</th>
                <th>Slug Path</th>
                <th style={{ width: '100px' }}>Navbar View</th>
                <th style={{ width: '100px' }}>Status</th>
                <th style={{ padding: '12px 16px', width: '220px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => {
                const isDraggingOver = dragOverIndex === index && draggedType === type;
                return (
                  <tr 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index, type)}
                    onDragOver={(e) => handleDragOver(e, index, type)}
                    onDrop={(e) => handleDrop(e, index, type)}
                    onDragEnd={handleDragEnd}
                    className={`drag-row ${isDraggingOver ? 'drag-over' : ''}`}
                    style={{ borderBottom: '1px solid #e2e8f0' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ cursor: 'grab', marginRight: '6px', color: '#94a3b8' }}>☰</span>
                        <button 
                          disabled={index === 0} 
                          onClick={() => moveRow(index, -1, type)}
                          style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer' }}
                        >
                          ▲
                        </button>
                        <button 
                          disabled={index === filtered.length - 1} 
                          onClick={() => moveRow(index, 1, type)}
                          style={{ padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === filtered.length - 1 ? 'not-allowed' : 'pointer' }}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '14px' }}>{item.title}</strong>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13.5px' }}>
                      {item.pageTitle}
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontSize: '12.5px', color: '#e74c3c' }}>
                        /{item.slug}
                      </code>
                    </td>
                    <td>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={item.isVisible} 
                          onChange={() => handleToggleVisible(item)} 
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleToggleActive(item)}
                        style={{
                          border: 'none',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          background: item.isActive ? '#dcfce7' : '#fee2e2',
                          color: item.isActive ? '#15803d' : '#b91c1c'
                        }}
                      >
                        {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-action-edit"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-action-delete"
                          onClick={() => handleDelete(item.id, item.title)}
                        >
                          Delete
                        </button>
                        <a 
                          href={activeConferenceId ? `/conferences/${activeConferenceId}/${item.slug}` : '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{
                            padding: '6px 12px',
                            background: '#f1f5f9',
                            color: '#475569',
                            borderRadius: '6px',
                            fontSize: '13px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            border: '1px solid #cbd5e1',
                            textAlign: 'center'
                          }}
                        >
                          Preview
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No submenus defined. Click "+ Add New Submenu" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="navbar-manager-container">
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontWeight: '500' }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', fontWeight: '500' }}>{success}</div>}

      {!activeConferenceId ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: '#64748b', margin: 0 }}>Please select a conference from the header selector to manage its submenus.</p>
        </div>
      ) : (
        <>
          {loading && menus.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading submenus...</div>
          ) : (
            <>
              {renderSection('Speakers')}
              {renderSection('Scientific Program')}
            </>
          )}
        </>
      )}

      {/* Edit/Create Submenu Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                {isEditing ? `Edit Submenu: ${title}` : 'Add New Submenu'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveMenu} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div className="admin-modal-body">
                <div className="form-grid">
                  <div>
                    <label className="form-label">Menu Type</label>
                    <select 
                      className="form-input"
                      value={menuType}
                      onChange={(e) => setMenuType(e.target.value)}
                    >
                      <option value="Speakers">Speakers</option>
                      <option value="Scientific Program">Scientific Program</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Menu Link Title (in Dropdown)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Advisory Committee"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Page Main Title</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Scientific Advisory Committee"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Slug Path</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. advisory-committee"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                    />
                    {slugChecking && <span className="slug-badge">Checking...</span>}
                    {!slugChecking && slug && (
                      <span className="slug-badge" style={{ color: slugAvailable ? '#10b981' : '#ef4444' }}>
                        {slugAvailable ? '✓ Slug is available' : '✗ Slug is already taken'}
                      </span>
                    )}
                  </div>

                  <div className="form-group-full">
                    <label className="form-label">Page Content (Rich Text Editor)</label>
                    <RichTextEditor value={content} onChange={setContent} />
                  </div>

                  {isEditing && (
                    <>
                      <div>
                        <label className="form-label">Banner Image (Top Page Banner)</label>
                        <div className="image-upload-wrapper">
                          {bannerPath ? (
                            <img src={bannerPath} alt="Banner Preview" className="image-preview" />
                          ) : (
                            <div style={{ width: '100px', height: '60px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b' }}>No Banner</div>
                          )}
                          <div>
                            <label className="btn-upload-label">
                              {uploadingBanner ? 'Uploading...' : 'Choose File'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleImageUpload(e.target.files[0], 'banner')}
                                disabled={uploadingBanner}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Thumbnail Image (Sidebar Image)</label>
                        <div className="image-upload-wrapper">
                          {thumbnailPath ? (
                            <img src={thumbnailPath} alt="Thumbnail Preview" className="image-preview" />
                          ) : (
                            <div style={{ width: '100px', height: '60px', borderRadius: '6px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#64748b' }}>No Thumbnail</div>
                          )}
                          <div>
                            <label className="btn-upload-label">
                              {uploadingThumbnail ? 'Uploading...' : 'Choose File'}
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleImageUpload(e.target.files[0], 'thumbnail')}
                                disabled={uploadingThumbnail}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isEditing && (
                    <div className="form-group-full" style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#475569' }}>
                      💡 Banner and thumbnail uploads will become available once the page is saved.
                    </div>
                  )}

                  <div>
                    <label className="form-label">Display Order</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Show in Navbar:</label>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={isVisible} 
                          onChange={(e) => setIsVisible(e.target.checked)} 
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label className="form-label" style={{ margin: 0 }}>Active Status:</label>
                      <label className="switch">
                        <input 
                          type="checkbox" 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)} 
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !slugAvailable}
                  style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: (loading || !slugAvailable) ? 'not-allowed' : 'pointer', fontWeight: '600' }}
                >
                  {loading ? 'Saving...' : 'Save Submenu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarMenuManager;
