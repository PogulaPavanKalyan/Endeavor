import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const SpeakerManager = () => {
  const { activeConferenceId } = useAdmin();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [formData, setFormData] = useState({
    name: "", designation: "", affiliation: "", country: "", bio: "", type: "KEYNOTE_SPEAKER"
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchSpeakers();
  }, [activeConferenceId]);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/speakers${qs}`);
      setSpeakers(data || []);
    } catch (err) {
      setError("Failed to fetch speakers.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (speaker = null) => {
    setEditingSpeaker(speaker);
    if (speaker) {
      setFormData({
        name: speaker.name || "",
        designation: speaker.designation || "",
        affiliation: speaker.affiliation || "",
        country: speaker.country || "",
        bio: speaker.bio || "",
        type: speaker.type || "KEYNOTE_SPEAKER",
      });
    } else {
      setFormData({ name: "", designation: "", affiliation: "", country: "", bio: "", type: "KEYNOTE_SPEAKER" });
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = { ...formData };
      if (activeConferenceId) {
        payload.conferenceId = parseInt(activeConferenceId);
      }

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

      setSuccessMsg(editingSpeaker ? "Speaker updated!" : "Speaker created!");
      setShowModal(false);
      fetchSpeakers();
    } catch (err) {
      setError("Failed to save speaker.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this speaker?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      setSuccessMsg("Speaker deleted!");
      fetchSpeakers();
    } catch (err) {
      setError("Failed to delete speaker.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Speakers Manager</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>Manage keynote and advisory board speakers.</p>
        </div>
        <button className="btn-admin-primary" style={{boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'}} onClick={() => handleOpenModal()}>
          + Add New Speaker
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {successMsg && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{successMsg}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead style={{background: '#f8fafc'}}>
              <tr>
                <th style={{padding: '16px 24px'}}>Photo</th>
                <th>Name</th>
                <th>Designation & Affiliation</th>
                <th>Type</th>
                <th style={{padding: '16px 24px'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {speakers.map(spk => (
                <tr key={spk.id} style={{borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s'}}>
                  <td style={{padding: '16px 24px'}}>
                    <img 
                      src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : "https://randomuser.me/api/portraits/men/32.jpg"} 
                      alt={spk.name}
                      style={{width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0'}}
                      onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }} 
                    />
                  </td>
                  <td style={{color: '#0f172a', fontWeight: '600', fontSize: '15px'}}>{spk.name}</td>
                  <td>
                    <span style={{color: '#334155'}}>{spk.designation}</span>
                    <br />
                    <span style={{color: '#64748b', fontSize: '12px'}}>{spk.affiliation}, {spk.country}</span>
                  </td>
                  <td>
                    <span style={{
                      background: spk.type === 'KEYNOTE_SPEAKER' ? '#dbeafe' : '#f1f5f9',
                      color: spk.type === 'KEYNOTE_SPEAKER' ? '#1d4ed8' : '#475569',
                      padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {spk.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{padding: '16px 24px'}}>
                    <button className="btn-action-edit" onClick={() => handleOpenModal(spk)}>Edit</button>
                    <button className="btn-action-delete" onClick={() => handleDelete(spk.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {speakers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    <div style={{fontSize: '24px', marginBottom: '10px'}}>🎙️</div>
                    No speakers found for this conference.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '650px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{padding: '24px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '20px', color: '#0f172a'}}>{editingSpeaker ? "Edit Speaker" : "Add New Speaker"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '30px', overflowY: 'auto'}}>
              <form id="speakerForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Full Name <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" placeholder="Dr. Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', transition: 'border 0.2s'}} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                </div>
                
                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Designation <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="Professor of Microbiology" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Affiliation <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="Harvard University" value={formData.affiliation} onChange={e => setFormData({...formData, affiliation: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Country <span style={{color: '#ef4444'}}>*</span></label>
                    <input required type="text" placeholder="USA" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Speaker Category <span style={{color: '#ef4444'}}>*</span></label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}>
                      <option value="KEYNOTE_SPEAKER">Keynote Speaker</option>
                      <option value="ADVISORY_BOARD">Advisory Board</option>
                      <option value="SPEAKER">General Speaker</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Biography <span style={{color: '#ef4444'}}>*</span></label>
                  <textarea required rows="4" placeholder="Brief biography..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}} onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#cbd5e1'}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Profile Photo</label>
                  <div style={{border: '1px dashed #cbd5e1', padding: '20px', borderRadius: '8px', textAlign: 'center', background: '#f8fafc'}}>
                    <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} style={{width: '100%', fontSize: '14px', color: '#64748b'}} />
                  </div>
                </div>
              </form>
            </div>
            
            <div style={{padding: '20px 30px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '15px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '10px 24px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'}}>Cancel</button>
              <button type="submit" form="speakerForm" disabled={loading} style={{padding: '10px 24px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'all 0.2s'}}>
                {loading ? "Saving..." : "Save Speaker Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeakerManager;
