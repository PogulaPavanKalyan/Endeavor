import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const CommitteeManager = () => {
  const { activeConferenceId } = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "", role: "Organizing Committee", institution: "", country: "", photoUrl: "", displayOrder: 0
  });

  useEffect(() => {
    fetchMembers();
  }, [activeConferenceId]);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/committee${qs}`);
      setMembers(data || []);
    } catch (err) {
      setError("Failed to fetch committee members.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    setEditingMember(member);
    if (member) {
      setFormData({
        name: member.name || "",
        role: member.role || "Organizing Committee",
        institution: member.institution || "",
        country: member.country || "",
        photoUrl: member.photoUrl || "",
        displayOrder: member.displayOrder || 0
      });
    } else {
      setFormData({ name: "", role: "Organizing Committee", institution: "", country: "", photoUrl: "", displayOrder: 0 });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = { ...formData };
      if (activeConferenceId) {
        payload.conferenceId = parseInt(activeConferenceId);
      }

      if (editingMember) {
        await api.put(`/api/admin/committee/${editingMember.id}`, payload);
        setSuccess("Committee member updated successfully!");
      } else {
        await api.post("/api/admin/committee", payload);
        setSuccess("Committee member added successfully!");
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      setError("Failed to save committee member.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this committee member?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/committee/${id}`);
      setSuccess("Committee member deleted successfully.");
      fetchMembers();
    } catch (err) {
      setError("Failed to delete committee member.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase()) ||
    m.institution?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Committee Members</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage organizing committee chairs, advisory board members, and track coordinators.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <input 
            type="text" 
            placeholder="Search members..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '240px', margin: 0}}
          />
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Member
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && members.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading committee list...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Photo</th>
                  <th>Name</th>
                  <th>Role / Designation</th>
                  <th>Institution / Country</th>
                  <th>Order</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px'}}>
                      <img 
                        src={m.photoUrl || "https://randomuser.me/api/portraits/men/32.jpg"} 
                        alt={m.name}
                        style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1'}}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }} 
                      />
                    </td>
                    <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{m.name}</td>
                    <td>
                      <span style={{
                        background: '#f1f5f9', color: '#475569',
                        padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {m.role}
                      </span>
                    </td>
                    <td>
                      <span style={{color: '#334155'}}>{m.institution}</span>
                      {m.country && <div style={{color: '#64748b', fontSize: '12px'}}>{m.country}</div>}
                    </td>
                    <td>{m.displayOrder}</td>
                    <td style={{padding: '16px 24px'}}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(m)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(m.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No committee members found for this conference.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
            background: '#fff', borderRadius: '16px', width: '550px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingMember ? "Edit Committee Member" : "Add Committee Member"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px'}}>
              <form id="memberForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. Dr. Arthur Pendelton" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Role / Track <span style={{color: '#ef4444'}}>*</span></label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="Conference Chair">Conference Chair</option>
                      <option value="Co-Chair">Co-Chair</option>
                      <option value="Organizing Committee">Organizing Committee</option>
                      <option value="Technical Committee">Technical Committee</option>
                      <option value="National Advisory Committee">National Advisory Committee</option>
                    </select>
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Institution <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. Stanford University" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Country <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="e.g. United Kingdom" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Photo URL (Optional)</label>
                    <input type="text" placeholder="https://example.com/photo.jpg" value={formData.photoUrl} onChange={e => setFormData({...formData, photoUrl: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Display Order</label>
                    <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="memberForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeManager;
