import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api, BASE_URL } from '../../utils/api';

const BrochureManager = () => {
  const { activeConferenceId, conferences, refreshConferences } = useAdmin();
  const { toast } = useAdminDialog();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentBrochure, setCurrentBrochure] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (activeConferenceId) {
      fetchRequests();
      fetchConferenceDetails();
    }
  }, [activeConferenceId]);

  const fetchConferenceDetails = async () => {
    try {
      const data = await api.get(`/api/conference-details?id=${activeConferenceId}`);
      if (data && data.brochureFileName) {
        setCurrentBrochure(data.brochureFileName);
      } else {
        setCurrentBrochure('');
      }
    } catch (err) {
      console.error('Failed to load conference brochure details:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/brochures${qs}`);
      setRequests(data || []);
    } catch (err) {
      toast.error('Failed to fetch brochure requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrochureUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('Please select a PDF brochure file first.');
      return;
    }
    if (!activeConferenceId) {
      toast.warning('Please select a conference first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await api.postMultipart(`/api/admin/conference-details/${activeConferenceId}/brochure`, formData);
      toast.success('✓ Conference brochure PDF uploaded successfully!');
      setSelectedFile(null);
      if (res && res.brochureFileName) {
        setCurrentBrochure(res.brochureFileName);
      } else {
        fetchConferenceDetails();
      }
      if (refreshConferences) refreshConferences();
    } catch (err) {
      toast.error('Failed to upload brochure PDF.');
    } finally {
      setUploading(false);
    }
  };

  const getConferenceTitle = (confId) => {
    const conf = conferences.find(c => c.id.toString() === confId?.toString());
    return conf ? (conf.tittle || conf.title) : `Conf #${confId}`;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Brochure Management & Inquiries</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Upload the official conference brochure PDF for attendees to download, and view download inquiries.
          </p>
        </div>
      </div>

      {/* Brochure Upload Card */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <div className="dashboard-section-title" style={{ marginBottom: '16px' }}>
          📄 Official Conference Brochure PDF
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              Upload your high-resolution conference brochure (PDF format). When delegates click "Download Brochure" on the website, this PDF document will be provided.
            </p>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Currently Active Brochure:</div>
              {currentBrochure ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
                    📎 {currentBrochure}
                  </span>
                  <a
                    href={`${BASE_URL}/uploads/brochures/${currentBrochure}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: '6px',
                      fontSize: '13px',
                      textDecoration: 'none',
                      fontWeight: '500'
                    }}
                  >
                    View / Download PDF ↗
                  </a>
                </div>
              ) : (
                <span style={{ color: '#ef4444', fontWeight: '500', fontSize: '14px' }}>
                  ⚠️ No brochure uploaded yet for this conference.
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleBrochureUpload} style={{ background: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>📤</span>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#1e293b' }}>Upload New Brochure</h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>Select a PDF file (Max 50MB)</p>

            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              style={{ width: '100%', fontSize: '13px', marginBottom: '14px' }}
            />

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="btn-admin-primary"
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            >
              {uploading ? 'Uploading PDF...' : 'Upload & Save Brochure'}
            </button>
          </form>
        </div>
      </div>

      {/* Inquiries / Download Requests Table */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>
            Brochure Download Inquiries Database
          </h3>
        </div>

        {loading && requests.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading brochure requests...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px 24px' }}>ID</th>
                  <th>User Details</th>
                  <th>Institution / Company</th>
                  <th>Country</th>
                  <th>Conference Name</th>
                  <th>Inquiry / Questions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 24px', color: '#64748b', fontWeight: '500' }}>
                      #BR-{req.id}
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '15px' }}>{req.fullName}</strong>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{req.email}</span>
                      <br />
                      <span style={{ color: '#64748b', fontSize: '13px' }}>{req.phone}</span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '14px' }}>{req.company || 'N/A'}</td>
                    <td style={{ color: '#475569', fontSize: '14px' }}>{req.country || 'N/A'}</td>
                    <td style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                      {getConferenceTitle(req.conferenceId)}
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '13px', color: '#475569', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      {req.query ? req.query : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>None</span>}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No brochure requests found for this conference.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrochureManager;
