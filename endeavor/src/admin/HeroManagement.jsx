import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./AdminHome.css";

const BASE_URL = "http://localhost:8081";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  description: "",
  button1Text: "Submit Abstract",
  button1Link: "/submit-abstract",
  button2Text: "Register Now",
  button2Link: "/register",
  status: "INACTIVE",
};

const HeroManagement = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  // Background image (full page backdrop)
  const [bgFile, setBgFile] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  // Hero visual image (right-side conference image)
  const [heroImgFile, setHeroImgFile] = useState(null);
  const [heroImgPreview, setHeroImgPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadHeroes = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/hero");
      setHeroes(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load hero banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHeroes(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openAdd = () => {
    setEditId(null); setForm(EMPTY_FORM);
    setBgFile(null); setBgPreview(null);
    setHeroImgFile(null); setHeroImgPreview(null);
    setShowForm(true);
  };

  const openEdit = (hero) => {
    setEditId(hero.id);
    setForm({
      title: hero.title || "",
      subtitle: hero.subtitle || "",
      description: hero.description || "",
      button1Text: hero.button1Text || "",
      button1Link: hero.button1Link || "",
      button2Text: hero.button2Text || "",
      button2Link: hero.button2Link || "",
      status: hero.status || "INACTIVE",
    });
    setBgFile(null);
    setBgPreview(hero.backgroundImage ? `${BASE_URL}/uploads/hero/${hero.backgroundImage}` : null);
    setHeroImgFile(null);
    setHeroImgPreview(hero.heroImage ? `${BASE_URL}/uploads/hero/${hero.heroImage}` : null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      let savedHero;
      if (editId) {
        savedHero = await api.put(`/api/admin/hero/${editId}`, form);
        showToast("Hero updated!");
      } else {
        savedHero = await api.post("/api/admin/hero", form);
        showToast("Hero created!");
      }
      const id = savedHero?.id;
      // Upload background image
      if (bgFile && id) {
        const fd = new FormData();
        fd.append("file", bgFile);
        await api.postMultipart(`/api/admin/hero/${id}/image`, fd);
        showToast("Background image uploaded!");
      }
      // Upload right-side hero visual image
      if (heroImgFile && id) {
        const fd = new FormData();
        fd.append("file", heroImgFile);
        await api.postMultipart(`/api/admin/hero/${id}/hero-image`, fd);
        showToast("Conference image uploaded!");
      }
      setShowForm(false);
      loadHeroes();
    } catch (err) {
      showToast("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.put(`/api/admin/hero/${id}/activate`, {});
      showToast("Hero banner activated!");
      loadHeroes();
    } catch { showToast("Activation failed", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this hero banner?")) return;
    try {
      await api.delete(`/api/admin/hero/${id}`);
      showToast("Deleted successfully");
      loadHeroes();
    } catch { showToast("Delete failed", "error"); }
  };

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header">
        <div>
          <h1>🖼️ Hero Banner Management</h1>
          <p>Manage the homepage hero section. Only one banner can be ACTIVE at a time.</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Hero Banner</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? "Edit Hero Banner" : "Add Hero Banner"}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-grid-2">
                <div className="form-group full">
                  <label>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Advancing Global Research Through Innovation" required />
                </div>
                <div className="form-group full">
                  <label>Subtitle</label>
                  <input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="International Conferences & Publications" />
                </div>
                <div className="form-group full">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Join researchers worldwide..." />
                </div>
                <div className="form-group">
                  <label>Button 1 Text</label>
                  <input name="button1Text" value={form.button1Text} onChange={handleChange} placeholder="Submit Abstract" />
                </div>
                <div className="form-group">
                  <label>Button 1 Link</label>
                  <input name="button1Link" value={form.button1Link} onChange={handleChange} placeholder="/submit-abstract" />
                </div>
                <div className="form-group">
                  <label>Button 2 Text</label>
                  <input name="button2Text" value={form.button2Text} onChange={handleChange} placeholder="Register Now" />
                </div>
                <div className="form-group">
                  <label>Button 2 Link</label>
                  <input name="button2Link" value={form.button2Link} onChange={handleChange} placeholder="/register" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>
              </div>

              {/* Image upload grid */}
              <div className="image-upload-grid">
                {/* Background image */}
                <div className="img-upload-box">
                  <div className="img-upload-label">
                    <span>🌄</span>
                    <div>
                      <strong>Full Page Background</strong>
                      <p>Shown behind the entire hero section. Optional.</p>
                    </div>
                  </div>
                  {bgPreview && (
                    <div className="img-preview-wrap">
                      <img src={bgPreview} alt="Background Preview" className="img-preview" />
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => { const f = e.target.files[0]; if (f) { setBgFile(f); setBgPreview(URL.createObjectURL(f)); } }}
                    className="file-input" />
                  <p className="hint">Recommended: 1920×1080px. JPG, PNG, WEBP</p>
                </div>

                {/* Hero right-side image */}
                <div className="img-upload-box featured-upload">
                  <div className="img-upload-label">
                    <span>📸</span>
                    <div>
                      <strong>Conference Visual Image ★</strong>
                      <p>Main image on the right side of the hero. Highly recommended.</p>
                    </div>
                  </div>
                  {heroImgPreview && (
                    <div className="img-preview-wrap">
                      <img src={heroImgPreview} alt="Hero Visual Preview" className="img-preview" />
                    </div>
                  )}
                  <input type="file" accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => { const f = e.target.files[0]; if (f) { setHeroImgFile(f); setHeroImgPreview(URL.createObjectURL(f)); } }}
                    className="file-input" />
                  <p className="hint">Recommended: 800×600px. Conference stage, researchers, networking scenes</p>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-admin-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="admin-loading">Loading hero banners...</div>
      ) : heroes.length === 0 ? (
        <div className="admin-empty">
          <p>🖼️ No hero banners yet.</p>
          <button className="btn-admin-primary" onClick={openAdd}>Create your first banner</button>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Background</th>
                <th>Conference Image</th>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {heroes.map((h) => (
                <tr key={h.id}>
                  <td>
                    {h.backgroundImage
                      ? <img src={`${BASE_URL}/uploads/hero/${h.backgroundImage}`} alt="bg" className="table-thumb" />
                      : <div className="table-thumb-empty">No BG</div>}
                  </td>
                  <td>
                    {h.heroImage
                      ? <img src={`${BASE_URL}/uploads/hero/${h.heroImage}`} alt="hero" className="table-thumb" />
                      : <div className="table-thumb-empty">No Image</div>}
                  </td>
                  <td className="td-title">{h.title}</td>
                  <td>
                    <span className={`status-badge ${h.status === "ACTIVE" ? "active" : "inactive"}`}>
                      {h.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {h.status !== "ACTIVE" && (
                        <button className="btn-sm success" onClick={() => handleActivate(h.id)}>Activate</button>
                      )}
                      <button className="btn-sm" onClick={() => openEdit(h)}>Edit</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(h.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HeroManagement;
