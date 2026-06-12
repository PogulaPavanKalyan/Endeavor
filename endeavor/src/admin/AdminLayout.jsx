import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import './AdminLayout.css';

const AdminLayout = () => {
  const {
    conferences, activeConferenceId, setActiveConferenceId,
    loading, logout, metrics
  } = useAdmin();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('admin-theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

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
    <div className="admin-layout-container">
      {/* Mobile Overlay */}
      {sidebarOpen && <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 99
      }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="Endeavor" className="admin-sidebar-logo" />
          <span>Endeavor</span>
          <span className="brand-badge">Admin</span>
        </div>

        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">Overview</div>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📊</span> Dashboard
          </NavLink>

          <div className="admin-nav-section-label">Management</div>
          <NavLink to="/admin/conferences" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🏢</span> Conferences
            {conferences.length > 0 && <span className="nav-badge nav-badge-primary">{conferences.length}</span>}
          </NavLink>
          <NavLink to="/admin/speakers" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🎙️</span> Speakers
          </NavLink>
          <NavLink to="/admin/committee" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">👥</span> Committee
          </NavLink>
          <NavLink to="/admin/tracks" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📑</span> Scientific Tracks
          </NavLink>
          <NavLink to="/admin/sessions" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📋</span> Sessions & Program
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
          <NavLink to="/admin/hero" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">🖼️</span> Hero Banners
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">⚙️</span> Settings
          </NavLink>
          <NavLink to="/admin/logs" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
            <span className="nav-icon">📝</span> Activity Logs
          </NavLink>
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
                    {conf.tittle || conf.title || `Conference #${conf.id}`}
                  </option>
                ))}
              </select>
            </div>

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
    </div>
  );
};

export default AdminLayout;
