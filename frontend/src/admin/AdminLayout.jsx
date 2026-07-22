import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { AdminDialogProvider } from './components/AdminDialogContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const {
    conferences, activeConferenceId, setActiveConferenceId,
    loading, logout, metrics, adminRole, forcePasswordChange, setForcePasswordChange
  } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (forcePasswordChange) {
      setShowPasswordModal(true);
    }
  }, [forcePasswordChange]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

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
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <span>Loading Admin Panel...</span>
      </div>
    );
  }

  const activeConf = conferences.find(c => c.id?.toString() === activeConferenceId);

  return (
    <AdminDialogProvider>
      <div className="admin-layout-container">
      {/* Mobile Overlay */}
      {sidebarOpen && <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 99
      }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="Intelevo Research" className="admin-sidebar-logo" />
          <span>Intelevo Research</span>
          <span className="brand-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Overview</div>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>

          <div className="admin-nav-section-label">Management</div>
          {adminRole === 'SUPER_ADMIN' && (
            <NavLink to="/admin/conferences" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <span className="nav-icon">🏢</span> Conferences
              {conferences.length > 0 && <span className="nav-badge nav-badge-primary">{conferences.length}</span>}
            </NavLink>
          )}
          <NavLink to="/admin/speakers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🎙️</span> Keynote Speakers
          </NavLink>
          <NavLink to="/admin/advisory-board" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🎓</span> Advisory Board
          </NavLink>
          <NavLink to="/admin/committee" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">👥</span> Committee
          </NavLink>
          <NavLink to="/admin/agenda" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📅</span> Conference Agenda
          </NavLink>
          <NavLink to="/admin/sections" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🗂️</span> Dynamic Tabs
          </NavLink>
          <NavLink to="/admin/tracks" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📑</span> Scientific Tracks
          </NavLink>
          <NavLink to="/admin/sessions" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📋</span> Sessions & Program
          </NavLink>
          <NavLink to="/admin/program" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🔬</span> Scientific Program
          </NavLink>
          <NavLink to="/admin/venue" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📍</span> Venue
          </NavLink>
          <NavLink to="/admin/sponsors" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🤝</span> Sponsors
          </NavLink>
          <NavLink to="/admin/navbar" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📖</span> Pages Menu
          </NavLink>
          <NavLink to="/admin/gallery" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🖼️</span> Photo Gallery
          </NavLink>
          <NavLink to="/admin/webinars" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🌐</span> Webinars
          </NavLink>
          <NavLink to="/admin/footer" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🦶</span> Footer Management
          </NavLink>

          <div className="admin-nav-section-label">Submissions</div>
          <NavLink to="/admin/registrations" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🎟️</span> Registrations
            {metrics.registrations > 0 && <span className="nav-badge nav-badge-success">{metrics.registrations}</span>}
          </NavLink>
          <NavLink to="/admin/abstracts" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📄</span> Abstracts
          </NavLink>
          <NavLink to="/admin/contacts" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">✉️</span> Contact Requests
          </NavLink>

          <div className="admin-nav-section-label">System</div>
          {adminRole === 'SUPER_ADMIN' && (
            <>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">🔐</span> Administrators
              </NavLink>
              <NavLink to="/admin/hero" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">🖼️</span> Hero Banners
              </NavLink>
              <NavLink to="/admin/statistics" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">📈</span> Statistics
              </NavLink>
              <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">⚙️</span> Settings
              </NavLink>
              <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
                <span className="nav-icon">📝</span> Activity Logs
              </NavLink>
            </>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={logout} className="btn-admin-logout">
            Logout →
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(s => !s)}>
              ☰
            </button>
            <h1>{activeConf ? (activeConf.tittle || activeConf.title) : 'Conference Management'}</h1>
          </div>

          <div className="admin-topbar-right">
            {adminRole === 'SUPER_ADMIN' && (
              <div className="admin-context-selector">
                <label htmlFor="conf-select">Conference:</label>
                <select
                  id="conf-select"
                  value={activeConferenceId}
                  onChange={(e) => setActiveConferenceId(e.target.value)}
                  className="conference-select-dropdown"
                >
                  <option value="">— All Conferences —</option>
                  {conferences.filter(c => !c.isDeleted).map(conf => (
                    <option key={conf.id} value={conf.id}>
                      {conf.tittle || conf.title || `Conference #${conf.id}`} ({conf.slug})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <div className="admin-user-profile" onClick={() => navigate('/admin/settings')}>
              <div className="admin-avatar">A</div>
              <span>Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-page-container">
          <Outlet />
        </div>
      </main>

      {/* Force Password Change Modal */}
      {showPasswordModal && (
        <div className="admin-modal-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="admin-modal" style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', border: '1px solid var(--border)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Change Your Password</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              For security reasons, you must change your password before continuing.
            </p>
            {passwordError && <div style={{ color: '#e74c3c', marginBottom: '1rem' }}>{passwordError}</div>}
            {passwordSuccess ? (
              <div style={{ color: '#2ecc71', fontWeight: 'bold' }}>Password updated successfully! Redirecting...</div>
            ) : (
              <form onSubmit={handlePasswordChange}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Password</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
    </AdminDialogProvider>
  );
};

export default AdminLayout;
