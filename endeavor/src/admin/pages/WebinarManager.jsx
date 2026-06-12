import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const WebinarManager = () => {
  const [webinars, setWebinars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [includeArchived, setIncludeArchived] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingWebinar, setEditingWebinar] = useState(null);
  const [previewWebinar, setPreviewWebinar] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerUrl: "",
    speakerName: "",
    speakerPhoto: "",
    speakerDesignation: "",
    webinarDate: "",
    startTime: "",
    endTime: "",
    timeZone: "UTC",
    meetingLink: "",
    registrationRequired: false,
    registrationUrl: "",
    certificateAvailable: false,
    status: "DRAFT",
    recordingUrl: ""
  });

  // Countdown timer for Preview Modal
  const [previewTimeLeft, setPreviewTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isEnded: false });

  useEffect(() => {
    fetchWebinars();
  }, [search, statusFilter, includeArchived, page]);

  const fetchWebinars = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/admin/webinars?page=${page}&size=${pageSize}&includeArchived=${includeArchived}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const data = await api.get(url);
      if (data && data.content) {
        setWebinars(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setWebinars([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch webinars list from the backend database.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (webinar = null) => {
    setEditingWebinar(webinar);
    setError("");
    setSuccess("");
    if (webinar) {
      setFormData({
        title: webinar.title || "",
        description: webinar.description || "",
        bannerUrl: webinar.bannerUrl || "",
        speakerName: webinar.speakerName || "",
        speakerPhoto: webinar.speakerPhoto || "",
        speakerDesignation: webinar.speakerDesignation || "",
        webinarDate: webinar.webinarDate || "",
        startTime: webinar.startTime || "",
        endTime: webinar.endTime || "",
        timeZone: webinar.timeZone || "UTC",
        meetingLink: webinar.meetingLink || "",
        registrationRequired: webinar.registrationRequired === true,
        registrationUrl: webinar.registrationUrl || "",
        certificateAvailable: webinar.certificateAvailable === true,
        status: webinar.status || "DRAFT",
        recordingUrl: webinar.recordingUrl || ""
      });
    } else {
      setFormData({
        title: "",
        description: "",
        bannerUrl: "",
        speakerName: "",
        speakerPhoto: "",
        speakerDesignation: "",
        webinarDate: "",
        startTime: "",
        endTime: "",
        timeZone: "UTC",
        meetingLink: "",
        registrationRequired: false,
        registrationUrl: "",
        certificateAvailable: false,
        status: "DRAFT",
        recordingUrl: ""
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Front-end validation
    if (formData.registrationRequired && !formData.registrationUrl.trim()) {
      setError("Registration URL is required when registration is set to required.");
      setLoading(false);
      return;
    }

    try {
      if (editingWebinar) {
        await api.put(`/api/admin/webinars/${editingWebinar.id}`, formData);
        setSuccess("Webinar details updated successfully!");
      } else {
        await api.post("/api/admin/webinars", formData);
        setSuccess("Webinar created successfully!");
      }
      setShowModal(false);
      fetchWebinars();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save webinar changes. Please check fields and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete/archive this webinar? It will be soft-deleted and moved to Archived status.")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/webinars/${id}`);
      setSuccess("Webinar soft-deleted (archived) successfully.");
      fetchWebinars();
    } catch (err) {
      setError("Failed to archive webinar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async (webinar) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const newStatus = webinar.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updatedData = { ...webinar, status: newStatus };
      await api.put(`/api/admin/webinars/${webinar.id}`, updatedData);
      setSuccess(`Webinar successfully ${newStatus === 'PUBLISHED' ? 'published' : 'reverted to draft'}.`);
      fetchWebinars();
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  // Preview Modal countdown timer loop
  useEffect(() => {
    if (!previewWebinar || !showPreviewModal) return;

    const updateTimer = () => {
      const datePart = previewWebinar.webinarDate;
      const startPart = previewWebinar.startTime || "00:00";
      const endPart = previewWebinar.endTime || "23:59";

      const start = new Date(`${datePart}T${startPart}:00`);
      const end = new Date(`${datePart}T${endPart}:00`);
      const now = new Date();

      const diffStart = start - now;
      const diffEnd = end - now;

      if (diffStart > 0) {
        const days = Math.floor(diffStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffStart % (1000 * 60)) / 1000);
        setPreviewTimeLeft({ days, hours, minutes, seconds, isLive: false, isEnded: false });
      } else if (diffEnd > 0) {
        setPreviewTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isEnded: false });
      } else {
        setPreviewTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isEnded: true });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [previewWebinar, showPreviewModal]);

  const handleOpenPreview = (webinar) => {
    setPreviewWebinar(webinar);
    setShowPreviewModal(true);
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PUBLISHED': return { bg: '#dcfce7', text: '#15803d' };
      case 'COMPLETED': return { bg: '#e2e8f0', text: '#475569' };
      case 'ARCHIVED': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#eff6ff', text: '#1d4ed8' }; // DRAFT
    }
  };

  return (
    <div className="admin-page">
      {/* Header section */}
      <div className="admin-page-header">
        <div>
          <h2>Webinar Management</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Create, schedule, publish, preview, and audit academic webinar events.
          </p>
        </div>
        <div>
          <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
            + Create Webinar
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{error}</div>}
      {success && <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{success}</div>}

      {/* Filter and search bar */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '15px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Search Term</label>
            <input 
              type="text" 
              placeholder="Search by title, speaker..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(0); }} 
              className="admin-form-input"
              style={{ width: '100%', margin: 0 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>Status Filter</label>
            <select 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }} 
              className="admin-form-input"
              style={{ width: '150px', margin: 0 }}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475569', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={includeArchived} 
                onChange={e => { setIncludeArchived(e.target.checked); setPage(0); }} 
              />
              Show Archived
            </label>
          </div>
        </div>
      </div>

      {/* Grid List Table */}
      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading && webinars.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading webinars list...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px 24px' }}>Webinar Details</th>
                  <th>Speaker</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {webinars.map((web) => {
                  const colors = getStatusColor(web.status);
                  return (
                    <tr key={web.id} style={{ borderBottom: '1px solid #e2e8f0', opacity: web.status === 'ARCHIVED' ? 0.6 : 1 }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img 
                            src={web.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                            alt={web.title} 
                            style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                          />
                          <div>
                            <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', display: 'block' }}>{web.title}</span>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Slug: {web.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <img 
                            src={web.speakerPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} 
                            alt={web.speakerName} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ display: 'block', fontSize: '13px', color: '#334155' }}>{web.speakerName}</strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{web.speakerDesignation}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '600', fontSize: '13px', color: '#475569', display: 'block' }}>{web.webinarDate}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{web.startTime} - {web.endTime} ({web.timeZone})</span>
                      </td>
                      <td>
                        <span style={{
                          background: colors.bg,
                          color: colors.text,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase'
                        }}>
                          {web.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn-action-edit" style={{ background: '#f1f5f9', color: '#475569' }} onClick={() => handleOpenPreview(web)}>
                            Preview
                          </button>
                          {web.status !== 'ARCHIVED' && (
                            <button 
                              className="btn-action-edit" 
                              style={{ 
                                background: web.status === 'PUBLISHED' ? '#fee2e2' : '#dcfce7', 
                                color: web.status === 'PUBLISHED' ? '#b91c1c' : '#15803d' 
                              }} 
                              onClick={() => handlePublishToggle(web)}
                            >
                              {web.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                            </button>
                          )}
                          <button className="btn-action-edit" onClick={() => handleOpenModal(web)}>Edit</button>
                          {web.status !== 'ARCHIVED' && (
                            <button className="btn-action-delete" onClick={() => handleDelete(web.id)}>Archive</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {webinars.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No webinars found matching the criteria. Click "+ Create Webinar" to add one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalElements)} of {totalElements} webinars
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                disabled={page === 0} 
                onClick={() => setPage(page - 1)}
                style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.5 : 1 }}
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages - 1} 
                onClick={() => setPage(page + 1)}
                style={{ padding: '6px 12px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FORM MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '800px', maxWidth: '100%', maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{editingWebinar ? "Edit Webinar Details" : "Create New Webinar"}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <form id="webinarForm" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Webinar Title <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="text" placeholder="e.g. Advancements in Quantum Physics 2026" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Description <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea required rows="4" placeholder="Webinar syllabus and description details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical' }}></textarea>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Banner Image URL</label>
                  <input type="text" placeholder="https://..." value={formData.bannerUrl} onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Webinar Date <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="date" value={formData.webinarDate} onChange={e => setFormData({ ...formData, webinarDate: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Start Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>End Time <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Time Zone</label>
                  <input type="text" placeholder="e.g. UTC, GMT, EST" value={formData.timeZone} onChange={e => setFormData({ ...formData, timeZone: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Meeting Link (Zoom/Teams/Meet)</label>
                  <input type="text" placeholder="https://zoom.us/j/..." value={formData.meetingLink} onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Speaker Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="text" placeholder="Dr. Jane Doe" value={formData.speakerName} onChange={e => setFormData({ ...formData, speakerName: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Speaker Designation</label>
                  <input type="text" placeholder="Professor of Physics, MIT" value={formData.speakerDesignation} onChange={e => setFormData({ ...formData, speakerDesignation: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Speaker Photo URL</label>
                  <input type="text" placeholder="https://..." value={formData.speakerPhoto} onChange={e => setFormData({ ...formData, speakerPhoto: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Lifecycle Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Webinar Recording URL (Optional)</label>
                  <input type="text" placeholder="https://youtube.com/watch?v=..." value={formData.recordingUrl} onChange={e => setFormData({ ...formData, recordingUrl: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', gridColumn: 'span 2', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                    <input type="checkbox" checked={formData.registrationRequired} onChange={e => setFormData({ ...formData, registrationRequired: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                    Registration is Required
                  </label>
                  
                  {formData.registrationRequired && (
                    <div style={{ paddingLeft: '24px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Registration URL <span style={{ color: '#ef4444' }}>*</span></label>
                      <input required={formData.registrationRequired} type="text" placeholder="https://us02web.zoom.us/webinar/register/..." value={formData.registrationUrl} onChange={e => setFormData({ ...formData, registrationUrl: e.target.value })} style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: '500', marginTop: '6px' }}>
                    <input type="checkbox" checked={formData.certificateAvailable} onChange={e => setFormData({ ...formData, certificateAvailable: e.target.checked })} style={{ width: '16px', height: '16px' }} />
                    Certificate Available for Attendees
                  </label>
                </div>
              </form>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" form="webinarForm" disabled={loading} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? "Saving..." : "Save Webinar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME PREVIEW MODAL */}
      {showPreviewModal && previewWebinar && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
        }}>
          <div style={{
            background: '#f8fafc', borderRadius: '20px', width: '900px', maxWidth: '100%', maxHeight: '90vh',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 24px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>🖥️ LIVE PUBLIC PREVIEW</h3>
              <button onClick={() => setShowPreviewModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer', lineHieght: 1 }}>&times;</button>
            </div>

            {/* Modal Content - Emulates WebinarDetails.jsx */}
            <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '40px' }}>
              
              {/* Emulated Hero Banner */}
              <div style={{
                position: 'relative',
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.85) 100%), url(${previewWebinar.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '50px 30px 40px 30px',
                color: '#fff',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#3b82f6', textTransform: 'uppercase' }}>
                    {previewTimeLeft.isEnded ? "Completed" : previewTimeLeft.isLive ? "Live Now 🔴" : "Upcoming"}
                  </span>
                  {previewWebinar.certificateAvailable && (
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.3)', color: '#10b981' }}>🎓 Certificate</span>
                  )}
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 10px 0', lineHeight: 1.2 }}>{previewWebinar.title}</h1>
                <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>Presented by <strong>{previewWebinar.speakerName}</strong> - {previewWebinar.speakerDesignation}</p>
              </div>

              {/* Emulated details container */}
              <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '30px' }}>
                <div>
                  {/* Left Column: Description & Speaker */}
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>About this Webinar</h4>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>{previewWebinar.description}</p>
                  </div>

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>Keynote Speaker</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '15px', alignItems: 'center' }}>
                      <img src={previewWebinar.speakerPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"} alt={previewWebinar.speakerName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>{previewWebinar.speakerName}</strong>
                        <span style={{ fontSize: '12px', color: '#3b82f6', display: 'block', marginBottom: '4px' }}>{previewWebinar.speakerDesignation}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Distinguished scholar carrying deep insight in respective academic domains.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Right Column: Countdown & Meta Info */}
                  {!previewTimeLeft.isLive && !previewTimeLeft.isEnded && (
                    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Webinar Starts In</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                        <div style={{ background: '#f8fafc', padding: '6px 2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{previewTimeLeft.days}</span>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Days</span>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '6px 2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{previewTimeLeft.hours}</span>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Hours</span>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '6px 2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{previewTimeLeft.minutes}</span>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Mins</span>
                        </div>
                        <div style={{ background: '#f8fafc', padding: '6px 2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{previewTimeLeft.seconds}</span>
                          <span style={{ fontSize: '9px', color: '#64748b' }}>Secs</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTimeLeft.isLive && (
                    <div style={{ background: '#fef2f2', borderRadius: '12px', padding: '20px', border: '1px solid #fee2e2', marginBottom: '20px', textAlign: 'center' }}>
                      <span style={{ color: '#b91c1c', fontWeight: '800', fontSize: '14px', display: 'block' }}>🔴 Broadcast Live Now</span>
                    </div>
                  )}

                  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>Webinar Details</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: '#475569' }}>
                      <div>📅 <strong>Date:</strong> {previewWebinar.webinarDate}</div>
                      <div>⏰ <strong>Time:</strong> {previewWebinar.startTime} - {previewWebinar.endTime} ({previewWebinar.timeZone})</div>
                      <div>🎟️ <strong>Access:</strong> {previewWebinar.registrationRequired ? "Registration Required" : "Open Public Access"}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                      {previewWebinar.registrationRequired ? (
                        <a href={previewWebinar.registrationUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', background: '#3b82f6', color: '#fff', padding: '10px', borderRadius: '6px', fontWeight: '700', textDecoration: 'none', fontSize: '13px' }}>
                          Register for Webinar
                        </a>
                      ) : (
                        <button disabled style={{ background: '#e2e8f0', color: '#64748b', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: '700', cursor: 'not-allowed', fontSize: '13px' }}>
                          Access Link Active at Start Time
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebinarManager;
