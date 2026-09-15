import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { AdminDialogProvider } from './components/AdminDialogContext';
import './ConferenceAdminLayout.css';

const navGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/admin/dashboard',
    isDirect: true
  },
  {
    id: 'congress-info',
    label: 'Congress Info',
    icon: '🏢',
    items: [
      { path: '/admin/about-congress', label: 'About Congress & Theme', icon: '📝', desc: 'Title, summary, theme colors, and about content' },
      { path: '/admin/important-dates', label: 'Important Dates', icon: '📅', desc: 'Deadlines, milestones, and notification dates' },
      { path: '/admin/venue', label: 'Venue & Hotel', icon: '📍', desc: 'Location details, address, map, and accommodations' },
      { path: '/admin/brochures', label: 'Brochure Upload', icon: '📁', desc: 'Official conference PDF brochure & download logs' }
    ]
  },
  {
    id: 'speakers-committee',
    label: 'Speakers & Committee',
    icon: '🎙️',
    items: [
      { path: '/admin/speakers', label: 'Keynote & Event Speakers', icon: '🎙️', desc: 'Manage featured speakers, bios, and categories' },
      { path: '/admin/committee', label: 'Organizing Committee', icon: '👥', desc: 'Committee members, affiliations, and roles' }
    ]
  },
  {
    id: 'scientific-program',
    label: 'Scientific Program',
    icon: '🔬',
    items: [
      { path: '/admin/tracks', label: 'Scientific Tracks', icon: '📑', desc: 'Research tracks, subject areas, and categories' },
      { path: '/admin/sessions', label: 'Sessions & Topics', icon: '📋', desc: 'Congress sessions, session chairs, and topics' },
      { path: '/admin/program', label: 'Scientific Schedule', icon: '🔬', desc: 'Day-by-day scheduled presentation program' },
      { path: '/admin/agenda', label: 'Conference Timetable', icon: '📅', desc: 'Time-slot breakdown and event agenda' }
    ]
  },
  {
    id: 'registrations-abstracts',
    label: 'Registrations & Papers',
    icon: '🎟️',
    items: [
      { path: '/admin/registrations', label: 'Registrations & Pricing', icon: '🎟️', desc: 'Pricing packages, ticket tiers & registered attendees', metricKey: 'registrations' },
      { path: '/admin/abstracts', label: 'Abstract Submissions', icon: '📄', desc: 'Submitted papers, reviews, and approval status' },
      { path: '/admin/contacts', label: 'Contact Requests', icon: '✉️', desc: 'Inquiries and messages from website visitors' }
    ]
  },
  {
    id: 'sponsors',
    label: 'Sponsors & Media',
    icon: '🤝',
    path: '/admin/sponsors',
    isDirect: true
  },
  {
    id: 'website-cms',
    label: 'Website CMS',
    icon: '🎨',
    items: [
      { path: '/admin/sections', label: 'Dynamic Content Tabs', icon: '🗂️', desc: 'Custom tab sections and content blocks' },
      { path: '/admin/navbar', label: 'Pages & Navigation Menu', icon: '📖', desc: 'Custom navigation links and sub-pages' },
      { path: '/admin/gallery', label: 'Photo Gallery', icon: '🖼️', desc: 'Event photographs, albums, and highlights' },
      { path: '/admin/footer', label: 'Footer Management', icon: '🦶', desc: 'Footer links, disclaimer, and copyright text' }
    ]
  }
];

const ConferenceAdminLayout = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMobileGroup, setExpandedMobileGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const {
    conferences, activeConferenceId,
    loading, logout, metrics, forcePasswordChange, setForcePasswordChange
  } = useAdmin();
  
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
      <div className="conf-admin-loading-screen">
        <div className="conf-admin-spinner"></div>
        <span>Loading Conference Workspace...</span>
      </div>
    );
  }

  const activeConf = conferences.find(c => c.id?.toString() === activeConferenceId);
  const searchStr = location.search || '';

  // Helper to determine if a group contains the active route
  const isGroupActive = (group) => {
    if (group.isDirect) {
      return location.pathname.startsWith(group.path);
    }
    return group.items.some(item => location.pathname.startsWith(item.path));
  };

  // Find current active item for breadcrumb
  let activePageInfo = { title: 'Dashboard', icon: '📊', groupLabel: 'Overview' };
  for (const group of navGroups) {
    if (group.isDirect && location.pathname.startsWith(group.path)) {
      activePageInfo = { title: group.label, icon: group.icon, groupLabel: 'Main' };
      break;
    }
    if (group.items) {
      const found = group.items.find(item => location.pathname.startsWith(item.path));
      if (found) {
        activePageInfo = { title: found.label, icon: found.icon, groupLabel: group.label };
        break;
      }
    }
  }

  // All flat items for search palette
  const allNavItems = navGroups.flatMap(g => 
    g.isDirect ? [{ ...g, groupLabel: 'Direct' }] : g.items.map(i => ({ ...i, groupLabel: g.label }))
  );

  const filteredItems = searchQuery.trim() 
    ? allNavItems.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase()) || (i.desc && i.desc.toLowerCase().includes(searchQuery.toLowerCase())))
    : allNavItems;

  return (
    <AdminDialogProvider>
      <div className="conference-admin-layout" data-theme="light">
        {/* Top Header Bar */}
        <header className="conference-admin-topbar">
          <div className="conf-topbar-left">
            <div className="conf-brand-group" onClick={() => navigate(`/admin/dashboard${searchStr}`)}>
              <img src="/logo.png" alt="Endeavor" className="conf-brand-logo" onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="conf-brand-text">
                <span className="conf-brand-org">ENDEAVOR CONFERENCES</span>
                <h1 className="conf-brand-title" title={activeConf ? (activeConf.tittle || activeConf.title) : 'Conference Workspace'}>
                  {activeConf ? (activeConf.tittle || activeConf.title) : 'Conference Workspace'}
                </h1>
              </div>
            </div>
            
            <div className="conf-badges-row">
              <span className="conf-workspace-pill">
                <span className="conf-pulse-dot"></span>
                ADMIN WORKSPACE
              </span>
              {activeConf?.year && (
                <span className="conf-year-pill">{activeConf.year}</span>
              )}
            </div>
          </div>

          <div className="conf-topbar-right">
            {/* Quick Search Palette Trigger */}
            <button 
              className="conf-search-trigger"
              onClick={() => setShowSearchModal(true)}
              title="Quick jump to section (Ctrl+K)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span className="conf-search-placeholder">Quick Jump...</span>
              <kbd className="conf-search-kbd">⌘K</kbd>
            </button>

            {/* Live Website Preview Button */}
            <a 
              href={activeConf?.subdomain ? `http://${activeConf.subdomain}.intelevoresearch.org` : `/`}
              target="_blank" 
              rel="noopener noreferrer" 
              className="conf-live-btn"
              title="Open public conference website in new tab"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Live Website</span>
            </a>

            {/* Admin User Info */}
            <div className="conf-user-profile">
              <div className="conf-user-avatar">
                <span>CA</span>
              </div>
              <div className="conf-user-meta">
                <span className="conf-user-name">Conference Admin</span>
                <span className="conf-user-role">Full Access</span>
              </div>
            </div>

            {/* Logout Button */}
            <button onClick={logout} className="conf-logout-btn" title="Sign out of conference workspace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="logout-text">Logout</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="conf-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Organized Navigation Bar */}
        <nav className="conference-admin-navstrip" ref={navRef}>
          <div className="conf-nav-container">
            {navGroups.map((group) => {
              if (group.isDirect) {
                return (
                  <NavLink
                    key={group.id}
                    to={`${group.path}${searchStr}`}
                    className={({ isActive }) => `conf-nav-item conf-nav-direct ${isActive ? 'active' : ''}`}
                    onClick={() => setOpenDropdown(null)}
                  >
                    <span className="conf-nav-icon">{group.icon}</span>
                    <span className="conf-nav-label">{group.label}</span>
                  </NavLink>
                );
              }

              const isCurrentGroupActive = isGroupActive(group);
              const isOpen = openDropdown === group.id;

              return (
                <div key={group.id} className={`conf-nav-dropdown-wrapper ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className={`conf-nav-item conf-nav-dropdown-btn ${isCurrentGroupActive ? 'active' : ''} ${isOpen ? 'dropdown-active' : ''}`}
                    onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                    onMouseEnter={() => setOpenDropdown(group.id)}
                  >
                    <span className="conf-nav-icon">{group.icon}</span>
                    <span className="conf-nav-label">{group.label}</span>
                    <svg className={`conf-chevron ${isOpen ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  {/* Dropdown Flyout Menu */}
                  {isOpen && (
                    <div 
                      className="conf-dropdown-menu"
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <div className="conf-dropdown-header">
                        <span className="conf-dropdown-group-icon">{group.icon}</span>
                        <span className="conf-dropdown-group-title">{group.label}</span>
                      </div>
                      <div className="conf-dropdown-items">
                        {group.items.map((subItem) => {
                          const isSubActive = location.pathname.startsWith(subItem.path);
                          const metricVal = subItem.metricKey ? metrics[subItem.metricKey] : null;

                          return (
                            <NavLink
                              key={subItem.path}
                              to={`${subItem.path}${searchStr}`}
                              className={`conf-dropdown-item ${isSubActive ? 'active' : ''}`}
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="conf-subitem-icon">{subItem.icon}</div>
                              <div className="conf-subitem-content">
                                <div className="conf-subitem-title-row">
                                  <span className="conf-subitem-title">{subItem.label}</span>
                                  {metricVal > 0 && (
                                    <span className="conf-subitem-badge">{metricVal}</span>
                                  )}
                                </div>
                                {subItem.desc && (
                                  <span className="conf-subitem-desc">{subItem.desc}</span>
                                )}
                              </div>
                              <svg className="conf-subitem-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6"></polyline>
                              </svg>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Elegant Context & Breadcrumb Bar */}
        <div className="conf-context-bar">
          <div className="conf-context-container">
            <div className="conf-breadcrumb">
              <span className="conf-bc-root" onClick={() => navigate(`/admin/dashboard${searchStr}`)}>Workspace</span>
              <span className="conf-bc-sep">/</span>
              <span className="conf-bc-group">{activePageInfo.groupLabel}</span>
              <span className="conf-bc-sep">/</span>
              <span className="conf-bc-current">
                <span className="conf-bc-icon">{activePageInfo.icon}</span>
                {activePageInfo.title}
              </span>
            </div>

            <div className="conf-context-hint">
              <span className="conf-status-indicator"></span>
              <span>All changes automatically sync to live website</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="conf-mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="conf-mobile-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="conf-mobile-drawer-header">
                <div className="conf-mobile-drawer-title">
                  <span className="conf-mobile-logo-icon">🏛️</span>
                  <span>Navigation Menu</span>
                </div>
                <button className="conf-mobile-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
              </div>

              <div className="conf-mobile-drawer-content">
                {navGroups.map((group) => {
                  if (group.isDirect) {
                    return (
                      <NavLink
                        key={group.id}
                        to={`${group.path}${searchStr}`}
                        className={({ isActive }) => `conf-mobile-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="conf-mobile-icon">{group.icon}</span>
                        <span className="conf-mobile-label">{group.label}</span>
                      </NavLink>
                    );
                  }

                  const isExpanded = expandedMobileGroup === group.id;
                  const isCurrentActive = isGroupActive(group);

                  return (
                    <div key={group.id} className="conf-mobile-accordion">
                      <button
                        className={`conf-mobile-accordion-header ${isCurrentActive ? 'has-active' : ''}`}
                        onClick={() => setExpandedMobileGroup(isExpanded ? null : group.id)}
                      >
                        <div className="conf-mobile-accordion-left">
                          <span className="conf-mobile-icon">{group.icon}</span>
                          <span className="conf-mobile-label">{group.label}</span>
                        </div>
                        <svg className={`conf-chevron ${isExpanded ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="conf-mobile-accordion-body">
                          {group.items.map((subItem) => (
                            <NavLink
                              key={subItem.path}
                              to={`${subItem.path}${searchStr}`}
                              className={({ isActive }) => `conf-mobile-subitem ${isActive ? 'active' : ''}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <span className="conf-mobile-subicon">{subItem.icon}</span>
                              <span className="conf-mobile-sublabel">{subItem.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="conf-mobile-drawer-footer">
                <button onClick={logout} className="conf-mobile-logout-btn">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Jump Search Palette Modal */}
        {showSearchModal && (
          <div className="conf-modal-backdrop" onClick={() => setShowSearchModal(false)}>
            <div className="conf-search-palette" onClick={(e) => e.stopPropagation()}>
              <div className="conf-palette-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  placeholder="Search managers, tools, settings... (e.g. Speakers, Dates, Sponsors)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="conf-palette-input"
                />
                <button className="conf-palette-close" onClick={() => setShowSearchModal(false)}>ESC</button>
              </div>

              <div className="conf-palette-results">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.path || idx}
                    className="conf-palette-item"
                    onClick={() => {
                      setShowSearchModal(false);
                      setSearchQuery('');
                      navigate(`${item.path}${searchStr}`);
                    }}
                  >
                    <div className="conf-palette-icon">{item.icon}</div>
                    <div className="conf-palette-info">
                      <div className="conf-palette-title">{item.label}</div>
                      {item.desc && <div className="conf-palette-desc">{item.desc}</div>}
                    </div>
                    <span className="conf-palette-badge">{item.groupLabel}</span>
                  </div>
                ))}
                {filteredItems.length === 0 && (
                  <div className="conf-palette-empty">No matching management sections found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="conference-admin-main">
          <Outlet />
        </main>

        {/* Force Password Change Modal */}
        {showPasswordModal && (
          <div className="conf-modal-backdrop">
            <div className="conf-password-modal">
              <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.4rem', marginBottom: '0.75rem', fontWeight: '800' }}>Welcome!</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                For your security, please update your password before accessing the conference workspace.
              </p>
              {passwordError && <div className="conf-alert-error">{passwordError}</div>}
              {passwordSuccess ? (
                <div className="conf-alert-success">Password updated successfully! Redirecting...</div>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: '600', fontSize: '0.88rem' }}>Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={e => setOldPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#334155', fontWeight: '600', fontSize: '0.88rem' }}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                    />
                  </div>
                  <button type="submit" className="conf-submit-btn">
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
