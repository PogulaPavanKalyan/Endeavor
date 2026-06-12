import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const AbstractManager = () => {
  const { activeConferenceId } = useAdmin();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, [activeConferenceId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/abstracts${qs}`);
      setSubmissions(data || []);
    } catch (err) {
      setError("Failed to load abstract submissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/admin/abstracts/${id}/status?status=${status}`, {});
      setSuccess(`Submission status updated to ${status}!`);
      fetchSubmissions();
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/abstracts/${id}`);
      setSuccess("Submission deleted successfully.");
      fetchSubmissions();
    } catch (err) {
      setError("Failed to delete submission.");
    } finally {
      setLoading(false);
    }
  };

  const getDownloadUrl = (filePath) => {
    if (!filePath) return '';
    const parts = filePath.split(/[\\/]/);
    const fileName = parts[parts.length - 1];
    return `${BASE_URL}/uploads/abstracts/${fileName}`;
  };

  const filteredSubmissions = submissions.filter(s => 
    s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Abstract Submissions</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Review, accept, or reject abstract proposals submitted by presenters.
          </p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <input 
            type="text" 
            placeholder="Search by name, email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '260px', margin: 0}}
          />
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && submissions.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading submissions...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Presenter</th>
                  <th>Affiliation</th>
                  <th>Preferences</th>
                  <th>Status</th>
                  <th>Proposal File</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map(sub => {
                  let badgeColor = '#f1f5f9';
                  let textColor = '#475569';
                  if (sub.status === 'ACCEPTED') { badgeColor = '#dcfce7'; textColor = '#15803d'; }
                  else if (sub.status === 'REJECTED') { badgeColor = '#fee2e2'; textColor = '#b91c1c'; }
                  else if (sub.status === 'UNDER_REVIEW') { badgeColor = '#dbeafe'; textColor = '#1d4ed8'; }
                  else if (sub.status === 'SUBMITTED') { badgeColor = '#fef9c3'; textColor = '#854d0e'; }

                  return (
                    <tr key={sub.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '16px 24px'}}>
                        <strong style={{color: '#0f172a', fontSize: '15px'}}>{sub.fullName}</strong>
                        <br />
                        <span style={{color: '#64748b', fontSize: '12px'}}>{sub.email} | {sub.phone}</span>
                      </td>
                      <td>
                        <span style={{color: '#334155'}}>{sub.designation}</span>
                        <br />
                        <span style={{color: '#64748b', fontSize: '12px'}}>{sub.company}, {sub.country}</span>
                      </td>
                      <td>
                        <strong style={{fontSize: '13px', color: '#475569'}}>{sub.presentationType}</strong>
                        <br />
                        <span style={{color: '#64748b', fontSize: '12px'}}>{sub.sessionName}</span>
                      </td>
                      <td>
                        <span style={{
                          background: badgeColor,
                          color: textColor,
                          padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                        }}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        {sub.filePath ? (
                          <a 
                            href={getDownloadUrl(sub.filePath)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{
                              color: '#3b82f6', 
                              fontWeight: '600', 
                              fontSize: '13px', 
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            📄 Download Proposal
                          </a>
                        ) : (
                          <span style={{color: '#94a3b8', fontStyle: 'italic'}}>No file uploaded</span>
                        )}
                      </td>
                      <td style={{padding: '16px 24px', display: 'flex', gap: '8px', alignItems: 'center'}}>
                        {sub.status !== 'ACCEPTED' && (
                          <button 
                            className="btn-admin btn-admin-sm btn-admin-success" 
                            style={{padding: '6px 12px', fontSize: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'}} 
                            onClick={() => handleUpdateStatus(sub.id, 'ACCEPTED')}
                          >
                            Accept
                          </button>
                        )}
                        {sub.status !== 'REJECTED' && (
                          <button 
                            className="btn-admin btn-admin-sm btn-admin-danger" 
                            style={{padding: '6px 12px', fontSize: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'}} 
                            onClick={() => handleUpdateStatus(sub.id, 'REJECTED')}
                          >
                            Reject
                          </button>
                        )}
                        {sub.status !== 'UNDER_REVIEW' && sub.status === 'SUBMITTED' && (
                          <button 
                            className="btn-admin btn-admin-sm" 
                            style={{padding: '6px 12px', fontSize: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'}} 
                            onClick={() => handleUpdateStatus(sub.id, 'UNDER_REVIEW')}
                          >
                            Review
                          </button>
                        )}
                        <button 
                          style={{padding: '6px 10px', fontSize: '12px', background: '#f1f5f9', color: '#ef4444', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: '600', cursor: 'pointer'}} 
                          onClick={() => handleDelete(sub.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No abstract submissions found.
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

export default AbstractManager;
