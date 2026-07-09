import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import './NavigationManager.css';

const NavigationManager = ({ activeConfId }) => {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    menuName: '',
    slug: '',
    url: '',
    parentId: '',
    icon: '',
    openInNewTab: false,
    status: true,
    displayOrder: 0
  });

  useEffect(() => {
    if (activeConfId) {
      fetchNavigation();
    }
  }, [activeConfId]);

  const fetchNavigation = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/navigation?conferenceId=${activeConfId}`);
      setNavItems(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch navigation items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      await api.post(`/api/navigation/auto-generate?conferenceId=${activeConfId}`);
      await fetchNavigation();
      alert("Default navigation generated successfully!");
    } catch (err) {
      alert("Failed to auto-generate navigation.");
      console.error(err);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditMode(true);
      setFormData({
        id: item.id,
        menuName: item.menuName || '',
        slug: item.slug || '',
        url: item.url || '',
        parentId: item.parentId || '',
        icon: item.icon || '',
        openInNewTab: item.openInNewTab || false,
        status: item.status !== false,
        displayOrder: item.displayOrder || 0
      });
    } else {
      setEditMode(false);
      setFormData({
        id: null,
        menuName: '',
        slug: '',
        url: '',
        parentId: '',
        icon: '',
        openInNewTab: false,
        status: true,
        displayOrder: navItems.length + 1
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, conferenceId: activeConfId };
      if (!payload.parentId) payload.parentId = null; // ensure null if empty

      if (editMode) {
        await api.put(`/api/navigation/${payload.id}`, payload);
      } else {
        await api.post('/api/navigation', payload);
      }
      handleCloseModal();
      fetchNavigation();
    } catch (err) {
      alert("Failed to save menu item");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        await api.delete(`/api/navigation/${id}`);
        fetchNavigation();
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const moveItem = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === navItems.length - 1) return;

    const newItems = [...navItems];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap displayOrders
    const tempOrder = newItems[index].displayOrder;
    newItems[index].displayOrder = newItems[swapIndex].displayOrder;
    newItems[swapIndex].displayOrder = tempOrder;

    // Swap positions in array for UI update before fetch
    const temp = newItems[index];
    newItems[index] = newItems[swapIndex];
    newItems[swapIndex] = temp;

    setNavItems(newItems);

    try {
      await api.post('/api/navigation/reorder', newItems);
    } catch (err) {
      alert("Failed to reorder");
      fetchNavigation(); // revert
    }
  };

  // Build tree structure for display
  const renderNavTree = () => {
    const rootItems = navItems.filter(i => !i.parentId).sort((a,b) => a.displayOrder - b.displayOrder);
    return rootItems.map((parent, pIndex) => {
      const children = navItems.filter(i => i.parentId === parent.id).sort((a,b) => a.displayOrder - b.displayOrder);
      
      return (
        <div key={parent.id} className="nav-tree-item">
          <div className="nav-tree-row parent-row">
            <div className="nav-tree-info">
              <strong>{parent.menuName}</strong>
              <span className="nav-tree-url">{parent.url || 'Dropdown'}</span>
              {!parent.status && <span className="nav-badge inactive">Inactive</span>}
            </div>
            <div className="nav-tree-actions">
              <button className="nav-btn-icon" onClick={() => moveItem(navItems.findIndex(i => i.id === parent.id), 'up')}>↑</button>
              <button className="nav-btn-icon" onClick={() => moveItem(navItems.findIndex(i => i.id === parent.id), 'down')}>↓</button>
              <button className="nav-btn-edit" onClick={() => handleOpenModal(parent)}>Edit</button>
              <button className="nav-btn-delete" onClick={() => handleDelete(parent.id)}>Delete</button>
            </div>
          </div>
          
          {children.length > 0 && (
            <div className="nav-tree-children">
              {children.map(child => (
                <div key={child.id} className="nav-tree-row child-row">
                  <div className="nav-tree-info">
                    <span>↳ {child.menuName}</span>
                    <span className="nav-tree-url">{child.url}</span>
                    {!child.status && <span className="nav-badge inactive">Inactive</span>}
                  </div>
                  <div className="nav-tree-actions">
                    <button className="nav-btn-edit" onClick={() => handleOpenModal(child)}>Edit</button>
                    <button className="nav-btn-delete" onClick={() => handleDelete(child.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="navigation-manager">
      <div className="nav-header">
        <h2>Conference Navigation Manager</h2>
        <div className="nav-header-actions">
          <button className="btn-auto-generate" onClick={handleAutoGenerate}>Auto-Generate Defaults</button>
          <button className="btn-add-menu" onClick={() => handleOpenModal()}>+ Add Menu Item</button>
        </div>
      </div>
      
      {error && <div className="error-msg">{error}</div>}

      <div className="nav-tree-container">
        {navItems.length === 0 ? (
          <div className="empty-state">No navigation items found. Click Auto-Generate to get started!</div>
        ) : (
          renderNavTree()
        )}
      </div>

      {showModal && (
        <div className="nav-modal-overlay">
          <div className="nav-modal">
            <h3>{editMode ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Menu Name *</label>
                <input type="text" value={formData.menuName} onChange={e => setFormData({...formData, menuName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>URL (or Hash like #speakers) *</label>
                <input type="text" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="e.g. #speakers or /about" />
              </div>
              <div className="form-group">
                <label>Slug (internal identifier)</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Parent Menu</label>
                <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})}>
                  <option value="">None (Top Level)</option>
                  {navItems.filter(i => !i.parentId && i.id !== formData.id).map(p => (
                    <option key={p.id} value={p.id}>{p.menuName}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>
                  <input type="checkbox" checked={formData.openInNewTab} onChange={e => setFormData({...formData, openInNewTab: e.target.checked})} />
                  Open in New Tab
                </label>
                <label>
                  <input type="checkbox" checked={formData.status} onChange={e => setFormData({...formData, status: e.target.checked})} />
                  Is Active
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-save">Save Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
