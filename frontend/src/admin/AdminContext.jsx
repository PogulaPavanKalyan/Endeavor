import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [conferences, setConferences] = useState([]);
  const [activeConferenceId, setActiveConferenceId] = useState(() =>
    localStorage.getItem('activeConferenceId') || ''
  );
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    registrations: 0, abstracts: 0, contacts: 0,
    brochures: 0, speakers: 0, sessions: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchConferences();
    }
  }, [navigate]);

  // Persist active conference
  useEffect(() => {
    if (activeConferenceId) {
      localStorage.setItem('activeConferenceId', activeConferenceId);
    } else {
      localStorage.removeItem('activeConferenceId');
    }
  }, [activeConferenceId]);

  // Reload metrics when conference changes
  useEffect(() => {
    if (!loading) loadMetrics();
  }, [activeConferenceId, loading]);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/conferences?includeDeleted=true');
      setConferences(data || []);
      const activeList = (data || []).filter(c => !c.isDeleted);
      if (activeList.length > 0 && !activeConferenceId) {
        setActiveConferenceId(activeList[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to fetch conferences:', err);
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = useCallback(async () => {
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const [regList, absList, conList, broList, spkList, sesList] = await Promise.all([
        api.get(`/api/admin/registrations${qs}`).catch(() => []),
        api.get(`/api/admin/abstracts${qs}`).catch(() => []),
        api.get(`/api/admin/contacts${qs}`).catch(() => []),
        api.get(`/api/admin/brochures${qs}`).catch(() => []),
        api.get(`/api/speakers${qs}`).catch(() => []),
        api.get(`/api/sessions${qs}`).catch(() => []),
      ]);
      setMetrics({
        registrations: regList?.length || 0,
        abstracts: absList?.length || 0,
        contacts: conList?.length || 0,
        brochures: broList?.length || 0,
        speakers: spkList?.length || 0,
        sessions: sesList?.length || 0,
      });
    } catch (err) {
      console.error('Metrics load error:', err);
    }
  }, [activeConferenceId]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeConferenceId');
    navigate('/admin/login');
  };

  const getActiveConference = () => {
    return conferences.find(c => c.id?.toString() === activeConferenceId) || null;
  };

  return (
    <AdminContext.Provider value={{
      conferences,
      activeConferenceId,
      setActiveConferenceId,
      fetchConferences,
      loading,
      metrics,
      loadMetrics,
      logout,
      getActiveConference
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
