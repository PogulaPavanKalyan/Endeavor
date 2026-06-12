import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const { activeConferenceId } = useAdmin();
  const [metrics, setMetrics] = useState({
    registrations: 0, abstracts: 0, contacts: 0, brochures: 0, speakers: 0, sessions: 0
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadMetrics();
  }, [activeConferenceId]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      // In a real implementation, these endpoints should support ?conferenceId= filter
      // If the backend doesn't support conference filtering on all of these yet, we will just fetch all.
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      
      const regList = await api.get(`/api/admin/registrations${qs}`).catch(() => []);
      const absList = await api.get(`/api/admin/abstracts${qs}`).catch(() => []);
      const conList = await api.get(`/api/admin/contacts${qs}`).catch(() => []);
      const broList = await api.get(`/api/admin/brochures${qs}`).catch(() => []);
      const spkList = await api.get(`/api/speakers${qs}`).catch(() => []);
      const sesList = await api.get(`/api/sessions${qs}`).catch(() => []);

      setMetrics({
        registrations: regList?.length || 0,
        abstracts: absList?.length || 0,
        contacts: conList?.length || 0,
        brochures: broList?.length || 0,
        speakers: spkList?.length || 0,
        sessions: sesList?.length || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Dashboard Overview</h2>
      </div>

      {loading ? <p>Loading metrics...</p> : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px'}}>
          <div className="admin-card" style={{cursor: 'pointer'}} onClick={() => navigate('/admin/registrations')}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', textTransform: 'uppercase'}}>Registrations</h3>
            <p style={{margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b'}}>{metrics.registrations}</p>
          </div>
          <div className="admin-card" style={{cursor: 'pointer'}} onClick={() => navigate('/admin/abstracts')}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', textTransform: 'uppercase'}}>Abstracts</h3>
            <p style={{margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b'}}>{metrics.abstracts}</p>
          </div>
          <div className="admin-card" style={{cursor: 'pointer'}} onClick={() => navigate('/admin/speakers')}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', textTransform: 'uppercase'}}>Speakers</h3>
            <p style={{margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b'}}>{metrics.speakers}</p>
          </div>
          <div className="admin-card" style={{cursor: 'pointer'}} onClick={() => navigate('/admin/contacts')}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '15px', color: '#64748b', textTransform: 'uppercase'}}>Inquiries</h3>
            <p style={{margin: 0, fontSize: '32px', fontWeight: '700', color: '#1e293b'}}>{metrics.contacts}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
