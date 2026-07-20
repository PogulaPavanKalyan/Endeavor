import { useAdminDialog } from '../components/AdminDialogContext';
import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SpeakerManager = () => {
  const { confirmDialog, alertDialog } = useAdminDialog();

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
        await api.put(`/api/admin/speaker-categories/${editingCategory.id}`, payload);
        setSuccessMsg("Category updated successfully!");
      } else {
        await api.post("/api/admin/speaker-categories", payload);
        setSuccessMsg("Category created successfully!");
      }
      setShowCategoryModal(false);
      fetchCategories();
    } catch (err) {
      setError("Failed to save category.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this category?"))) return;
    try {
      await api.delete(`/api/admin/speaker-categories/${id}`);
      setSuccessMsg("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      setError("Cannot delete default system categories or categories with speakers.");
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      const payload = { ...cat, status: !cat.status };
      await api.put(`/api/admin/speaker-categories/${cat.id}`, payload);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: !cat.status } : c));
      setSuccessMsg("Category status toggled.");
    } catch (err) {
      setError("Failed to toggle status.");
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
      setError("Failed to fetch speakers.");
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
      setError("Select a conference first."); return;
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
      setSuccessMsg(editingSpeaker ? "Speaker updated successfully!" : "Speaker created successfully!");
      setShowSpeakerModal(false);
      fetchSpeakers();
      fetchCategories(); // To update the speaker counts
    } catch (err) {
      setError("Failed to save speaker.");
    } finally {
      setLoadingSpeakers(false);
    }
  };

  const handleDeleteSpeaker = async (id) => {
    if (!(await confirmDialog("Are you sure?"))) return;
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      setSuccessMsg("Speaker deleted!");
      fetchSpeakers();
      fetchCategories();
    } catch (err) {
      setError("Failed to delete speaker.");
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

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      {successMsg && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{successMsg}</div>}

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
                {categories.map((cat, idx) => (
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
                      <button className="btn-action-edit" onClick={() => handleOpenCategoryModal(cat)}>Edit</button>
                      {!cat.isDefault && (
                        <button className="btn-action-delete" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>No categories found.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SPEAKERS TAB */}
      {activeTab === 'speakers' && (
        <>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '400px'}}>
              <input type="text" placeholder="Search speakers..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
            </div>
            <button className="btn-admin-primary" onClick={() => handleOpenSpeakerModal()}>+ Add New Speaker</button>
          </div>
          
          <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th>Photo</th>
                  <th>Speaker Info</th>
                  <th>Category</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSpeakers.map(spk => (
                  <tr key={spk.id}>
                    <td style={{padding: '16px 10px'}}>
                      <img src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg")} alt="Speaker" style={{width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover'}} />
                    </td>
                    <td>
                      <div style={{fontWeight: '600'}}>{spk.academicTitle ? spk.academicTitle + ' ' : ''}{spk.name}</div>
                      <div style={{fontSize: '13px', color: '#475569'}}>{spk.designation}, {spk.affiliation}</div>
                    </td>
                    <td>
                      <span style={{background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'}}>
                        {getCategoryName(spk)}
                      </span>
                    </td>
                    <td>{spk.isActive ? '🟢' : '🔴'}</td>
                    <td>
                      <button className="btn-action-edit" onClick={() => handleOpenSpeakerModal(spk)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDeleteSpeaker(spk.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
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

      {/* SPEAKER MODAL */}
      {showSpeakerModal && (
        <div className="modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="modal-content" style={{background: '#fff', padding: '24px', borderRadius: '12px', width: '700px', maxWidth: '95%', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3>{editingSpeaker ? "Edit Speaker" : "Add Speaker"}</h3>
            <form onSubmit={handleSaveSpeaker} style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px'}}>
              
              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label>Title</label>
                  <input type="text" value={speakerFormData.academicTitle} onChange={e => setSpeakerFormData({...speakerFormData, academicTitle: e.target.value})} placeholder="Dr., Prof." style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
                <div style={{flex: 2}}>
                  <label>Name</label>
                  <input type="text" value={speakerFormData.name} onChange={e => setSpeakerFormData({...speakerFormData, name: e.target.value})} required style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
              </div>

              <div>
                <label>Speaker Category</label>
                <select value={speakerFormData.categoryId} onChange={e => setSpeakerFormData({...speakerFormData, categoryId: e.target.value})} required style={{width: '100%', padding: '8px', marginTop: '4px'}}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.categoryName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Designation</label>
                <input type="text" value={speakerFormData.designation} onChange={e => setSpeakerFormData({...speakerFormData, designation: e.target.value})} style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>
              
              <div style={{display: 'flex', gap: '15px'}}>
                <div style={{flex: 1}}>
                  <label>Affiliation / University</label>
                  <input type="text" value={speakerFormData.affiliation} onChange={e => setSpeakerFormData({...speakerFormData, affiliation: e.target.value})} style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
                <div style={{flex: 1}}>
                  <label>Country</label>
                  <input type="text" value={speakerFormData.country} onChange={e => setSpeakerFormData({...speakerFormData, country: e.target.value})} style={{width: '100%', padding: '8px', marginTop: '4px'}} />
                </div>
              </div>

              <div>
                <label>Photo</label>
                <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{width: '100%', padding: '8px', marginTop: '4px'}} />
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowSpeakerModal(false)} className="btn-admin-secondary">Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={loadingSpeakers}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerManager;
