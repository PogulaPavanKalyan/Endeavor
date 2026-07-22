import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { AdminDialogProvider } from './components/AdminDialogContext';
import './ConferenceAdminLayout.css';

const ConferenceAdminLayout = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    conferences, activeConferenceId,
    loading, logout, metrics, forcePasswordChange, setForcePasswordChange
  } = useAdmin();
  const navigate = useNavigate();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (forcePasswordChange) {
      setShowPasswordModal(true);
    }
  }, [forcePasswordChange]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    try {
      const { api } = await import('../utils/api');
      await api.post('/api/admin/change-password', { oldPassword, newPassword });
      setPasswordSuccess(true);
      setForcePasswordChange(false);
      localStorage.removeItem('forcePasswordChange');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordError(err.response?.data || 'Failed to change password');
    }
  };

  if (loading && conferences.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="admin-spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #0052cc', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
        <span style={{ marginTop: '1rem', color: '#555', fontWeight: '500' }}>Loading Conference Dashboard...</span>
      </div>
    );
  }

  const activeConf = conferences.find(c => c.id?.toString() === activeConferenceId);

  return (
    <AdminDialogProvider>
      <div className="conference-admin-layout" data-theme="light">
      {/* Top Header */}
      <header className="conference-admin-header">
        <div className="conference-admin-brand">
          <img src="/logo.png" alt="Intelevo Research" style={{ height: '32px' }} />
          <h1>{activeConf ? (activeConf.tittle || activeConf.title) : 'Conference Workspace'}</h1>
          <span className="conference-admin-badge">Admin Workspace</span>
          <button 
            className="conference-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? '✖' : '☰'}
          </button>
        </div>
        <div className="conference-admin-user-nav desktop-only">
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Welcome, Conference Admin</span>
          <button onClick={logout} className="conference-admin-logout">
            Logout
          </button>
        </div>
      </header>

      {/* Horizontal Sub-Navigation */}
      <nav className={`conference-admin-subnav ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink to={`/admin/dashboard${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📊 Dashboard
        </NavLink>
        <NavLink to={`/admin/speakers${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🎙️ Keynote Speakers
        </NavLink>
        <NavLink to={`/admin/agenda${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📅 Conference Agenda
        </NavLink>
        <NavLink to={`/admin/sections${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🗂️ Dynamic Tabs
        </NavLink>
        <NavLink to={`/admin/sessions${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📋 Sessions & Program
        </NavLink>
        <NavLink to={`/admin/registrations${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🎟️ Registrations
          {metrics.registrations > 0 && <span style={{ background: '#2ecc71', color: 'white', padding: '0 6px', borderRadius: '10px', fontSize: '0.75rem', marginLeft: '4px' }}>{metrics.registrations}</span>}
        </NavLink>
        <NavLink to={`/admin/abstracts${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📄 Abstracts
        </NavLink>
        <NavLink to={`/admin/contacts${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          ✉️ Contact Requests
        </NavLink>
        <NavLink to={`/admin/advisory-board${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🎓 Advisory Board
        </NavLink>
        <NavLink to={`/admin/tracks${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📑 Scientific Tracks
        </NavLink>
        <NavLink to={`/admin/committee${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          👥 Committee
        </NavLink>
        <NavLink to={`/admin/venue${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📍 Venue
        </NavLink>
        <NavLink to={`/admin/navbar${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📖 Pages Menu
        </NavLink>
        <NavLink to={`/admin/gallery${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🖼️ Photo Gallery
        </NavLink>
        <NavLink to={`/admin/brochures${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          📁 Brochures
        </NavLink>
        <NavLink to={`/admin/sponsors${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🤝 Sponsors
        </NavLink>
        <NavLink to={`/admin/webinars${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🌐 Webinars
        </NavLink>
        <NavLink to={`/admin/program${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🔬 Scientific Program
        </NavLink>
        <NavLink to={`/admin/footer${window.location.search}`} className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsMobileMenuOpen(false)}>
          🦶 Footer Management
        </NavLink>
        <div className="conference-admin-user-nav mobile-only">
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Welcome, Conference Admin</span>
          <button onClick={logout} className="conference-admin-logout" style={{ width: '100%', justifyContent: 'center' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="conference-admin-main">
        <Outlet />
      </main>

      {/* Force Password Change Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#222', fontSize: '1.5rem', marginBottom: '1rem' }}>Welcome!</h3>
            <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              For your security, please update your password before accessing the conference dashboard.
            </p>
            {passwordError && <div style={{ color: '#e74c3c', marginBottom: '1rem', background: 'rgba(231,76,60,0.1)', padding: '0.75rem', borderRadius: '6px' }}>{passwordError}</div>}
            {passwordSuccess ? (
              <div style={{ color: '#2ecc71', fontWeight: 'bold', textAlign: 'center', padding: '1rem' }}>Password updated successfully! Redirecting...</div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontWeight: '500' }}>Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontWeight: '500' }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' }}
                  />
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.875rem', background: '#0052cc', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                  Update Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </AdminDialogProvider>
  );
};

export default ConferenceAdminLayout;
