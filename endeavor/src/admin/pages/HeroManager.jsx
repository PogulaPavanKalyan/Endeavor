import React, { useState, useEffect } from 'react';
import { api, BASE_URL } from '../../utils/api';

const HeroManager = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingHero, setEditingHero] = useState(null);
  const [formData, setFormData] = useState({
    title: "", subtitle: "", description: "",
    button1Text: "", button1Link: "", button2Text: "", button2Link: "",
    status: "INACTIVE"
  });
  const [bgFile, setBgFile] = useState(null);
  const [heroFile, setHeroFile] = useState(null);

  useEffect(() => {
    fetchHeroes();
  }, []);

  const fetchHeroes = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/admin/hero");
      setHeroes(data || []);
    } catch (err) {
      setError("Failed to fetch hero banners.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hero = null) => {
    setEditingHero(hero);
    if (hero) {
      setFormData({
        title: hero.title || "",
        subtitle: hero.subtitle || "",
        description: hero.description || "",
        button1Text: hero.button1Text || "",
        button1Link: hero.button1Link || "",
        button2Text: hero.button2Text || "",
        button2Link: hero.button2Link || "",
        status: hero.status || "INACTIVE"
      });
    } else {
      setFormData({
        title: "", subtitle: "", description: "",
        button1Text: "", button1Link: "", button2Text: "", button2Link: "",
        status: "INACTIVE"
      });
    }
    setBgFile(null);
    setHeroFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let savedHero;
      if (editingHero) {
        savedHero = await api.put(`/api/admin/hero/${editingHero.id}`, formData);
        setSuccess("Hero banner updated successfully!");
      } else {
        savedHero = await api.post("/api/admin/hero", formData);
        setSuccess("Hero banner created successfully!");
      }

      if (bgFile && savedHero.id) {
        const bgData = new FormData();
        bgData.append("file", bgFile);
        await api.postMultipart(`/api/admin/hero/${savedHero.id}/image`, bgData);
      }

      if (heroFile && savedHero.id) {
        const heroData = new FormData();
        heroData.append("file", heroFile);
        await api.postMultipart(`/api/admin/hero/${savedHero.id}/hero-image`, heroData);
      }

      setShowModal(false);
      fetchHeroes();
    } catch (err) {
      setError("Failed to save hero banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/admin/hero/${id}/activate`, {});
      setSuccess("Hero banner activated!");
      fetchHeroes();
    } catch (err) {
      setError("Failed to activate hero banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero banner?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/hero/${id}`);
      setSuccess("Hero banner deleted successfully.");
      fetchHeroes();
    } catch (err) {
      setError("Failed to delete hero banner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Hero Banners</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage front-page slider graphics, promotional titles and main landing call-to-actions.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
          + Create Hero Banner
        </button>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && heroes.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading hero banners...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Visuals</th>
                  <th>Title & Subtitle</th>
                  <th>Buttons</th>
                  <th>Status</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {heroes.map(hero => (
                  <tr key={hero.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px'}}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <div style={{width: '60px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {hero.backgroundImage ? (
                            <img src={`${BASE_URL}/uploads/hero/${hero.backgroundImage}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : <span style={{fontSize: '9px', color: '#94a3b8'}}>NO BG</span>}
                        </div>
                        <div style={{width: '60px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {hero.heroImage ? (
                            <img src={`${BASE_URL}/uploads/hero/${hero.heroImage}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                          ) : <span style={{fontSize: '9px', color: '#94a3b8'}}>NO IMG</span>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong style={{color: '#0f172a', fontSize: '15px'}}>{hero.title}</strong>
                      {hero.subtitle && <div style={{color: '#64748b', fontSize: '12px'}}>{hero.subtitle}</div>}
                    </td>
                    <td>
                      <div style={{fontSize: '12px'}}>
                        {hero.button1Text && <div>🔗 {hero.button1Text} ({hero.button1Link})</div>}
                        {hero.button2Text && <div>🔗 {hero.button2Text} ({hero.button2Link})</div>}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: hero.status === 'ACTIVE' ? '#dcfce7' : '#f1f5f9',
                        color: hero.status === 'ACTIVE' ? '#15803d' : '#475569',
                        padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                      }}>
                        {hero.status}
                      </span>
                    </td>
                    <td style={{padding: '16px 24px'}}>
                      {hero.status !== 'ACTIVE' && (
                        <button className="btn-action-edit" style={{background: '#22c55e', color: '#fff', border: 'none'}} onClick={() => handleActivate(hero.id)}>Activate</button>
                      )}
                      <button className="btn-action-edit" onClick={() => handleOpenModal(hero)}>Edit</button>
                      <button className="btn-action-delete" onClick={() => handleDelete(hero.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {heroes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No hero banners configured yet.
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
            background: '#fff', borderRadius: '16px', width: '600px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingHero ? "Edit Hero Banner" : "Create Hero Banner"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px', overflowY: 'auto'}}>
              <form id="heroForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Title <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" placeholder="Main header title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Subtitle</label>
                  <input type="text" placeholder="Short subheader" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Description</label>
                  <textarea rows="3" placeholder="Paragraph text..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Button 1 Text</label>
                    <input type="text" placeholder="Submit Abstract" value={formData.button1Text} onChange={e => setFormData({...formData, button1Text: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Button 1 Link</label>
                    <input type="text" placeholder="/submit-abstract" value={formData.button1Link} onChange={e => setFormData({...formData, button1Link: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Button 2 Text</label>
                    <input type="text" placeholder="Register Now" value={formData.button2Text} onChange={e => setFormData({...formData, button2Text: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Button 2 Link</label>
                    <input type="text" placeholder="/register" value={formData.button2Link} onChange={e => setFormData({...formData, button2Link: e.target.value})} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '20px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Background Image</label>
                    <input type="file" accept="image/*" onChange={e => setBgFile(e.target.files[0])} style={{width: '100%', fontSize: '13px', color: '#64748b'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Right Side Visual Image</label>
                    <input type="file" accept="image/*" onChange={e => setHeroFile(e.target.files[0])} style={{width: '100%', fontSize: '13px', color: '#64748b'}} />
                  </div>
                </div>
              </form>
            </div>
            
            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="heroForm" disabled={loading} style={{padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'}}>
                {loading ? "Saving..." : "Save Hero"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroManager;
