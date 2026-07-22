import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const AdvisoryBoardManager = () => {
  const { confirmDialog, alertDialog, toast } = useAdminDialog();

  const { activeConferenceId } = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Search & Pagination & Bulk delete states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedIds, setSelectedIds] = useState([]);

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    organization: "",
    country: "",
    bio: "",
    researchExpertise: "",
    imagePath: "",
    displayOrder: 0,
    isActive: true
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchMembers();
    setSelectedIds([]);
  }, [activeConferenceId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/advisory-board${qs}`);
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setMembers(sorted);
    } catch (err) {
      setError("Failed to fetch advisory board members.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (member = null) => {
    setEditingMember(member);
    if (member) {
      setFormData({
        name: member.name || "",
        designation: member.designation || "",
        organization: member.organization || "",
        country: member.country || "",
        bio: member.bio || "",
        researchExpertise: member.researchExpertise || "",
        imagePath: member.imagePath || "",
        displayOrder: member.displayOrder || 0,
        isActive: member.isActive !== false
      });
    } else {
      setFormData({
        name: "",
        designation: "",
        organization: "",
        country: "",
        bio: "",
        researchExpertise: "",
        imagePath: "",
        displayOrder: members.length,
        isActive: true
      });
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      toast.warning("Please select a conference from the header dropdown first.");
      return;
    }
    setLoading(true);

    try {
      const payload = {
        ...formData,
        conferenceId: parseInt(activeConferenceId)
      };

      let savedMember;
      if (editingMember) {
        savedMember = await api.put(`/api/admin/advisory-board/${editingMember.id}`, payload);
      } else {
        savedMember = await api.post("/api/admin/advisory-board", payload);
      }

      if (photoFile && savedMember.id) {
        const fileData = new FormData();
        fileData.append("file", photoFile);
        await api.postMultipart(`/api/admin/advisory-board/${savedMember.id}/photo`, fileData);
      }

      toast.success(editingMember ? "✓ Advisory board member updated successfully!" : "✓ Advisory board member added successfully!");
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      toast.error("Failed to save advisory board member.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this advisory board member?", "Delete Advisory Board Member"))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/advisory-board/${id}`);
      toast.success("✓ Advisory board member deleted successfully!");
      fetchMembers();
    } catch (err) {
      toast.error("Failed to delete member.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!(await confirmDialog(`Are you sure you want to delete all ${selectedIds.length} selected advisory board members?`, "Delete Selected Members"))) return;
    setLoading(true);
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/api/admin/advisory-board/${id}`)));
      toast.success("✓ Selected advisory board members deleted successfully!");
      setSelectedIds([]);
      fetchMembers();
    } catch (err) {
      toast.error("Failed to delete some members.");
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
      const idsOnPage = paginatedMembers.map(m => m.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...idsOnPage])));
    } else {
      const idsOnPage = paginatedMembers.map(m => m.id);
      setSelectedIds(prev => prev.filter(id => !idsOnPage.includes(id)));
    }
  };

  const handleToggleFlag = async (member, field) => {
    try {
      const updatedPayload = {
        ...member,
        [field]: !member[field]
      };
      await api.put(`/api/admin/advisory-board/${member.id}`, updatedPayload);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, [field]: !member[field] } : m));
      setSuccess("Status updated successfully.");
    } catch (err) {
      setError("Failed to toggle status.");
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const list = [...members];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setMembers(list);

    try {
      const ids = list.map(item => item.id);
      await api.put("/api/admin/advisory-board/reorder", ids);
      setSuccess("Order updated successfully.");
    } catch (err) {
      setError("Failed to save order.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>International Advisory Board</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage strategic advisory board members and technical session reviewers.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
          + Add Board Member
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '16px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '250px'}}>
          <span style={{fontSize: '18px'}}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, organization, expertise..." 
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px'}}
          />
        </div>
        
        {selectedIds.length > 0 && (
          <button className="btn-admin-danger" onClick={handleBulkDelete}>
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
                    checked={paginatedMembers.length > 0 && paginatedMembers.every(m => selectedIds.includes(m.id))}
                  />
                </th>
                <th>Photo</th>
                <th>Name</th>
                <th>Academic Credentials</th>
                <th>Research Expertise</th>
                <th>Active</th>
                <th>Order</th>
                <th style={{padding: '16px 20px', textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((member, idx) => {
                const globalIdx = (currentPage - 1) * itemsPerPage + idx;
                return (
                  <tr key={member.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 20px'}}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(member.id)}
                        onChange={() => handleToggleCheckbox(member.id)}
                      />
                    </td>
                    <td>
                      <img 
                        src={member.imagePath ? (member.imagePath.startsWith('http') ? member.imagePath : `${BASE_URL}${member.imagePath}`) : "https://randomuser.me/api/portraits/men/32.jpg"} 
                        alt={member.name}
                        style={{width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1'}}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }} 
                      />
                    </td>
                    <td style={{color: '#0f172a', fontWeight: '600'}}>{member.name}</td>
                    <td>
                      <div style={{fontSize: '13px', color: '#334155'}}>{member.designation}</div>
                      <div style={{fontSize: '11px', color: '#64748b'}}>{member.organization}, {member.country}</div>
                    </td>
                    <td>
                      <div style={{fontSize: '12px', color: '#64748b', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {member.researchExpertise || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <button 
                        type="button" 
                        onClick={() => handleToggleFlag(member, 'isActive')}
                        style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px'}}
                      >
                        {member.isActive !== false ? '🟢' : '🔴'}
                      </button>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '4px'}}>
                        <button type="button" className="btn-admin-sm" disabled={globalIdx === 0} onClick={() => handleMoveOrder(globalIdx, -1)} style={{padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▲</button>
                        <button type="button" className="btn-admin-sm" disabled={globalIdx === members.length - 1} onClick={() => handleMoveOrder(globalIdx, 1)} style={{padding: '4px 8px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▼</button>
                      </div>
                    </td>
                    <td style={{padding: '16px 20px', textAlign: 'right', whiteSpace: 'nowrap'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(member)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(member.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    No advisory board members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc'}}>
            <span style={{fontSize: '13px', color: '#64748b'}}>
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} entries
            </span>
            <div style={{display: 'flex', gap: '6px'}}>
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer'}}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #cbd5e1',
                    background: currentPage === num ? '#3b82f6' : '#fff',
                    color: currentPage === num ? '#fff' : '#0f172a',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {num}
                </button>
              ))}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{padding: '6px 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer'}}>Next</button>
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
            background: '#fff', borderRadius: '16px', width: '650px', maxWidth: '95%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingMember ? "Edit Board Member Profile" : "Add Board Member"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px 30px', overflowY: 'auto'}}>
              <form id="memberForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Full Name *</label>
                    <input required type="text" placeholder="Hans-Dieter Belitz" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Designation *</label>
                    <input required type="text" placeholder="Chair of Advisory Committee" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>
                
                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Organization / University *</label>
                    <input required type="text" placeholder="Technical University of Munich" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Country *</label>
                    <input required type="text" placeholder="Germany" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Research Expertise (comma-separated)</label>
                  <input type="text" placeholder="Food Chemistry, Lipids, Proteins" value={formData.researchExpertise} onChange={e => setFormData({...formData, researchExpertise: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Biography Summary</label>
                  <textarea rows="3" placeholder="Distinguished bio..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Profile Photo</label>
                  <div style={{border: '1px dashed #cbd5e1', padding: '15px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc'}}>
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{width: '100%', fontSize: '14px', color: '#64748b'}} />
                  </div>
                </div>

                <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '5px'}}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                  Active Profile (Show on Website)
                </label>
              </form>
            </div>
            
            <div style={{padding: '16px 30px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="memberForm" disabled={loading} style={{padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryBoardManager;
