import React, { useState, useEffect, useRef } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const GalleryManager = () => {
  const { confirmDialog, toast } = useAdminDialog();
  const { activeConferenceId } = useAdmin();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [formData, setFormData] = useState({
    imageUrl: "", caption: "", category: "Venue", displayOrder: 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (activeConferenceId) fetchImages();
  }, [activeConferenceId]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/gallery?conferenceId=${activeConferenceId}`);
      setImages(data || []);
    } catch (err) {
      toast.error("Failed to fetch gallery images.");
    } finally {
      setLoading(false);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    if (url.startsWith("/uploads")) return `${BASE_URL}${url}`;
    return url;
  };

  const handleOpenModal = (img = null) => {
    setEditingImage(img);
    setImageFile(null);
    setImagePreview(null);
    if (img) {
      setFormData({
        imageUrl: img.imageUrl || "",
        caption: img.caption || "",
        category: img.category || "Venue",
        displayOrder: img.displayOrder || 0
      });
      setImagePreview(resolveImageUrl(img.imageUrl));
    } else {
      setFormData({ imageUrl: "", caption: "", category: "Venue", displayOrder: 0 });
    }
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, imageUrl: '' })); // clear URL if file chosen
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (activeConferenceId) payload.conferenceId = parseInt(activeConferenceId);

      let savedImage;
      if (editingImage) {
        savedImage = await api.put(`/api/admin/gallery/${editingImage.id}`, payload);
      } else {
        savedImage = await api.post("/api/admin/gallery", payload);
      }

      // Upload file if selected
      if (imageFile && savedImage?.id) {
        const fd = new FormData();
        fd.append("file", imageFile);
        await api.postMultipart(`/api/admin/gallery/${savedImage.id}/upload`, fd);
      }

      toast.success(editingImage ? "✓ Gallery image updated successfully!" : "✓ Gallery image uploaded successfully!");
      setShowModal(false);
      fetchImages();
    } catch (err) {
      toast.error("Failed to save gallery image.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog("Are you sure you want to delete this gallery image?", "Delete Gallery Image"))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/gallery/${id}`);
      toast.success("✓ Gallery image deleted successfully!");
      fetchImages();
    } catch (err) {
      toast.error("Failed to delete gallery image.");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["ALL", ...new Set(images.map(img => img.category).filter(Boolean))];
  if (!categories.includes("Venue")) categories.push("Venue");
  if (!categories.includes("Sessions")) categories.push("Sessions");
  if (!categories.includes("Social")) categories.push("Social");

  const filteredImages = images.filter(img =>
    categoryFilter === "ALL" || img.category === categoryFilter
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Conference Photo Gallery</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Upload photos or add image links — displayed on the public conference website.
          </p>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="admin-form-input"
            style={{width: '180px', margin: 0, background: '#fff'}}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat} Photos</option>
            ))}
          </select>
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Add Photo
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      {!activeConferenceId ? (
        <div className="admin-card" style={{textAlign: 'center', padding: '40px'}}>
          <p style={{color: '#64748b', margin: 0}}>Please select a conference from the header selector to manage its photo gallery.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px'}}>
          {filteredImages.map(img => {
            const src = resolveImageUrl(img.imageUrl);
            return (
              <div key={img.id} className="admin-card" style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative'}}>
                <div style={{position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '4px', zIndex: 1}}>
                  <button
                    onClick={() => handleOpenModal(img)}
                    style={{padding: '6px 10px', background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: '#1e293b'}}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    style={{padding: '6px 10px', background: 'rgba(239,68,68,0.9)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', color: '#fff'}}
                  >
                    Delete
                  </button>
                </div>

                <div style={{width: '100%', height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                  {src ? (
                    <img
                      src={src}
                      alt={img.caption || "Gallery photo"}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                      onError={(e) => { e.target.style.display='none'; }}
                    />
                  ) : (
                    <span style={{color: '#94a3b8', fontSize: '13px'}}>No Image</span>
                  )}
                </div>

                <div style={{padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                  <span style={{
                    background: '#f1f5f9', color: '#475569',
                    padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '700',
                    alignSelf: 'flex-start'
                  }}>
                    {img.category}
                  </span>
                  <strong style={{color: '#0f172a', fontSize: '14.5px'}}>{img.caption || 'No caption'}</strong>
                  <span style={{color: '#94a3b8', fontSize: '11px'}}>Order: {img.displayOrder}</span>
                </div>
              </div>
            );
          })}

          {filteredImages.length === 0 && (
            <div className="admin-card" style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b'}}>
              <div style={{fontSize: '32px', marginBottom: '10px'}}>🖼️</div>
              No gallery images found. Click <strong>"+ Add Photo"</strong> to upload your first photo.
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '560px', maxWidth: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>{editingImage ? "Edit Gallery Photo" : "Add Gallery Photo"}</h3>
              <button onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>

            <div style={{padding: '24px'}}>
              <form id="galleryForm" onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>

                {/* Image Upload Section */}
                <div>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>
                    📸 Upload Photo <span style={{color: '#94a3b8', fontWeight: '400'}}>(or paste a URL below)</span>
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px',
                      textAlign: 'center', cursor: 'pointer', background: '#f8fafc',
                      transition: 'border-color 0.2s',
                      position: 'relative', overflow: 'hidden'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '6px'}} />
                    ) : (
                      <div>
                        <div style={{fontSize: '32px', marginBottom: '8px'}}>🖼️</div>
                        <p style={{margin: 0, color: '#64748b', fontSize: '13px'}}>Click to select an image file</p>
                        <p style={{margin: '4px 0 0', color: '#94a3b8', fontSize: '11px'}}>JPG, PNG, WebP supported</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{display: 'none'}}
                    />
                  </div>
                  {imagePreview && (
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value=''; }} style={{marginTop: '6px', background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: '600'}}>
                      ✕ Remove photo
                    </button>
                  )}
                </div>

                {/* URL Fallback */}
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>
                    Or Image URL <span style={{color: '#94a3b8', fontWeight: '400'}}>(if not uploading a file)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.imageUrl}
                    onChange={e => { setFormData({...formData, imageUrl: e.target.value}); if (e.target.value) { setImageFile(null); setImagePreview(null); } }}
                    style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}}
                  />
                </div>

                {/* Caption */}
                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>
                    Caption / Title <span style={{color: '#ef4444'}}>*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Opening Ceremony"
                    value={formData.caption}
                    onChange={e => setFormData({...formData, caption: e.target.value})}
                    style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}}
                  />
                </div>

                {/* Category + Order */}
                <div style={{display: 'flex', gap: '16px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>
                      Category <span style={{color: '#ef4444'}}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff'}}
                    >
                      <option value="Venue">Venue</option>
                      <option value="Sessions">Sessions</option>
                      <option value="Social">Social</option>
                      <option value="Exhibition">Exhibition</option>
                      <option value="Awards">Awards</option>
                    </select>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                      style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}}
                    />
                  </div>
                </div>
              </form>
            </div>

            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowModal(false)} style={{padding: '9px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}>
                Cancel
              </button>
              <button type="submit" form="galleryForm" disabled={loading} style={{padding: '9px 22px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1}}>
                {loading ? "Saving..." : "Save Photo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
