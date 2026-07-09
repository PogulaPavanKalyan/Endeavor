import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SpeakerManager = () => {
  const { activeConferenceId } = useAdmin();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Pagination & Bulk delete states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [formData, setFormData] = useState({
    academicTitle: "",
    name: "",
    designation: "",
    affiliation: "",
    country: "",
    bio: "",
    type: "KEYNOTE_SPEAKER",
    researchAreas: "",
    linkedin: "",
    orcid: "",
    website: "",
    isFeatured: false,
    isActive: true,
    displayOrder: 0
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchSpeakers();
    setSelectedIds([]);
  }, [activeConferenceId]);

  const fetchSpeakers = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/speakers${qs}`);
      // Sort by displayOrder ascending
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setSpeakers(sorted);
    } catch (err) {
      setError("Failed to fetch speakers.");
    } finally {
      setLoading(false);
    }
  };

  // Filtered speakers based on search query
  const filteredSpeakers = speakers.filter(spk => 
    spk.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spk.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spk.affiliation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spk.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredSpeakers.length / itemsPerPage);
  const paginatedSpeakers = filteredSpeakers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (speaker = null) => {
    setEditingSpeaker(speaker);
    if (speaker) {
      setFormData({
        academicTitle: speaker.academicTitle || "",
        name: speaker.name || "",
        designation: speaker.designation || "",
        affiliation: speaker.affiliation || "",
        country: speaker.country || "",
        bio: speaker.bio || "",
        type: speaker.type || "KEYNOTE_SPEAKER",
        researchAreas: speaker.researchAreas || "",
        linkedin: speaker.linkedin || "",
        orcid: speaker.orcid || "",
        website: speaker.website || "",
        isFeatured: !!speaker.isFeatured,
        isActive: speaker.isActive !== false,
        displayOrder: speaker.displayOrder || 0
      });
    } else {
      setFormData({
        academicTitle: "",
        name: "",
        designation: "",
        affiliation: "",
        country: "",
        bio: "",
        type: "KEYNOTE_SPEAKER",
        researchAreas: "",
        linkedin: "",
        orcid: "",
        website: "",
        isFeatured: false,
        isActive: true,
        displayOrder: speakers.length
      });
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      setError("Please select a conference from the header dropdown first.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = { 
        ...formData,
        conferenceId: parseInt(activeConferenceId)
      };

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
      setShowModal(false);
      fetchSpeakers();
    } catch (err) {
      setError("Failed to save speaker.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this speaker?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      setSuccessMsg("Speaker deleted successfully!");
      fetchSpeakers();
    } catch (err) {
      setError("Failed to delete speaker.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${selectedIds.length} selected speakers?`)) return;
    setLoading(true);
    setError("");
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/speakers/${id}`)));
      setSuccessMsg("Selected speakers deleted successfully!");
      setSelectedIds([]);
      fetchSpeakers();
    } catch (err) {
      setError("Failed to delete some speakers.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheckbox = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const idsOnPage = paginatedSpeakers.map(s => s.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...idsOnPage])));
    } else {
      const idsOnPage = paginatedSpeakers.map(s => s.id);
      setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
    }
  };

  const handleToggleFlag = async (speaker, field) => {
    try {
      const updatedPayload = {
        ...speaker,
        [field]: !speaker[field]
      };
      await api.put(`/api/admin/speakers/${speaker.id}`, updatedPayload);
      setSpeakers(prev => prev.map(s => s.id === speaker.id ? { ...s, [field]: !speaker[field] } : s));
      setSuccessMsg(`${field} status toggled successfully.`);
    } catch (err) {
      setError("Failed to toggle status flag.");
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const list = [...speakers];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setSpeakers(list);

    try {
      const ids = list.map(item => item.id);
      await api.put("/api/admin/speakers/reorder", ids);
      setSuccessMsg("Speakers order updated successfully.");
    } catch (err) {
      setError("Failed to save speaker order.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Keynote & Invited Speakers</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage keynote, plenary, and invited speakers for the conference.
          </p>
        </div>
        <button className="btn-admin-primary" style={{boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}} onClick={() => handleOpenModal()}>
          + Add New Speaker
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {successMsg && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{successMsg}</div>}

      {/* Control bar */}
      <div className="admin-card" style={{padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px'}}>
          <span style={{fontSize: '18px'}}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, organization, designation..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px'}}
          />
        </div>
        
        {selectedIds.length > 0 && (
          <button className="btn-admin-danger" onClick={handleBulkDelete} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            🗑️ Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead style={{background: '#f8fafc'}}>
              <tr>
                <th style={{padding: '16px 20px', width: '40px'}}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={paginatedSpeakers.length > 0 && paginatedSpeakers.every(s => selectedIds.includes(s.id))}
                  />
                </th>
                <th>Photo</th>
                <th>Academic Profile</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Active</th>
                <th>Order</th>
                <th style={{padding: '16px 20px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSpeakers.map((spk, idx) => {
                const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                return (
                  <tr key={spk.id} style={{borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s'}}>
                    <td style={{padding: '16px 20px'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(spk.id)}
                        onChange={() => handleToggleCheckbox(spk.id)}
                      />
                    </td>
                    <td style={{padding: '16px 10px'}}>
                      <img 
                        src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photo?.filePath || "https://randomuser.me/api/portraits/men/32.jpg")} 
                        alt={spk.name}
                        style={{width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1'}}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }} 
                      />
                    </td>
                    <td>
                      <div style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>
                        {spk.academicTitle ? `${spk.academicTitle} ` : ''}{spk.name}
                      </div>
                      <div style={{color: '#475569', fontSize: '13px'}}>{spk.designation}</div>
                      <div style={{color: '#64748b', fontSize: '12px'}}>{spk.affiliation}, {spk.country}</div>
                      {spk.researchAreas && (
                        <div style={{marginTop: '4px'}}>
                          {spk.researchAreas.split(',').map((area, aIdx) => (
                            <span key={aIdx} style={{background: '#f1f5f9', color: '#64748b', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', marginRight: '4px'}}>
                              {area.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{
                        background: spk.type === 'KEYNOTE_SPEAKER' ? '#dbeafe' : '#f1f5f9',
                        color: spk.type === 'KEYNOTE_SPEAKER' ? '#1d4ed8' : '#475569',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {spk.type === 'KEYNOTE_SPEAKER' ? 'Keynote' : 'Invited'}
                      </span>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleToggleFlag(spk, 'isFeatured')}
                        style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}
                      >
                        {spk.isFeatured ? '⭐' : '☆'}
                      </button>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleToggleFlag(spk, 'isActive')}
                        style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}
                      >
                        {spk.isActive !== false ? '🟢' : '🔴'}
                      </button>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '4px'}}>
                        <button type="button" className="btn-admin-sm" disabled={globalIdx === 0} onClick={() => handleMoveOrder(globalIdx, -1)} style={{padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▲</button>
                        <button type="button" className="btn-admin-sm" disabled={globalIdx === speakers.length - 1} onClick={() => handleMoveOrder(globalIdx, 1)} style={{padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▼</button>
                      </div>
                    </td>
                    <td style={{padding: '16px 20px', textAlign: 'right'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(spk)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(spk.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {filteredSpeakers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    <div style={{fontSize: '24px', marginBottom: '10px'}}>🎙️</div>
                    No speakers found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div style={{padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc'}}>
            <span style={{fontSize: '13px', color: '#64748b'}}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSpeakers.length)} of {filteredSpeakers.length} entries
            </span>
            <div style={{display: 'flex', gap: '6px'}}>
              <button 
                type="button" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                style={{padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #cbd5e1',
                    background: currentPage === num ? 'var(--admin-primary, #3b82f6)' : '#fff',
                    color: currentPage === num ? '#fff' : '#0f172a',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
              <button 
                type="button" 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(p => p + 1)}
                style={{padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '680px', maxWidth: '95%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingSpeaker ? "Edit Speaker Profile" : "Add Keynote/Invited Speaker"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px 30px', overflowY: 'auto'}}>
              <form id="speakerForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{width: '120px'}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Academic Title</label>
                    <input type="text" placeholder="e.g. Prof." value={formData.academicTitle} onChange={e => setFormData({...formData, academicTitle: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="Sarah Higgins" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Designation <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="Professor of Nutrition" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Organization / University <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="University of Oxford" value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Country <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="United Kingdom" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Speaker Category <span style={{color: '#ef4444'}}>*</span></label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="KEYNOTE_SPEAKER">Keynote Speaker</option>
                      <option value="INVITED_SPEAKER">Invited Speaker</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Research Areas (comma-separated)</label>
                  <input type="text" placeholder="Food Chemistry, Toxicology, Dairy Science" value={formData.researchAreas} onChange={e => setFormData({...formData, researchAreas: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>LinkedIn URL</label>
                    <input type="url" placeholder="https://linkedin.com/in/..." value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>ORCID Identifier</label>
                    <input type="text" placeholder="0000-0002-1825-0097" value={formData.orcid} onChange={e => setFormData({...formData, orcid: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Personal Website</label>
                    <input type="url" placeholder="https://website.org" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Biography <span style={{color: '#ef4444'}}>*</span></label>
                  <textarea required rows="3" placeholder="Brief biography..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Profile Photo</label>
                  <div style={{border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc'}}>
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{width: '100%', fontSize: '14px', color: '#64748b'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px', marginTop: '5px'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} />
                    Featured Speaker
                  </label>
                  <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    Active Profile
                  </label>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 30px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="speakerForm" disabled={loading} style={{padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Speaker"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerManager;
