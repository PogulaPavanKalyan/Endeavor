import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SpeakerManager = () => {
  const { confirmDialog, alertDialog, toast } = useAdminDialog();
  const { activeConferenceId } = useAdmin();
  const [activeTab, setActiveTab] = useState('speakers'); // 'speakers' or 'categories'

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

  // ======== SPEAKERS STATE ========
  const [speakers, setSpeakers] = useState([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerFormData, setSpeakerFormData] = useState({
    academicTitle: "", name: "", designation: "", affiliation: "", country: "", bio: "",
    categoryId: "", researchAreas: "", linkedin: "", orcid: "", website: "",
    isFeatured: false, isActive: true, displayOrder: 0
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    if (activeConferenceId) {
      fetchCategories();
      fetchSpeakers();
    } else {
      setCategories([]);
      setSpeakers([]);
    }
    setSelectedIds([]);
  }, [activeConferenceId]);

  // ======== CATEGORIES LOGIC ========
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.get(`/api/admin/speaker-categories?conferenceId=${activeConferenceId}`);
      setCategories(data || []);
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
        await api.put(`/api/admin/speaker-categories/${editingCategory.id}`, payload);
        toast.success("✓ Category updated successfully!");
      } else {
        await api.post("/api/admin/speaker-categories", payload);
        toast.success("✓ Category created successfully!");
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
      await api.delete(`/api/admin/speaker-categories/${id}`);
      toast.success("✓ Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      toast.error("Cannot delete default system categories or categories with speakers.");
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      const payload = { ...cat, status: !cat.status };
      await api.put(`/api/admin/speaker-categories/${cat.id}`, payload);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: !cat.status } : c));
      toast.success("✓ Category status updated.");
    } catch (err) {
      toast.error("Failed to toggle status.");
    }
  };

  // ======== SPEAKERS LOGIC ========
  const fetchSpeakers = async () => {
    setLoadingSpeakers(true);
    try {
      const data = await api.get(`/api/speakers?conferenceId=${activeConferenceId}`);
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSpeakers(sorted);
    } catch (err) {
      toast.error("Failed to fetch speakers.");
    } finally {
      setLoadingSpeakers(false);
    }
  };

  const handleOpenSpeakerModal = (speaker = null) => {
    setEditingSpeaker(speaker);
    if (speaker) {
      setSpeakerFormData({
        academicTitle: speaker.academicTitle || "", name: speaker.name || "", designation: speaker.designation || "",
        affiliation: speaker.affiliation || "", country: speaker.country || "", bio: speaker.bio || "",
        categoryId: speaker.categoryId || "", researchAreas: speaker.researchAreas || "",
        linkedin: speaker.linkedin || "", orcid: speaker.orcid || "", website: speaker.website || "",
        isFeatured: !!speaker.isFeatured, isActive: speaker.isActive !== false, displayOrder: speaker.displayOrder || 0
      });
    } else {
      setSpeakerFormData({
        academicTitle: "", name: "", designation: "", affiliation: "", country: "", bio: "",
        categoryId: categories.length > 0 ? categories[0].id : "", researchAreas: "",
        linkedin: "", orcid: "", website: "", isFeatured: false, isActive: true, displayOrder: speakers.length
      });
    }
    setPhotoFile(null);
    setShowSpeakerModal(true);
  };

  const handleSaveSpeaker = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      toast.warning("Select a conference first."); return;
    }
    setLoadingSpeakers(true);
    try {
      const payload = { ...speakerFormData, conferenceId: parseInt(activeConferenceId) };
      let savedSpeaker;
      if (editingSpeaker) {
        savedSpeaker = await api.put(`/api/admin/speakers/${editingSpeaker.id}`, payload);
      } else {
        savedSpeaker = await api.post("/api/admin/speakers", payload);
      }

      if (photoFile && savedSpeaker.id) {
        const fileData = new FormData();
        fileData.append("file", photoFile);
        await api.postMultipart(`/api/admin/speakers/${savedSpeaker.id}/photo`, fileData);
      }
      toast.success(editingSpeaker ? "✓ Speaker updated successfully!" : "✓ Speaker added successfully!");
      setShowSpeakerModal(false);
      fetchSpeakers();
      fetchCategories();
    } catch (err) {
      toast.error("Failed to save speaker.");
    } finally {
      setLoadingSpeakers(false);
    }
  };

  const handleDeleteSpeaker = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this speaker?", "Delete Speaker"))) return;
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      toast.success("✓ Speaker deleted successfully!");
      fetchSpeakers();
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete speaker.");
    }
  };

  // Helper arrays for UI
  const filteredSpeakers = speakers.filter(spk => 
    spk.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spk.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSpeakers.length / itemsPerPage);
  const paginatedSpeakers = filteredSpeakers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getCategoryName = (spk) => {
    if (spk.categoryId) {
      const cat = categories.find(c => c.id.toString() === spk.categoryId.toString());
      if (cat) return cat.categoryName;
    }
    if (spk.type) {
      return spk.type.replace('_', ' ');
    }
    return 'Unknown';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Speaker Management</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage speakers and their categories dynamically.
          </p>
        </div>
      </div>

      <div className="admin-tabs" style={{display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0'}}>
        <button 
          onClick={() => setActiveTab('speakers')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'speakers' ? '2px solid #3b82f6' : 'none', color: activeTab === 'speakers' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Manage Speakers
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          style={{padding: '10px 15px', background: 'none', border: 'none', borderBottom: activeTab === 'categories' ? '2px solid #3b82f6' : 'none', color: activeTab === 'categories' ? '#3b82f6' : '#64748b', fontWeight: '600', cursor: 'pointer', fontSize: '15px'}}
        >
          Manage Categories
        </button>
      </div>

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <>
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
            <button className="btn-admin-primary" onClick={() => handleOpenCategoryModal()}>+ Add Speaker Category</button>
          </div>
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Category Name</th>
                  <th>Total Speakers</th>
                  <th>Active Speakers</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{fontWeight: '600', color: '#0f172a'}}>
                      {cat.categoryName} {cat.isDefault && <span style={{fontSize: '11px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>Default</span>}
                    </td>
                    <td>{cat.totalSpeakerCount || 0}</td>
                    <td>{cat.activeSpeakerCount || 0}</td>
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
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No categories found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SPEAKERS TAB */}
      {activeTab === 'speakers' && (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
            <input 
              type="text" 
              placeholder="Search speakers..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              className="admin-form-input" 
              style={{width: '260px', margin: 0}}
            />
            <button className="btn-admin-primary" onClick={() => handleOpenSpeakerModal()}>+ Add Speaker</button>
          </div>
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Speaker</th>
                  <th>Designation / Affiliation</th>
                  <th>Category</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSpeakers.map((spk) => (
                  <tr key={spk.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {spk.photoUrl ? (
                          <img src={`${BASE_URL}${spk.photoUrl}`} alt={spk.name} style={{width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover'}} />
                        ) : (
                          <div style={{width: '36px', height: '36px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                            {spk.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <strong>{spk.academicTitle} {spk.name}</strong>
                          {spk.isFeatured && <span style={{fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '2px 4px', borderRadius: '4px', marginLeft: '6px'}}>Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{spk.designation}</div>
                      <small style={{color: '#64748b'}}>{spk.affiliation}</small>
                    </td>
                    <td>{getCategoryName(spk)}</td>
                    <td>{spk.country}</td>
                    <td>
                      <button onClick={() => handleOpenSpeakerModal(spk)} style={{marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6'}}>Edit</button>
                      <button onClick={() => handleDeleteSpeaker(spk.id)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}>Delete</button>
                    </td>
                  </tr>
                ))}
                {paginatedSpeakers.length === 0 && (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>No speakers found.</td></tr>
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

      {/* SPEAKER MODAL */}
      {showSpeakerModal && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#fff', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>{editingSpeaker ? 'Edit Speaker' : 'Add Speaker'}</h3>
            <form onSubmit={handleSaveSpeaker} style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px'}}>
                <div>
                  <label>Title</label>
                  <input type="text" value={speakerFormData.academicTitle} onChange={e => setSpeakerFormData({...speakerFormData, academicTitle: e.target.value})} className="admin-form-input" placeholder="Prof. / Dr." />
                </div>
                <div>
                  <label>Full Name *</label>
                  <input type="text" required value={speakerFormData.name} onChange={e => setSpeakerFormData({...speakerFormData, name: e.target.value})} className="admin-form-input" />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div>
                  <label>Designation</label>
                  <input type="text" value={speakerFormData.designation} onChange={e => setSpeakerFormData({...speakerFormData, designation: e.target.value})} className="admin-form-input" />
                </div>
                <div>
                  <label>Affiliation / University</label>
                  <input type="text" value={speakerFormData.affiliation} onChange={e => setSpeakerFormData({...speakerFormData, affiliation: e.target.value})} className="admin-form-input" />
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                <div>
                  <label>Category</label>
                  <select value={speakerFormData.categoryId} onChange={e => setSpeakerFormData({...speakerFormData, categoryId: e.target.value})} className="admin-form-input">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                  </select>
                </div>
                <div>
                  <label>Country</label>
                  <input type="text" value={speakerFormData.country} onChange={e => setSpeakerFormData({...speakerFormData, country: e.target.value})} className="admin-form-input" />
                </div>
              </div>

              <div>
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="admin-form-input" />
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px'}}>
                <button type="button" onClick={() => setShowSpeakerModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" disabled={loadingSpeakers} className="btn-admin-primary">
                  {loadingSpeakers ? "Saving..." : "Save Speaker"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerManager;
