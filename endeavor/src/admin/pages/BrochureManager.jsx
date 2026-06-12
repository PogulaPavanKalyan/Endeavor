import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const BrochureManager = () => {
  const { activeConferenceId, conferences } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, [activeConferenceId]);

  const fetchRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/brochures${qs}`);
      setRequests(data || []);
    } catch (err) {
      setError("Failed to fetch brochure requests.");
    } finally {
      setLoading(false);
    }
  };

  const getConferenceTitle = (confId) => {
    const conf = conferences.find(c => c.id.toString() === confId?.toString());
    return conf ? conf.tittle : `Conf #${confId}`;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Brochure Downloads Database</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Monitor and export details of users who requested and downloaded conference brochures.
          </p>
        </div>
      </div>

      {error && (
        <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>
          {error}
        </div>
      )}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading brochure requests...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>ID</th>
                  <th>User Details</th>
                  <th>Institution / Company</th>
                  <th>Country</th>
                  <th>Conference Name</th>
                  <th>Inquiry / Questions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px', color: '#64748b', fontWeight: '500'}}>#BR-{req.id}</td>
                    <td>
                      <strong style={{color: '#0f172a', fontSize: '15px'}}>{req.fullName}</strong>
                      <br />
                      <span style={{color: '#64748b', fontSize: '13px'}}>{req.email}</span>
                      <br />
                      <span style={{color: '#64748b', fontSize: '13px'}}>{req.phone}</span>
                    </td>
                    <td style={{color: '#475569', fontSize: '14px'}}>{req.company || 'N/A'}</td>
                    <td style={{color: '#475569', fontSize: '14px'}}>{req.country || 'N/A'}</td>
                    <td style={{fontSize: '14px', fontWeight: '500', color: '#0f172a'}}>
                      {getConferenceTitle(req.conferenceId)}
                    </td>
                    <td style={{maxWidth: '300px', fontSize: '13px', color: '#475569', whiteSpace: 'normal', wordBreak: 'break-word'}}>
                      {req.query ? req.query : <span style={{color: '#94a3b8', fontStyle: 'italic'}}>None</span>}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
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
