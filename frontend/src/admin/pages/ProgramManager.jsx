import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const ProgramManager = () => {
  const { confirmDialog, alertDialog, toast } = useAdminDialog();
  const { activeConferenceId } = useAdmin();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'items'

  // ======== CATEGORIES STATE ========
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    categoryName: '',
    status: true,
    displayOrder: 0
  });

  // ======== PROGRAM ITEMS STATE ========
  const [selectedCategoryIdForItems, setSelectedCategoryIdForItems] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    categoryId: '', title: '', description: '', date: '', startTime: '', endTime: '',
    venue: '', speakers: '', chairPerson: '', displayOrder: 0, status: true
  });

  useEffect(() => {
    if (activeConferenceId) {
      fetchCategories();
    } else {
      setCategories([]);
      setItems([]);
    }
  }, [activeConferenceId]);

  // ======== CATEGORIES LOGIC ========
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.get(`/api/admin/program-categories?conferenceId=${activeConferenceId}`);
      setCategories(data || []);
      if (data && data.length > 0 && !selectedCategoryIdForItems) {
        setSelectedCategoryIdForItems(data[0].id);
        fetchItems(data[0].id);
      }
    } catch (err) {
      toast.error("Failed to fetch categories.");
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
        toast.success("✓ Program category updated successfully!");
      } else {
        await api.post("/api/admin/program-categories", payload);
        toast.success("✓ Program category created successfully!");
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save category.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this category?", "Delete Category"))) return;
    try {
      await api.delete(`/api/admin/program-categories/${id}`);
      toast.success("✓ Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      toast.error("Cannot delete default categories or categories that contain program items.");
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      const payload = { ...cat, status: !cat.status };
      await api.put(`/api/admin/program-categories/${cat.id}`, payload);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: !cat.status } : c));
      toast.success("✓ Category status updated.");
    } catch (err) {
      toast.error("Failed to toggle status.");
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
      toast.error("Failed to fetch program items.");
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
        toast.success("✓ Program item updated successfully!");
      } else {
        await api.post("/api/admin/program-items", payload);
        toast.success("✓ Program session added successfully!");
      }
      setShowItemModal(false);
      fetchItems(itemFormData.categoryId);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save program item.");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this program item?", "Delete Program Item"))) return;
    try {
      await api.delete(`/api/admin/program-items/${id}`);
      toast.success("✓ Program item deleted successfully!");
      fetchItems(selectedCategoryIdForItems);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete program item.");
    }
  };

  const handleToggleItemStatus = async (item) => {
    try {
      const payload = { ...item, status: !item.status };
      await api.put(`/api/admin/program-items/${item.id}`, payload);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: !item.status } : i));
      toast.success("✓ Item status toggled.");
    } catch (err) {
      toast.error("Failed to toggle item status.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Program Management</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage program categories and scientific session items.
          </p>
        </div>
      </div>

      <div className="admin-tabs" style={{display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0'}}>
        <button 
          onClick={() => setActiveTab('categories')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'categories' ? '2px solid #3b82f6' : 'none', color: activeTab === 'categories' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Program Categories
        </button>
        <button 
          onClick={() => setActiveTab('items')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'items' ? '2px solid #3b82f6' : 'none', color: activeTab === 'items' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Program Items
        </button>
      </div>

      {activeTab === 'categories' && (
        <>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
            <button className="btn-admin-primary" onClick={() => handleOpenCategoryModal()}>+ Add Category</button>
          </div>
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Category Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{fontWeight: '600', color: '#0f172a'}}>{cat.categoryName}</td>
                    <td>
                      <button onClick={() => handleToggleCategoryStatus(cat)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}>
                        {cat.status ? '🟢' : '🔴'}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleOpenCategoryModal(cat)} style={{marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6'}}>Edit</button>
                      <button onClick={() => handleDeleteCategory(cat.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}>Delete</button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr><td colSpan="3" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No program categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'items' && (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <select 
              value={selectedCategoryIdForItems || ''} 
              onChange={e => { setSelectedCategoryIdForItems(e.target.value); fetchItems(e.target.value); }}
              className="admin-form-input" 
              style={{width: '260px', margin: 0}}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
            </select>
            <button className="btn-admin-primary" onClick={() => handleOpenItemModal()}>+ Add Program Item</button>
          </div>
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Title</th>
                  <th>Time / Venue</th>
                  <th>Speaker / Chair</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{fontWeight: '600', color: '#0f172a'}}>{item.title}</td>
                    <td>{item.startTime} - {item.endTime} ({item.venue || 'N/A'})</td>
                    <td>{item.speakers || item.chairPerson || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleToggleItemStatus(item)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}>
                        {item.status ? '🟢' : '🔴'}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleOpenItemModal(item)} style={{marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6'}}>Edit</button>
                      <button onClick={() => handleDeleteItem(item.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}>Delete</button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No program items found for this category.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '400px', width: '100%'}}>
            <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSaveCategory} style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div>
                <label>Category Name *</label>
                <input 
                  type="text" 
                  required 
                  value={categoryFormData.categoryName} 
                  onChange={e => setCategoryFormData({ ...categoryFormData, categoryName: e.target.value })} 
                  className="admin-form-input" 
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" disabled={loadingCategories} className="btn-admin-primary">
                  {loadingCategories ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ITEM MODAL */}
      {showItemModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>{editingItem ? 'Edit Program Item' : 'Add Program Item'}</h3>
            <form onSubmit={handleSaveItem} style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div>
                <label>Title *</label>
                <input type="text" required value={itemFormData.title} onChange={e => setItemFormData({...itemFormData, title: e.target.value})} className="admin-form-input" />
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div>
                  <label>Start Time</label>
                  <input type="text" value={itemFormData.startTime} onChange={e => setItemFormData({...itemFormData, startTime: e.target.value})} className="admin-form-input" placeholder="09:00 AM" />
                </div>
                <div>
                  <label>End Time</label>
                  <input type="text" value={itemFormData.endTime} onChange={e => setItemFormData({...itemFormData, endTime: e.target.value})} className="admin-form-input" placeholder="10:30 AM" />
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div>
                  <label>Speakers</label>
                  <input type="text" value={itemFormData.speakers} onChange={e => setItemFormData({...itemFormData, speakers: e.target.value})} className="admin-form-input" />
                </div>
                <div>
                  <label>Venue / Hall</label>
                  <input type="text" value={itemFormData.venue} onChange={e => setItemFormData({...itemFormData, venue: e.target.value})} className="admin-form-input" />
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowItemModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" disabled={loadingItems} className="btn-admin-primary">
                  {loadingItems ? "Saving..." : "Save Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramManager;
