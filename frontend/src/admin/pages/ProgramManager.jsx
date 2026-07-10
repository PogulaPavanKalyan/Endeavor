import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const ProgramManager = () => {
  const { activeConferenceId } = useAdmin();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'items'

  // ======== CATEGORIES STATE ========
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    categoryName: '', status: true, displayOrder: 0
  });

  // ======== PROGRAM ITEMS STATE ========
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    categoryId: '', title: '', description: '', date: '', startTime: '', endTime: '', 
    venue: '', speakers: '', chairPerson: '', displayOrder: 0, status: true
  });
  
  const [selectedCategoryIdForItems, setSelectedCategoryIdForItems] = useState('');

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (activeConferenceId) {
      fetchCategories();
    } else {
      setCategories([]);
      setItems([]);
    }
  }, [activeConferenceId]);

  useEffect(() => {
    if (activeTab === 'items' && selectedCategoryIdForItems) {
      fetchItems(selectedCategoryIdForItems);
    }
  }, [activeTab, selectedCategoryIdForItems]);

  // ======== CATEGORIES LOGIC ========
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.get(`/api/admin/program-categories?conferenceId=${activeConferenceId}`);
      setCategories(data || []);
      if (data && data.length > 0 && !selectedCategoryIdForItems) {
        setSelectedCategoryIdForItems(data[0].id.toString());
      }
    } catch (err) {
      setError("Failed to fetch categories.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    if (cat) {
      setCategoryFormData({ categoryName: cat.categoryName, status: cat.status, displayOrder: cat.displayOrder });
    } else {
      setCategoryFormData({ categoryName: '', status: true, displayOrder: categories.length });
    }
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) return;
    setLoadingCategories(true);
    try {
      const payload = { ...categoryFormData, conferenceId: parseInt(activeConferenceId) };
      if (editingCategory) {
        await api.put(`/api/admin/program-categories/${editingCategory.id}`, payload);
      } else {
        await api.post("/api/admin/program-categories", payload);
      }
      setSuccessMsg("Category saved successfully!");
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      setError("Failed to save category.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/api/admin/program-categories/${id}`);
      setSuccessMsg("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      setError("Cannot delete default categories or categories that contain program items.");
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      const payload = { ...cat, status: !cat.status };
      await api.put(`/api/admin/program-categories/${cat.id}`, payload);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: !cat.status } : c));
      setSuccessMsg("Category status toggled.");
    } catch (err) {
      setError("Failed to toggle status.");
    }
  };

  // ======== PROGRAM ITEMS LOGIC ========
  const fetchItems = async (catId) => {
    if (!catId) return;
    setLoadingItems(true);
    try {
      const data = await api.get(`/api/admin/program-items?categoryId=${catId}`);
      setItems(data || []);
    } catch (err) {
      setError("Failed to fetch program items.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleOpenItemModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setItemFormData({
        categoryId: item.categoryId || selectedCategoryIdForItems,
        title: item.title || "", description: item.description || "", date: item.date || "",
        startTime: item.startTime || "", endTime: item.endTime || "", venue: item.venue || "",
        speakers: item.speakers || "", chairPerson: item.chairPerson || "", 
        displayOrder: item.displayOrder || 0, status: item.status !== false
      });
    } else {
      setItemFormData({
        categoryId: selectedCategoryIdForItems || (categories.length > 0 ? categories[0].id : ''),
        title: "", description: "", date: "", startTime: "", endTime: "", venue: "",
        speakers: "", chairPerson: "", displayOrder: items.length, status: true
      });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) return;
    setLoadingItems(true);
    try {
      const payload = { ...itemFormData, conferenceId: parseInt(activeConferenceId) };
      if (editingItem) {
        await api.put(`/api/admin/program-items/${editingItem.id}`, payload);
      } else {
        await api.post("/api/admin/program-items", payload);
      }
      setSuccessMsg("Program item saved successfully!");
      setShowItemModal(false);
      fetchItems(itemFormData.categoryId);
      fetchCategories(); // Refresh counts
    } catch (err) {
      setError("Failed to save program item.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/api/admin/program-items/${id}`);
      setSuccessMsg("Item deleted!");
      fetchItems(selectedCategoryIdForItems);
      fetchCategories();
    } catch (err) {
      setError("Failed to delete item.");
    }
  };

  const handleToggleItemStatus = async (item) => {
    try {
      const payload = { ...item, status: !item.status };
      await api.put(`/api/admin/program-items/${item.id}`, payload);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: !item.status } : i));
      setSuccessMsg("Item status toggled.");
      fetchCategories();
    } catch (err) {
      setError("Failed to toggle item status.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Program Management</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage program categories and schedule items dynamically.
          </p>
        </div>
      </div>

      <div className="admin-tabs" style={{display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0'}}>
        <button 
          onClick={() => setActiveTab('categories')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'categories' ? '2px solid #3b82f6' : 'none', color: activeTab === 'categories' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Manage Categories
        </button>
        <button 
          onClick={() => setActiveTab('items')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'items' ? '2px solid #3b82f6' : 'none', color: activeTab === 'items' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Manage Program Items
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      {successMsg && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{successMsg}</div>}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
            <button className="btn-admin-primary" onClick={() => handleOpenCategoryModal()}>+ Add Program Category</button>
          </div>
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Category Name</th>
                  <th>Total Items</th>
                  <th>Active Items</th>
                  <th>Visible on Website</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const isVisible = cat.status && cat.activeItemCount > 0;
                  return (
                    <tr key={cat.id}>
                      <td style={{fontWeight: '600', color: '#0f172a'}}>
                        {cat.categoryName} {cat.isDefault && <span style={{fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>Default</span>}
                      </td>
                      <td>{cat.totalItemCount || 0}</td>
                      <td>{cat.activeItemCount || 0}</td>
                      <td>
                        <span style={{color: isVisible ? '#15803d' : '#b91c1c', fontWeight: '500'}}>
                          {isVisible ? 'Yes' : 'No'}
                        </span>
                        <div style={{fontSize: '11px', color: '#64748b', marginTop: '2px'}}>
                          (Status: <button onClick={() => handleToggleCategoryStatus(cat)} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',padding:0,fontSize:'11px'}}>{cat.status ? 'Active' : 'Disabled'}</button>)
                        </div>
                      </td>
                      <td>
                        <button className="btn-action-edit" onClick={() => handleOpenCategoryModal(cat)}>Edit</button>
                        {!cat.isDefault && (
                          <button className="btn-action-delete" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {categories.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No categories found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ITEMS TAB */}
      {activeTab === 'items' && (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{fontWeight: '500'}}>Select Category:</span>
              <select 
                value={selectedCategoryIdForItems} 
                onChange={(e) => setSelectedCategoryIdForItems(e.target.value)}
                style={{padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1'}}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
              </select>
            </div>
            <button className="btn-admin-primary" onClick={() => handleOpenItemModal()}>+ Add Program Item</button>
          </div>
          
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Time / Date</th>
                  <th>Title & Info</th>
                  <th>Speakers</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td style={{whiteSpace: 'nowrap'}}>
                      <div style={{fontWeight: '600'}}>{item.startTime} {item.endTime ? `- ${item.endTime}` : ''}</div>
                      <div style={{fontSize: '12px', color: '#64748b'}}>{item.date}</div>
                    </td>
                    <td>
                      <div style={{fontWeight: '600', color: '#0f172a'}}>{item.title}</div>
                      {item.venue && <div style={{fontSize: '12px', color: '#475569'}}>📍 {item.venue}</div>}
                    </td>
                    <td>
                      {item.speakers && <div style={{fontSize: '13px'}}>{item.speakers}</div>}
                      {item.chairPerson && <div style={{fontSize: '12px', color: '#64748b'}}>Chair: {item.chairPerson}</div>}
                    </td>
                    <td>
                      <button onClick={() => handleToggleItemStatus(item)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}>
                        {item.status ? '🟢' : '🔴'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-action-edit" onClick={() => handleOpenItemModal(item)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No items found for this category.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal-content" style={{background: '#fff', padding: '24px', borderRadius: '12px', width: '500px', maxWidth: '95%'}}>
            <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
            <form onSubmit={handleSaveCategory} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              <div>
                <label>Category Name</label>
                <input type="text" value={categoryFormData.categoryName} onChange={e => setCategoryFormData({...categoryFormData, categoryName: e.target.value})} required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={loadingCategories}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM MODAL */}
      {showItemModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal-content" style={{background: '#fff', padding: '24px', borderRadius: '12px', width: '600px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>{editingItem ? "Edit Program Item" : "Add Program Item"}</h3>
            <form onSubmit={handleSaveItem} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              
              <div>
                <label>Category</label>
                <select value={itemFormData.categoryId} onChange={e => setItemFormData({...itemFormData, categoryId: e.target.value})} required style={{width: '100%', padding: '8px', marginTop: '4px'}}>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Title</label>
                <input type="text" value={itemFormData.title} onChange={e => setItemFormData({...itemFormData, title: e.target.value})} required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>

              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label>Date</label>
                  <input type="text" value={itemFormData.date} onChange={e => setItemFormData({...itemFormData, date: e.target.value})} placeholder="e.g. October 15, 2026" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
                <div style={{flex: 1}}>
                  <label>Venue / Hall</label>
                  <input type="text" value={itemFormData.venue} onChange={e => setItemFormData({...itemFormData, venue: e.target.value})} placeholder="e.g. Main Hall A" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label>Start Time</label>
                  <input type="text" value={itemFormData.startTime} onChange={e => setItemFormData({...itemFormData, startTime: e.target.value})} placeholder="09:00 AM" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
                <div style={{flex: 1}}>
                  <label>End Time</label>
                  <input type="text" value={itemFormData.endTime} onChange={e => setItemFormData({...itemFormData, endTime: e.target.value})} placeholder="10:30 AM" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
              </div>

              <div>
                <label>Speakers</label>
                <input type="text" value={itemFormData.speakers} onChange={e => setItemFormData({...itemFormData, speakers: e.target.value})} placeholder="e.g. Dr. John Doe, Prof. Jane Smith" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>

              <div>
                <label>Chair Person</label>
                <input type="text" value={itemFormData.chairPerson} onChange={e => setItemFormData({...itemFormData, chairPerson: e.target.value})} style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>

              <div>
                <label>Description (Optional)</label>
                <textarea value={itemFormData.description} onChange={e => setItemFormData({...itemFormData, description: e.target.value})} rows="3" style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={loadingItems}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;
