import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import "./AdminHome.css";

const EMPTY_FORM = { icon: "🔬", title: "", description: "", displayOrder: 0, active: true };

const TrustBadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadBadges = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/trust-badges");
      setBadges(Array.isArray(data) ? data : []);
    } catch {
      showToast("Failed to load badges", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBadges(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (b) => {
    setEditId(b.id);
    setForm({ icon: b.icon || "🔬", title: b.title, description: b.description || "", displayOrder: b.displayOrder || 0, active: b.active });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast("Title is required", "error"); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/api/admin/trust-badges/${editId}`, { ...form, displayOrder: parseInt(form.displayOrder) });
        showToast("Badge updated!");
      } else {
        await api.post("/api/admin/trust-badges", { ...form, displayOrder: parseInt(form.displayOrder) });
        showToast("Badge created!");
      }
      setShowForm(false);
      loadBadges();
    } catch (err) {
      showToast("Save failed: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trust badge?")) return;
    try {
      await api.delete(`/api/admin/trust-badges/${id}`);
      showToast("Badge deleted");
      loadBadges();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const ICON_SUGGESTIONS = ["🔬", "✅", "🌐", "📚", "🎓", "🏆", "🤝", "📖", "🛡️", "⭐", "💡", "🔒"];

  return (
    <div className="admin-page">
      {toast && <div className={`admin-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="admin-page-header">
        <div>
          <h1>Trust Badges Management</h1>
          <p>Manage the trust badges shown on the homepage (Scopus, Peer Reviewed, etc.).</p>
        </div>
        <button className="btn-admin-primary" onClick={openAdd}>+ Add Badge</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? "Edit Badge" : "Add Trust Badge"}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-group">
                <label>Icon Emoji</label>
                <input name="icon" value={form.icon} onChange={handleChange} maxLength={10} placeholder="🔬" />
                <div className="icon-suggestions">
                  {ICON_SUGGESTIONS.map(ic => (
                    <button type="button" key={ic} className={`icon-chip ${form.icon === ic ? "selected" : ""}`} onClick={() => setForm({...form, icon: ic})}>{ic}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handleChange} placeholder="Scopus Indexed" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="All proceedings indexed in major global databases" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" name="displayOrder" value={form.displayOrder} onChange={handleChange} min={0} />
                </div>
                <div className="form-group">
                  <label>Active</label>
                  <div className="toggle-wrap">
                    <input type="checkbox" id="badgeActive" name="active" checked={form.active} onChange={handleChange} className="toggle-input" />
                    <label htmlFor="badgeActive" className="toggle-label">
                      {form.active ? "Visible on homepage" : "Hidden"}
                    </label>
                  </div>
                </div>
              </div>
              {/* Preview */}
              <div className="badge-preview">
                <p className="preview-label">Preview:</p>
                <div className="badge-preview-card">
                  <span className="badge-prev-icon">{form.icon}</span>
                  <div>
                    <strong>{form.title || "Badge Title"}</strong>
                    <p>{form.description || "Badge description appears here."}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Badge" : "Create Badge"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? (
        <div className="admin-loading">Loading badges...</div>
      ) : badges.length === 0 ? (
        <div className="admin-empty">
          <p>🏷️ No trust badges yet.</p>
          <button className="btn-admin-primary" onClick={openAdd}>Add your first badge</button>
        </div>
      ) : (
        <div className="badges-admin-grid">
          {badges.map((b) => (
            <div className={`badge-admin-card ${!b.active ? "inactive" : ""}`} key={b.id}>
              <div className="bac-header">
                <span className="bac-icon">{b.icon}</span>
                <span className={`status-badge ${b.active ? "active" : "inactive"}`}>{b.active ? "Active" : "Hidden"}</span>
              </div>
              <h3>{b.title}</h3>
              <p>{b.description}</p>
              <div className="bac-meta">Order: {b.displayOrder}</div>
              <div className="action-btns">
                <button className="btn-sm" onClick={() => openEdit(b)}>Edit</button>
                <button className="btn-sm danger" onClick={() => handleDelete(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrustBadgeManagement;
