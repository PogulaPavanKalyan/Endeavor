import React, { useState, useEffect, useMemo } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';
import { DEFAULT_GUIDELINES } from '../../utils/constants';

const STATUS_OPTIONS = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];

const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 100);

const ConferenceManager = () => {
  const { confirmDialog, alertDialog } = useAdminDialog();

  const { conferences, fetchConferences, setActiveConferenceId } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modular Admin Enhancements states
  const [seriesList, setSeriesList] = useState([]);
  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [newSeries, setNewSeries] = useState({ name: '', code: '', description: '' });
  const [archiveTab, setArchiveTab] = useState('ACTIVE'); // 'ACTIVE' or 'ARCHIVED'
  const [cloningConf, setCloningConf] = useState(null);
  const [cloneData, setCloneData] = useState({ year: new Date().getFullYear() + 1, startDate: '', endDate: '' });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingConf, setEditingConf] = useState(null);
  const [step, setStep] = useState(1);
  const [photoFile, setPhotoFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  const [aboutImageFile, setAboutImageFile] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    tittle: '', slug: '', description: '', startDate: '', endDate: '',
    venue: '', city: '', country: '', contactEmail: '', contactPhone: '',
    themePrimary: '#e74c3c', themeSecondary: '#f39c12', themeAccent: '#c0392b',
    metaTitle: '', metaDescription: '',
    scientificSessions: [], pricingTiers: [],
    seriesId: '', year: new Date().getFullYear(),
    showCommittee: true, guidelines: DEFAULT_GUIDELINES
  });

  // Speakers & Sessions for Step 2 & 3
  const [speakers, setSpeakers] = useState([]);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const [speakerData, setSpeakerData] = useState({
    name: '', designation: '', affiliation: '', country: '', bio: '', type: 'KEYNOTE_SPEAKER', speakerAbstract: ''
  });
  const [speakerPhoto, setSpeakerPhoto] = useState(null);

  // Important Dates management states
  const [importantDates, setImportantDates] = useState([]);
  const [showImportantDateForm, setShowImportantDateForm] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [dateFormData, setDateFormData] = useState({
    eventTitle: '',
    eventDescription: '',
    eventDate: '',
    isActive: true,
    isHighlighted: false
  });
  const [sessionsList, setSessionsList] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    name: '', timeRange: '', speakerName: '', affiliation: '', type: 'KEYNOTE'
  });

  // Fetch series on mount
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const data = await api.get('/api/admin/series');
        if (Array.isArray(data)) {
          setSeriesList(data);
        }
      } catch (e) {
        console.error("Failed to load series list:", e);
      }
    };
    fetchSeries();
  }, []);

  // Filtered conferences
  const filteredConferences = useMemo(() => {
    return conferences.filter(c => {
      const matchesSearch = !searchQuery ||
        (c.tittle || c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesArchive = archiveTab === 'ACTIVE' ? !c.isDeleted : c.isDeleted;
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      
      return matchesSearch && matchesStatus && matchesArchive;
    });
  }, [conferences, searchQuery, statusFilter, archiveTab]);

  // Auto-generate slug from title and year
  const handleTitleChange = (value) => {
    const yearStr = formData.year ? " " + formData.year : "";
    setFormData(prev => ({
      ...prev,
      tittle: value,
      slug: editingConf ? prev.slug : slugify(value + yearStr)
    }));
  };

  const handleYearChange = (value) => {
    setFormData(prev => ({
      ...prev,
      year: value,
      slug: editingConf ? prev.slug : slugify(prev.tittle + (value ? " " + value : ""))
    }));
  };

  const handleOpenModal = (conf = null) => {
    setEditingConf(conf);
    setPhotoFile(null);
    setBrochureFile(null);
    setAboutImageFile(null);
    setStep(1);
    setSpeakers([]);
    setSessionsList([]);
    setShowSpeakerForm(false);
    setShowSessionForm(false);
    setError('');
    setSuccess('');

    if (conf) {
      setFormData({
        tittle: conf.tittle || conf.title || '',
        slug: conf.slug || slugify(conf.tittle || conf.title || ''),
        description: conf.description || '',
        startDate: conf.startDate || '',
        endDate: conf.endDate || '',
        venue: conf.venue || '',
        city: conf.city || '',
        country: conf.country || '',
        contactEmail: conf.contactEmail || '',
        contactPhone: conf.contactPhone || '',
        themePrimary: conf.themePrimary || '#e74c3c',
        themeSecondary: conf.themeSecondary || '#f39c12',
        themeAccent: conf.themeAccent || '#c0392b',
        metaTitle: conf.metaTitle || '',
        metaDescription: conf.metaDescription || '',
        scientificSessions: conf.scientificSessions || [],
        pricingTiers: conf.pricingTiers || [],
        seriesId: conf.series?.id || '',
        year: conf.year || new Date().getFullYear(),
        showCommittee: conf.showCommittee !== false,
        guidelines: conf.guidelines || DEFAULT_GUIDELINES
      });
      
      // Fetch fresh details with photos
      api.get(`/api/conference-details?id=${conf.id}`)
        .then(freshConf => {
          setEditingConf(freshConf);
        })
        .catch(err => {
          console.error("Failed to load fresh details", err);
        });

      fetchSpeakersForConf(conf.id);
      fetchSessionsForConf(conf.id);
      setImportantDates([]);
      fetchImportantDatesForConf(conf.id);
    } else {
      setFormData({
        tittle: '', slug: '', description: '', startDate: '', endDate: '',
        venue: '', city: '', country: '', contactEmail: '', contactPhone: '',
        themePrimary: '#e74c3c', themeSecondary: '#f39c12', themeAccent: '#c0392b',
        metaTitle: '', metaDescription: '',
        scientificSessions: [], pricingTiers: [],
        seriesId: '', year: new Date().getFullYear(),
        showCommittee: true, guidelines: DEFAULT_GUIDELINES
      });
    }
    setShowModal(true);
  };

  const fetchSpeakersForConf = async (confId) => {
    try {
      const data = await api.get(`/api/speakers?conferenceId=${confId}`);
      setSpeakers(data || []);
    } catch (e) { console.error(e); }
  };

  const fetchSessionsForConf = async (confId) => {
    try {
      const data = await api.get(`/api/sessions?conferenceId=${confId}`);
      setSessionsList(data || []);
    } catch (e) { console.error(e); }
  };

  const fetchImportantDatesForConf = async (confId) => {
    try {
      const data = await api.get(`/api/admin/conference-details/${confId}/important-dates`);
      setImportantDates(data || []);
    } catch (e) {
      console.error("Failed to fetch important dates", e);
    }
  };

  const handleSaveImportantDate = async (e) => {
    e.preventDefault();
    if (!editingConf) return;
    
    setLoading(true);
    try {
      if (editingDate) {
        const updated = await api.put(`/api/admin/important-dates/${editingDate.id}`, dateFormData);
        setImportantDates(prev => prev.map(d => d.id === editingDate.id ? updated : d));
        toast.success("✓ Important date updated successfully!");
      } else {
        const created = await api.post(`/api/admin/conference-details/${editingConf.id}/important-dates`, dateFormData);
        setImportantDates(prev => [...prev, created]);
        toast.success("✓ Important date added successfully!");
      }
      
      setShowImportantDateForm(false);
      setEditingDate(null);
      setDateFormData({ eventTitle: '', eventDescription: '', eventDate: '', isActive: true, isHighlighted: false });
    } catch (err) {
      toast.error(err.message || 'Failed to save important date.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImportantDate = async (dateId) => {
    if (!(await confirmDialog('Are you sure you want to delete this important date?', 'Delete Important Date'))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/important-dates/${dateId}`);
      setImportantDates(prev => prev.filter(d => d.id !== dateId));
      toast.success('✓ Important date deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete important date.');
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id) => {
    if (!(await confirmDialog('Archive this conference? It can be restored later.', 'Archive Conference'))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/conference-details/${id}`);
      toast.success('✓ Conference archived successfully!');
      await fetchConferences();
    } catch (e) { toast.error('Failed to archive conference.'); }
    finally { setLoading(false); }
  };

  const handleRestore = async (id) => {
    if (!(await confirmDialog('Restore this conference from archives?', 'Restore Conference'))) return;
    setLoading(true);
    try {
      await api.put(`/api/admin/conference-details/${id}/restore`);
      toast.success('✓ Conference restored successfully!');
      await fetchConferences();
    } catch (e) { toast.error('Failed to restore conference.'); }
    finally { setLoading(false); }
  };

  const handleForceDelete = async (id) => {
    if (!(await confirmDialog('Are you absolutely sure? This will PERMANENTLY delete the conference and all associated data.', 'Delete Conference Permanently'))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/conference-details/${id}/force`);
      toast.success('✓ Conference permanently deleted!');
      await fetchConferences();
    } catch (e) { toast.error('Failed to permanently delete conference.'); }
    finally { setLoading(false); }
  };

  const handleToggleImportantDateFlag = async (date, field) => {
    const updatedPayload = {
      ...date,
      [field]: !date[field]
    };
    try {
      const updated = await api.put(`/api/admin/important-dates/${date.id}`, updatedPayload);
      setImportantDates(prev => prev.map(d => d.id === date.id ? updated : d));
      setSuccess('Status updated successfully.');
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleMoveImportantDate = async (index, direction) => {
    const newDates = [...importantDates];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newDates.length) return;
    
    const temp = newDates[index];
    newDates[index] = newDates[targetIndex];
    newDates[targetIndex] = temp;
    
    setImportantDates(newDates);
    
    try {
      const ids = newDates.map(d => d.id);
      await api.put(`/api/admin/conference-details/${editingConf.id}/important-dates/reorder`, ids);
      setSuccess('Dates order saved successfully.');
    } catch (err) {
      setError('Failed to save order in backend.');
    }
  };

  // ── Step 1: Save basic details ──
  const handleSaveStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...editingConf,
        ...formData,
        series: formData.seriesId ? { id: parseInt(formData.seriesId) } : null,
        year: parseInt(formData.year)
      };
      const saved = await api.post('/api/admin/conference-details', payload);
      let finalConf = saved;

      if (photoFile && saved.id) {
        const fd = new FormData();
        fd.append('file', photoFile);
        finalConf = await api.postMultipart(`/api/admin/conference-details/${saved.id}/photo`, fd);
      }
      if (brochureFile && saved.id) {
        const bd = new FormData();
        bd.append('file', brochureFile);
        finalConf = await api.postMultipart(`/api/admin/conference-details/${saved.id}/brochure`, bd);
      }
      if (aboutImageFile && saved.id) {
        const ad = new FormData();
        ad.append('file', aboutImageFile);
        finalConf = await api.postMultipart(`/api/admin/conference-details/${saved.id}/about-image`, ad);
      }

      await fetchConferences();
      setActiveConferenceId(saved.id.toString());
      setEditingConf(finalConf);
      setStep(2);
    } catch (err) {
      setError('Failed to save conference details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadExtraPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !editingConf) return;
    
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const updatedConf = await api.postMultipart(`/api/admin/conference-details/${editingConf.id}/photo`, fd);
      
      setEditingConf(updatedConf);
      await fetchConferences();
    } catch (err) {
      setError('Failed to upload background image.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimaryPhoto = async (photoId) => {
    if (!editingConf) return;
    setLoading(true);
    setError('');
    try {
      await api.put(`/api/admin/conference-photos/${photoId}/primary`, {});
      const updatedConf = await api.get(`/api/conference-details?id=${editingConf.id}`);
      setEditingConf(updatedConf);
      await fetchConferences();
    } catch (err) {
      setError('Failed to set primary image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!editingConf) return;
    if (!(await confirmDialog('Are you sure you want to delete this background image?'))) return;
    setLoading(true);
    setError('');
    try {
      await api.delete(`/api/admin/conference-photos/${photoId}`);
      const updatedConf = await api.get(`/api/conference-details?id=${editingConf.id}`);
      setEditingConf(updatedConf);
      await fetchConferences();
    } catch (err) {
      setError('Failed to delete image.');
    } finally {
      setLoading(false);
    }
  };

  const handleMovePhoto = async (fromIdx, toIdx) => {
    if (!editingConf || !editingConf.photos) return;
    setLoading(true);
    setError('');
    try {
      const reorderedPhotos = [...editingConf.photos];
      const [removed] = reorderedPhotos.splice(fromIdx, 1);
      reorderedPhotos.splice(toIdx, 0, removed);
      
      const photoIds = reorderedPhotos.map(p => p.id);
      const updatedConf = await api.put(`/api/admin/conference-details/${editingConf.id}/photos/reorder`, photoIds);
      
      setEditingConf(updatedConf);
      await fetchConferences();
    } catch (err) {
      setError('Failed to reorder images.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Add speaker ──
  const handleAddSpeaker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...speakerData, conferenceId: editingConf.id };
      const savedSpk = await api.post('/api/admin/speakers', payload);
      if (speakerPhoto && savedSpk.id) {
        const fd = new FormData();
        fd.append('file', speakerPhoto);
        await api.postMultipart(`/api/admin/speakers/${savedSpk.id}/photo`, fd);
      }
      await fetchSpeakersForConf(editingConf.id);
      setShowSpeakerForm(false);
      setSpeakerData({ name: '', designation: '', affiliation: '', country: '', bio: '', type: 'KEYNOTE_SPEAKER', speakerAbstract: '' });
      setSpeakerPhoto(null);
    } catch (err) { setError('Failed to save speaker.'); }
    finally { setLoading(false); }
  };

  const handleDeleteSpeaker = async (id) => {
    if (!(await confirmDialog('Delete this speaker?'))) return;
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      await fetchSpeakersForConf(editingConf.id);
    } catch (e) { setError('Failed to delete speaker'); }
  };

  // ── Step 3: Add session ──
  const handleAddSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...sessionData, conferenceId: editingConf.id };
      await api.post('/api/admin/sessions', payload);
      await fetchSessionsForConf(editingConf.id);
      setShowSessionForm(false);
      setSessionData({ name: '', timeRange: '', speakerName: '', affiliation: '', type: 'KEYNOTE' });
    } catch (err) { setError('Failed to save session.'); }
    finally { setLoading(false); }
  };

  const handleDeleteSession = async (id) => {
    if (!(await confirmDialog('Delete this session?'))) return;
    try {
      await api.delete(`/api/admin/sessions/${id}`);
      await fetchSessionsForConf(editingConf.id);
    } catch (e) { setError('Failed to delete session'); }
  };

  // ── Track management ──
  const handleTrackChange = (index, value) => {
    const arr = [...formData.scientificSessions];
    arr[index] = value;
    setFormData({ ...formData, scientificSessions: arr });
  };
  const addTrack = () => setFormData({ ...formData, scientificSessions: [...formData.scientificSessions, ''] });
  const removeTrack = (i) => setFormData({ ...formData, scientificSessions: formData.scientificSessions.filter((_, idx) => idx !== i) });

  // ── Pricing management ──
  const handlePricingChange = (i, field, value) => {
    const arr = [...formData.pricingTiers];
    arr[i][field] = value;
    setFormData({ ...formData, pricingTiers: arr });
  };
  const addPricingTier = () => setFormData({ ...formData, pricingTiers: [...formData.pricingTiers, { type: '', earlyPrice: 0, midPrice: 0, finalPrice: 0 }] });
  const removePricingTier = (i) => setFormData({ ...formData, pricingTiers: formData.pricingTiers.filter((_, idx) => idx !== i) });

  // ── Final save ──
  const handleFinalSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...editingConf,
        ...formData,
        series: formData.seriesId ? { id: parseInt(formData.seriesId) } : null,
        year: parseInt(formData.year)
      };
      await api.post('/api/admin/conference-details', payload);
      setSuccess('Conference saved successfully!');
      setShowModal(false);
      fetchConferences();
    } catch (err) {
      setError('Failed to save conference.');
    } finally { setLoading(false); }
  };

  // ── Delete/Restore/Force conference ──
  const handleDelete = async (id) => {
    if (!(await confirmDialog('Are you sure you want to archive this conference? It can be restored later.', 'Archive Conference'))) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/conference-details/${id}`);
      toast.success('✓ Conference archived successfully!');
      await fetchConferences();
    } catch (e) { toast.error('Failed to archive conference.'); }
    finally { setLoading(false); }
  };

  const checkConfReadiness = (c) => {
    const issues = [];
    if (!c.venue || !c.venue.trim()) issues.push("Venue");
    if (!c.startDate || !c.endDate) issues.push("Dates");
    if (!c.photo?.fileName) issues.push("Logo");
    if (!c.contactEmail || !c.contactPhone) issues.push("Contact Details");
    if (!c.pricingTiers || c.pricingTiers.length === 0) issues.push("Pricing Options");
    return {
      isReady: issues.length === 0,
      issues
    };
  };

  const handleCreateSeries = async (e) => {
    e.preventDefault();
    if (!newSeries.name || !newSeries.code) {
      setError("Series Name and Code are required.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const saved = await api.post('/api/admin/series', newSeries);
      setSeriesList(prev => [...prev, saved]);
      setFormData(prev => ({ ...prev, seriesId: saved.id.toString() }));
      setNewSeries({ name: '', code: '', description: '' });
      setShowSeriesForm(false);
      setSuccess('New Series created successfully!');
    } catch (err) {
      setError('Failed to create Series: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCloneModal = (conf) => {
    setCloningConf(conf);
    setCloneData({
      year: (conf.year || new Date().getFullYear()) + 1,
      startDate: '',
      endDate: ''
    });
  };

  const handleClone = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/admin/conferences/${cloningConf.id}/clone`, cloneData);
      setSuccess('Conference cloned successfully!');
      setCloningConf(null);
      fetchConferences();
    } catch (err) {
      setError('Failed to clone conference: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status || status === 'PUBLISHED') return 'status-published';
    return `status-${status.toLowerCase()}`;
  };

  // ── Wizard step labels ──
  const wizardSteps = [
    { num: 1, label: 'Details & Branding' },
    { num: 2, label: 'Speakers' },
    { num: 3, label: 'Program & Tracks' },
    { num: 4, label: 'Pricing' },
    { num: 5, label: 'Important Dates' }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Conferences</h2>
          <p>Create, manage, and publish conferences.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => handleOpenModal()}>
          + Create Conference
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">⚠ {error}</div>}
      {success && <div className="admin-alert admin-alert-success">✓ {success}</div>}

      {/* Table Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--admin-border-subtle)', marginBottom: '16px', gap: '4px' }}>
        <button
          type="button"
          className={`admin-tab-btn ${archiveTab === 'ACTIVE' ? 'active' : ''}`}
          onClick={() => setArchiveTab('ACTIVE')}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: archiveTab === 'ACTIVE' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: archiveTab === 'ACTIVE' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          📁 Active Conferences
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${archiveTab === 'ARCHIVED' ? 'active' : ''}`}
          onClick={() => setArchiveTab('ARCHIVED')}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: archiveTab === 'ARCHIVED' ? '2px solid var(--admin-primary)' : '2px solid transparent',
            color: archiveTab === 'ARCHIVED' ? 'var(--admin-primary)' : 'var(--admin-text-secondary)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          📦 Archived / Soft-Deleted
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search conferences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="admin-filter-group">
            <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
            </select>
          </div>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Conference</th>
                <th>Slug</th>
                <th>Dates</th>
                <th>Venue</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConferences.map(conf => (
                <tr key={conf.id}>
                  <td>
                    {conf.photo?.fileName ? (
                      <img className="admin-thumb" src={`${BASE_URL}/uploads/conference/${conf.photo.fileName}`} alt="" />
                    ) : (
                      <div className="admin-thumb-placeholder">📷</div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--admin-text)', fontSize: '13.5px' }}>
                      {conf.tittle || conf.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-muted)', marginTop: '2px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conf.description}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', padding: '3px 8px', background: 'var(--admin-bg)', borderRadius: '4px', color: 'var(--admin-primary)', fontWeight: 600 }}>
                      {conf.slug || `conf-${conf.id}`}
                    </code>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', whiteSpace: 'nowrap' }}>
                    {conf.startDate ? `${conf.startDate} — ${conf.endDate}` : 'TBD'}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    {conf.venue || 'TBA'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      <span className={`status-badge ${getStatusClass(conf.status)}`}>
                        {conf.status || 'Published'}
                      </span>
                      {conf.status === 'DRAFT' && (() => {
                        const readiness = checkConfReadiness(conf);
                        if (!readiness.isReady) {
                          return (
                            <span 
                              title={`Missing: ${readiness.issues.join(', ')}`}
                              style={{ 
                                fontSize: '11px', 
                                color: '#d35400', 
                                background: '#fef5e7', 
                                border: '1px solid #f5c0b0',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px',
                                cursor: 'help'
                              }}
                            >
                              ⚠️ Incomplete
                            </span>
                          );
                        } else {
                          return (
                            <span 
                              style={{ 
                                fontSize: '11px', 
                                color: '#27ae60', 
                                background: '#ebf5fb', 
                                border: '1px solid #d5dbdb',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              ✓ Ready
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {archiveTab === 'ACTIVE' ? (
                        <>
                          <a
                            href={`/?subdomain=${conf.slug || conf.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-admin btn-admin-sm"
                            style={{ textDecoration: 'none' }}
                            title="Preview"
                          >👁️</a>
                          <button className="btn-admin btn-admin-sm" onClick={() => handleOpenCloneModal(conf)} title="Clone / Duplicate">👥</button>
                          <button className="btn-admin btn-admin-sm" onClick={() => handleOpenModal(conf)} title="Edit">✏️</button>
                          <button className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => handleDelete(conf.id)} title="Archive">🗑️</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-admin btn-admin-sm btn-admin-success" onClick={() => handleRestore(conf.id)} title="Restore">♻️ Restore</button>
                          <button className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => handleForceDelete(conf.id)} title="Delete Permanently">🗑️ Delete</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredConferences.length === 0 && (
                <tr>
                  <td colSpan="7">
                    <div className="admin-empty-state">
                      <div className="admin-empty-state-icon">🏢</div>
                      <div className="admin-empty-state-title">No conferences found</div>
                      <div className="admin-empty-state-text">Create your first conference to get started.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredConferences.length > 0 && (
          <div className="admin-table-pagination">
            <span>Showing {filteredConferences.length} of {conferences.length} conferences</span>
            <div className="pagination-buttons">
              <button className="pagination-btn" disabled>‹</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn" disabled>›</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="admin-modal admin-modal-lg">
            <div className="admin-modal-header">
              <h3>{editingConf ? 'Edit Conference' : 'Create Conference'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            {/* Wizard Steps */}
            <div style={{ padding: '20px 28px 0' }}>
              <div className="admin-wizard-steps">
                {wizardSteps.map(ws => (
                  <div key={ws.num} className={`wizard-step ${step === ws.num ? 'active' : ''} ${step > ws.num ? 'completed' : ''}`}>
                    <div className="wizard-step-number">{step > ws.num ? '✓' : ws.num}</div>
                    <span className="wizard-step-label">{ws.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modal-body">
              {error && <div className="admin-alert admin-alert-error" style={{ marginBottom: '16px' }}>⚠ {error}</div>}

              {/* ── STEP 1: Details & Branding ── */}
              {step === 1 && (
                <form id="confStep1" onSubmit={handleSaveStep1}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Conference Title <span className="required">*</span></label>
                    <input
                      required type="text" className="admin-form-input"
                      placeholder="e.g. Global Congress on Food Science 2027"
                      value={formData.tittle}
                      onChange={e => handleTitleChange(e.target.value)}
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Conference Series</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select
                          className="admin-form-select"
                          style={{ flex: 1 }}
                          value={formData.seriesId}
                          onChange={e => setFormData({ ...formData, seriesId: e.target.value })}
                        >
                          <option value="">-- Select Series (Optional) --</option>
                          {seriesList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-admin"
                          onClick={() => setShowSeriesForm(!showSeriesForm)}
                          title="Create New Series"
                        >
                          {showSeriesForm ? '✕ Close' : '➕ New'}
                        </button>
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Conference Year <span className="required">*</span></label>
                      <input
                        required
                        type="number"
                        className="admin-form-input"
                        placeholder="e.g. 2027"
                        value={formData.year}
                        onChange={e => handleYearChange(parseInt(e.target.value) || '')}
                      />
                    </div>
                  </div>

                  {showSeriesForm && (
                    <div style={{
                      background: 'var(--admin-bg)',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--admin-border)',
                      marginBottom: '16px'
                    }}>
                      <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--admin-text)' }}>Create New Conference Series</h4>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Series Name <span className="required">*</span></label>
                          <input
                            type="text"
                            className="admin-form-input"
                            placeholder="e.g. Global Congress on Nursing"
                            value={newSeries.name}
                            onChange={e => setNewSeries({ ...newSeries, name: e.target.value })}
                          />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Series Code <span className="required">*</span></label>
                          <input
                            type="text"
                            className="admin-form-input"
                            placeholder="e.g. GCN"
                            value={newSeries.code}
                            onChange={e => setNewSeries({ ...newSeries, code: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Description</label>
                        <textarea
                          className="admin-form-textarea"
                          style={{ minHeight: '60px' }}
                          placeholder="Series details..."
                          value={newSeries.description}
                          onChange={e => setNewSeries({ ...newSeries, description: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-admin btn-admin-sm" onClick={() => setShowSeriesForm(false)}>Cancel</button>
                        <button type="button" className="btn-admin btn-admin-sm btn-admin-primary" onClick={handleCreateSeries}>Save Series</button>
                      </div>
                    </div>
                  )}

                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug</label>
                    <input
                      type="text" className="admin-form-input"
                      placeholder="auto-generated-slug"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    />
                    <span className="admin-form-hint">
                      Live Preview: <strong style={{ color: 'var(--admin-primary)' }}>{formData.slug || 'your-slug'}</strong>
                    </span>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Description</label>
                    <textarea className="admin-form-textarea" placeholder="Conference description..." value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Submission Guidelines (Markdown/HTML supported)</label>
                    <textarea className="admin-form-textarea" style={{ minHeight: '150px' }} placeholder="Enter submission guidelines here..." value={formData.guidelines}
                      onChange={e => setFormData({ ...formData, guidelines: e.target.value })} />
                    <span className="admin-form-hint">These will appear on the Submit Abstract page.</span>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">About the Congress Section Image</label>
                    <div className="admin-file-upload" onClick={() => document.getElementById('aboutImageInput').click()}>
                      <div className="admin-file-upload-icon">🖼️</div>
                      <div className="admin-file-upload-text">
                        {aboutImageFile ? aboutImageFile.name : (editingConf?.aboutImage ? 'Change About Image' : 'Click to upload image')}
                      </div>
                      <div className="admin-file-upload-hint">JPG, PNG, WebP — Max 5MB</div>
                      <input id="aboutImageInput" type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => setAboutImageFile(e.target.files[0])} />
                    </div>
                    {editingConf?.aboutImage && !aboutImageFile && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Current image:</span>
                        <img 
                          src={editingConf.aboutImage.startsWith('http') ? editingConf.aboutImage : `${BASE_URL}/uploads/conference/${editingConf.aboutImage}`} 
                          style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                        />
                      </div>
                    )}
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Start Date</label>
                      <input type="date" className="admin-form-input" value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">End Date</label>
                      <input type="date" className="admin-form-input" value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Venue</label>
                    <input type="text" className="admin-form-input" placeholder="e.g. Hilton Conference Center" value={formData.venue}
                      onChange={e => setFormData({ ...formData, venue: e.target.value })} />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Contact Email</label>
                      <input type="email" className="admin-form-input" placeholder="contact@conference.com" value={formData.contactEmail}
                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Contact Phone</label>
                      <input type="tel" className="admin-form-input" placeholder="+1 234 567 890" value={formData.contactPhone}
                        onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Theme Colors</label>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {[
                        ['themePrimary', 'Primary'],
                        ['themeSecondary', 'Secondary'],
                        ['themeAccent', 'Accent']
                      ].map(([key, label]) => (
                        <div key={key} className="admin-color-row">
                          <input type="color" className="admin-color-input" value={formData[key]}
                            onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--admin-text)' }}>{label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)', fontFamily: 'monospace' }}>{formData[key]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Global Section Visibility</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.showCommittee !== false} 
                        onChange={(e) => setFormData({ ...formData, showCommittee: e.target.checked })}
                      />
                      Show Organizing Committee Section on Website
                    </label>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Conference Photo</label>
                      <div className="admin-file-upload" onClick={() => document.getElementById('photoInput').click()}>
                        <div className="admin-file-upload-icon">📷</div>
                        <div className="admin-file-upload-text">{photoFile ? photoFile.name : 'Click to upload photo'}</div>
                        <div className="admin-file-upload-hint">JPG, PNG, WebP — Max 5MB</div>
                        <input id="photoInput" type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={e => setPhotoFile(e.target.files[0])} />
                      </div>
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Brochure PDF</label>
                      <div className="admin-file-upload" onClick={() => document.getElementById('brochureInput').click()}>
                        <div className="admin-file-upload-icon">📄</div>
                        <div className="admin-file-upload-text">{brochureFile ? brochureFile.name : 'Click to upload brochure'}</div>
                        <div className="admin-file-upload-hint">PDF only — Max 25MB</div>
                        <input id="brochureInput" type="file" accept="application/pdf" style={{ display: 'none' }}
                          onChange={e => setBrochureFile(e.target.files[0])} />
                      </div>
                    </div>
                  </div>

                  {editingConf && (
                    <div className="admin-form-group" style={{ width: '100%', marginTop: '20px', marginBottom: '20px' }}>
                      <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Conference Background Images (Hero Slider)</span>
                        <div>
                          <button 
                            type="button" 
                            className="btn-admin btn-admin-primary" 
                            style={{ padding: '6px 12px', fontSize: '13px', margin: 0 }} 
                            onClick={() => document.getElementById('extraPhotoInput').click()}
                          >
                            + Upload Image
                          </button>
                          <input 
                            id="extraPhotoInput" 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={handleUploadExtraPhoto} 
                          />
                        </div>
                      </label>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
                        {editingConf.photos && editingConf.photos.map((p, idx) => (
                          <div key={p.id} style={{ position: 'relative', width: '120px', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ height: '80px', overflow: 'hidden', position: 'relative' }}>
                              <img src={`${BASE_URL}/uploads/conference/${p.fileName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {p.isPrimary && (
                                <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#22c55e', color: '#fff', fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' }}>
                                  Primary
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px', borderTop: '1px solid #cbd5e1', backgroundColor: '#fff', gap: '4px' }}>
                              {!p.isPrimary && (
                                <button type="button" title="Set Primary" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }} onClick={() => handleSetPrimaryPhoto(p.id)}>
                                  ⭐
                                </button>
                              )}
                              <button type="button" title="Delete" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', color: '#ef4444', padding: 0 }} onClick={() => handleDeletePhoto(p.id)}>
                                🗑️
                              </button>
                              {idx > 0 && (
                                <button type="button" title="Move Left" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }} onClick={() => handleMovePhoto(idx, idx - 1)}>
                                  ◀️
                                </button>
                              )}
                              {idx < editingConf.photos.length - 1 && (
                                <button type="button" title="Move Right" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '13px', padding: 0 }} onClick={() => handleMovePhoto(idx, idx + 1)}>
                                  ▶️
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {(!editingConf.photos || editingConf.photos.length === 0) && (
                          <p style={{ color: '#64748b', fontSize: '13px', margin: 0, padding: '10px' }}>No background images uploaded yet. Please upload at least one image.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-form-label">SEO Title</label>
                      <input type="text" className="admin-form-input" placeholder="SEO meta title" value={formData.metaTitle}
                        onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">SEO Description</label>
                      <input type="text" className="admin-form-input" placeholder="SEO meta description" value={formData.metaDescription}
                        onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} />
                    </div>
                  </div>
                </form>
              )}

              {/* ── STEP 2: Speakers ── */}
              {step === 2 && (
                <div>
                  <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    Add speakers to <strong>{editingConf?.tittle || editingConf?.title}</strong>.
                  </p>

                  {speakers.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                      {speakers.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', background: 'var(--admin-bg)',
                          border: '1px solid var(--admin-border-subtle)', borderRadius: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'var(--admin-primary-soft)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              overflow: 'hidden'
                            }}>
                              {s.photo?.fileName
                                ? <img src={`${BASE_URL}/uploads/speakers/${s.photo.fileName}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <span style={{ fontSize: '14px' }}>🎙️</span>
                              }
                            </div>
                            <div>
                              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text)' }}>{s.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>
                                {s.type?.replace(/_/g, ' ')} · {s.affiliation}
                              </div>
                            </div>
                          </div>
                          <button className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => handleDeleteSpeaker(s.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showSpeakerForm ? (
                    <button className="btn-admin" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', color: 'var(--admin-primary)' }}
                      onClick={() => setShowSpeakerForm(true)}>
                      + Add New Speaker
                    </button>
                  ) : (
                    <form onSubmit={handleAddSpeaker} style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Name <span className="required">*</span></label>
                        <input required className="admin-form-input" placeholder="Speaker name" value={speakerData.name}
                          onChange={e => setSpeakerData({ ...speakerData, name: e.target.value })} />
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Designation <span className="required">*</span></label>
                          <input required className="admin-form-input" placeholder="e.g. Professor" value={speakerData.designation}
                            onChange={e => setSpeakerData({ ...speakerData, designation: e.target.value })} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Affiliation <span className="required">*</span></label>
                          <input required className="admin-form-input" placeholder="University / Company" value={speakerData.affiliation}
                            onChange={e => setSpeakerData({ ...speakerData, affiliation: e.target.value })} />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Country <span className="required">*</span></label>
                          <input required className="admin-form-input" placeholder="Country" value={speakerData.country}
                            onChange={e => setSpeakerData({ ...speakerData, country: e.target.value })} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Type</label>
                          <select className="admin-form-select" value={speakerData.type}
                            onChange={e => setSpeakerData({ ...speakerData, type: e.target.value })}>
                            <option value="KEYNOTE_SPEAKER">Keynote Speaker</option>
                            <option value="SPEAKER">General Speaker</option>
                            <option value="PAST_SPEAKER">Past Speaker</option>
                            <option value="ADVISORY_BOARD">Advisory Board</option>
                          </select>
                        </div>
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Biography <span className="required">*</span></label>
                        <textarea required className="admin-form-textarea" placeholder="Speaker bio..." value={speakerData.bio}
                          onChange={e => setSpeakerData({ ...speakerData, bio: e.target.value })} />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Photo</label>
                        <input type="file" accept="image/*" onChange={e => setSpeakerPhoto(e.target.files[0])}
                          style={{ fontSize: '13px', color: 'var(--admin-text-secondary)' }} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="button" className="btn-admin" onClick={() => setShowSpeakerForm(false)}>Cancel</button>
                        <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Speaker'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ── STEP 3: Program & Tracks ── */}
              {step === 3 && (
                <div>
                  <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    Build the scientific program schedule.
                  </p>

                  {/* Sessions */}
                  {sessionsList.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                      {sessionsList.map(s => (
                        <div key={s.id} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 14px', background: 'var(--admin-bg)',
                          border: '1px solid var(--admin-border-subtle)', borderRadius: '8px'
                        }}>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--admin-text)' }}>
                              {s.timeRange} — {s.name}
                            </div>
                            {s.speakerName && <div style={{ fontSize: '11px', color: 'var(--admin-text-muted)' }}>{s.speakerName} · {s.affiliation}</div>}
                          </div>
                          <button className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => handleDeleteSession(s.id)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {!showSessionForm ? (
                    <button className="btn-admin" style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', color: 'var(--admin-primary)' }}
                      onClick={() => setShowSessionForm(true)}>
                      + Add Program Session
                    </button>
                  ) : (
                    <form onSubmit={handleAddSession} style={{ background: 'var(--admin-bg)', padding: '20px', borderRadius: '10px', border: '1px solid var(--admin-border)' }}>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Time Range <span className="required">*</span></label>
                          <input required className="admin-form-input" placeholder="09:00 - 09:30 EST" value={sessionData.timeRange}
                            onChange={e => setSessionData({ ...sessionData, timeRange: e.target.value })} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Session Title <span className="required">*</span></label>
                          <input required className="admin-form-input" placeholder="Session title" value={sessionData.name}
                            onChange={e => setSessionData({ ...sessionData, name: e.target.value })} />
                        </div>
                      </div>
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label className="admin-form-label">Speaker Name</label>
                          <input className="admin-form-input" placeholder="Speaker (optional)" value={sessionData.speakerName}
                            onChange={e => setSessionData({ ...sessionData, speakerName: e.target.value })} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Affiliation</label>
                          <input className="admin-form-input" placeholder="Affiliation (optional)" value={sessionData.affiliation}
                            onChange={e => setSessionData({ ...sessionData, affiliation: e.target.value })} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button type="button" className="btn-admin" onClick={() => setShowSessionForm(false)}>Cancel</button>
                        <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Session'}
                        </button>
                      </div>
                    </form>
                  )}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--admin-border)', margin: '24px 0' }} />

                  {/* Scientific Tracks */}
                  <div className="dashboard-section-title" style={{ marginBottom: '12px' }}>📑 Scientific Tracks</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.scientificSessions.map((track, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px' }}>
                        <input className="admin-form-input" placeholder="e.g. Advanced Nanomaterials" value={track}
                          onChange={e => handleTrackChange(i, e.target.value)} style={{ flex: 1 }} />
                        <button type="button" className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => removeTrack(i)}>×</button>
                      </div>
                    ))}
                    <button type="button" className="btn-admin btn-admin-sm" onClick={addTrack} style={{ alignSelf: 'flex-start', borderStyle: 'dashed', color: 'var(--admin-primary)' }}>
                      + Add Track
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Pricing ── */}
              {step === 4 && (
                <div>
                  <p style={{ margin: '0 0 18px', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                    Define registration pricing tiers.
                  </p>
                  {formData.pricingTiers.map((tier, i) => (
                    <div key={i} style={{
                      padding: '16px', background: 'var(--admin-bg)', borderRadius: '10px',
                      border: '1px solid var(--admin-border)', marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <input className="admin-form-input" placeholder="Type (e.g. Academic, Student)" value={tier.type}
                          onChange={e => handlePricingChange(i, 'type', e.target.value)} style={{ width: '70%' }} />
                        <button type="button" className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => removePricingTier(i)}>Remove</button>
                      </div>
                      <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Early Bird ($)</label>
                          <input type="number" className="admin-form-input" value={tier.earlyPrice}
                            onChange={e => handlePricingChange(i, 'earlyPrice', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Regular ($)</label>
                          <input type="number" className="admin-form-input" value={tier.midPrice}
                            onChange={e => handlePricingChange(i, 'midPrice', e.target.value)} />
                        </div>
                        <div className="admin-form-group">
                          <label className="admin-form-label">Final ($)</label>
                          <input type="number" className="admin-form-input" value={tier.finalPrice}
                            onChange={e => handlePricingChange(i, 'finalPrice', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn-admin" onClick={addPricingTier}
                    style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed', color: 'var(--admin-primary)' }}>
                    + Add Pricing Tier
                  </button>
                </div>
              )}

              {/* ── STEP 5: Important Dates ── */}
              {step === 5 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
                      Manage milestones, deadlines, and highlights.
                    </p>
                    {!showImportantDateForm && (
                      <button type="button" className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => {
                        setEditingDate(null);
                        setDateFormData({ eventTitle: '', eventDescription: '', eventDate: '', isActive: true, isHighlighted: false });
                        setShowImportantDateForm(true);
                      }}>
                        + Add Milestone
                      </button>
                    )}
                  </div>

                  {showImportantDateForm && (
                    <form onSubmit={handleSaveImportantDate} style={{
                      padding: '16px', background: 'var(--admin-bg)', borderRadius: '10px',
                      border: '1px solid var(--admin-border)', marginBottom: '20px'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                        {editingDate ? 'Edit Milestone' : 'Add New Milestone'}
                      </h4>
                      <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                        <label className="admin-form-label">Event Title *</label>
                        <input className="admin-form-input" placeholder="e.g. Abstract Submission Opens" required
                          value={dateFormData.eventTitle} onChange={e => setDateFormData(prev => ({ ...prev, eventTitle: e.target.value }))} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                        <label className="admin-form-label">Event Description</label>
                        <input className="admin-form-input" placeholder="e.g. Optional description or details"
                          value={dateFormData.eventDescription} onChange={e => setDateFormData(prev => ({ ...prev, eventDescription: e.target.value }))} />
                      </div>
                      <div className="admin-form-group" style={{ marginBottom: '16px' }}>
                        <label className="admin-form-label">Event Date *</label>
                        <input type="date" className="admin-form-input" required
                          value={dateFormData.eventDate} onChange={e => setDateFormData(prev => ({ ...prev, eventDate: e.target.value }))} />
                      </div>
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="checkbox" checked={dateFormData.isActive}
                            onChange={e => setDateFormData(prev => ({ ...prev, isActive: e.target.checked }))} />
                          Active (Visible on Site)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input type="checkbox" checked={dateFormData.isHighlighted}
                            onChange={e => setDateFormData(prev => ({ ...prev, isHighlighted: e.target.checked }))} />
                          Highlight (Mark as Important)
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn-admin btn-admin-sm" onClick={() => setShowImportantDateForm(false)}>Cancel</button>
                        <button type="submit" className="btn-admin btn-admin-primary btn-admin-sm" disabled={loading}>
                          {loading ? 'Saving...' : 'Save Date'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="admin-table-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Event</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Highlight</th>
                          <th>Order</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importantDates.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--admin-text-secondary)' }}>
                              No milestones added yet. Add one to get started!
                            </td>
                          </tr>
                        ) : (
                          importantDates.map((item, index) => (
                            <tr key={item.id}>
                              <td>
                                <div style={{ fontWeight: '600' }}>{item.eventTitle}</div>
                                <div style={{ fontSize: '11px', color: 'var(--admin-text-secondary)' }}>{item.eventDescription}</div>
                              </td>
                              <td style={{ fontSize: '13px' }}>{item.eventDate}</td>
                              <td>
                                <button type="button" 
                                  onClick={() => handleToggleImportantDateFlag(item, 'isActive')}
                                  style={{
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    fontSize: '18px'
                                  }}
                                  title={item.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {item.isActive ? '🟢' : '🔴'}
                                </button>
                              </td>
                              <td>
                                <button type="button" 
                                  onClick={() => handleToggleImportantDateFlag(item, 'isHighlighted')}
                                  style={{
                                    border: 'none', background: 'none', cursor: 'pointer',
                                    fontSize: '18px'
                                  }}
                                  title={item.isHighlighted ? 'Remove Highlight' : 'Highlight'}
                                >
                                  {item.isHighlighted ? '⭐' : '☆'}
                                </button>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button type="button" className="btn-admin btn-admin-sm" disabled={index === 0}
                                    onClick={() => handleMoveImportantDate(index, -1)} style={{ padding: '2px 6px' }}>▲</button>
                                  <button type="button" className="btn-admin btn-admin-sm" disabled={index === importantDates.length - 1}
                                    onClick={() => handleMoveImportantDate(index, 1)} style={{ padding: '2px 6px' }}>▼</button>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button type="button" className="btn-admin btn-admin-sm" onClick={() => {
                                    setEditingDate(item);
                                    setDateFormData({
                                      eventTitle: item.eventTitle,
                                      eventDescription: item.eventDescription || '',
                                      eventDate: item.eventDate,
                                      isActive: item.isActive,
                                      isHighlighted: item.isHighlighted
                                    });
                                    setShowImportantDateForm(true);
                                  }}>Edit</button>
                                  <button type="button" className="btn-admin btn-admin-sm btn-admin-danger" 
                                    onClick={() => handleDeleteImportantDate(item.id)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="admin-modal-footer">
              {step === 1 && (
                <>
                  <button type="button" className="btn-admin" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" form="confStep1" className="btn-admin btn-admin-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save & Next →'}
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <button type="button" className="btn-admin" onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="btn-admin btn-admin-primary" onClick={() => setStep(3)}>Next: Program →</button>
                </>
              )}
              {step === 3 && (
                <>
                  <button type="button" className="btn-admin" onClick={() => setStep(2)}>← Back</button>
                  <button type="button" className="btn-admin btn-admin-primary" onClick={() => setStep(4)}>Next: Pricing →</button>
                </>
              )}
              {step === 4 && (
                <>
                  <button type="button" className="btn-admin" onClick={() => setStep(3)}>← Back</button>
                  <button type="button" className="btn-admin btn-admin-primary" onClick={() => setStep(5)}>Next: Dates →</button>
                </>
              )}
              {step === 5 && (
                <>
                  <button type="button" className="btn-admin" onClick={() => setStep(4)}>← Back</button>
                  <button type="button" className="btn-admin btn-admin-success" onClick={handleFinalSave} disabled={loading}>
                    {loading ? 'Saving...' : '✓ Save Conference'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Clone Modal ── */}
      {cloningConf && (
        <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setCloningConf(null)}>
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Clone Conference</h3>
              <button className="admin-modal-close" onClick={() => setCloningConf(null)}>×</button>
            </div>
            <form onSubmit={handleClone}>
              <div className="admin-modal-body">
                <p style={{ fontSize: '13px', color: 'var(--admin-text-secondary)', marginBottom: '16px' }}>
                  You are cloning <strong>{cloningConf.tittle || cloningConf.title}</strong>. This will copy the basic settings, tracks, sessions, sponsors, and speakers as a <strong>DRAFT</strong>.
                </p>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">New Conference Year <span className="required">*</span></label>
                  <input
                    required
                    type="number"
                    className="admin-form-input"
                    value={cloneData.year}
                    onChange={e => setCloneData({ ...cloneData, year: parseInt(e.target.value) || '' })}
                  />
                </div>
                
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">New Start Date <span className="required">*</span></label>
                    <input
                      required
                      type="date"
                      className="admin-form-input"
                      value={cloneData.startDate}
                      onChange={e => setCloneData({ ...cloneData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">New End Date <span className="required">*</span></label>
                    <input
                      required
                      type="date"
                      className="admin-form-input"
                      value={cloneData.endDate}
                      onChange={e => setCloneData({ ...cloneData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn-admin" onClick={() => setCloningConf(null)}>Cancel</button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>
                  {loading ? 'Cloning...' : '👥 Clone Conference'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceManager;
