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
    defaultPath: '/admin/dashboard',
    items: [
      { path: '/admin/dashboard', label: 'Dashboard Overview', icon: '📊', desc: 'Conference stats, quick actions & overview' }
    ]
  },
  {
    id: 'congress-info',
    label: 'Congress Info',
    icon: '🏢',
    defaultPath: '/admin/about-congress',
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
    defaultPath: '/admin/speakers',
    items: [
      { path: '/admin/speakers', label: 'Keynote & Event Speakers', icon: '🎙️', desc: 'Manage featured speakers, bios, and categories' },
      { path: '/admin/committee', label: 'Organizing Committee', icon: '👥', desc: 'Committee members, affiliations, and roles' }
    ]
  },
  {
    id: 'scientific-program',
    label: 'Scientific Program',
    icon: '🔬',
    defaultPath: '/admin/tracks',
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
    defaultPath: '/admin/registrations',
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
    defaultPath: '/admin/sponsors',
    items: [
      { path: '/admin/sponsors', label: 'Sponsors & Media Partners', icon: '🤝', desc: 'Manage corporate sponsors, exhibitors, and media partners' }
    ]
  },
  {
    id: 'website-cms',
    label: 'Website CMS',
    icon: '🎨',
    defaultPath: '/admin/sections',
    items: [
      { path: '/admin/sections', label: 'Dynamic Content Tabs', icon: '🗂️', desc: 'Custom tab sections and content blocks' },
      { path: '/admin/navbar', label: 'Pages & Navigation Menu', icon: '📖', desc: 'Custom navigation links and sub-pages' },
      { path: '/admin/gallery', label: 'Photo Gallery', icon: '🖼️', desc: 'Event photographs, albums, and highlights' },
      { path: '/admin/footer', label: 'Footer Management', icon: '🦶', desc: 'Footer links, disclaimer, and copyright text' }
    ]
  }
];

const ConferenceAdminLayout = () => {
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
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

  // Close menus on route change
  useEffect(() => {
    setHoveredDropdown(null);
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

  // Determine which group is currently active based on current path
  const activeGroup = navGroups.find(group => 
    group.items.some(item => location.pathname === item.path || location.pathname.startsWith(item.path))
  ) || navGroups[0];

  // Find active sub-item info for header context
  let activeItemInfo = activeGroup.items[0];
  for (const group of navGroups) {
    const found = group.items.find(item => location.pathname === item.path || location.pathname.startsWith(item.path));
    if (found) {
      activeItemInfo = found;
      break;
    }
  }

  // Handle direct click on top primary tab
  const handlePrimaryTabClick = (group) => {
    setHoveredDropdown(null);
    navigate(`${group.defaultPath}${searchStr}`);
  };

  // All flat items for search palette
  const allNavItems = navGroups.flatMap(g => 
    g.items.map(i => ({ ...i, groupLabel: g.label }))
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
              type="button"
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
            <button type="button" onClick={logout} className="conf-logout-btn" title="Sign out of conference workspace">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span className="logout-text">Logout</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button 
              type="button"
              className="conf-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </header>

        {/* Tier 1: Main Category Tab Bar */}
        <nav className="conference-admin-navstrip" ref={navRef}>
          <div className="conf-nav-container">
            {navGroups.map((group) => {
              const isCurrentActive = activeGroup.id === group.id;
              const hasMultiple = group.items.length > 1;
              const isHovered = hoveredDropdown === group.id;

              return (
                <div 
                  key={group.id} 
                  className="conf-nav-dropdown-wrapper"
                  onMouseEnter={() => hasMultiple && setHoveredDropdown(group.id)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <button
                    type="button"
                    className={`conf-nav-item ${isCurrentActive ? 'active' : ''}`}
                    onClick={() => handlePrimaryTabClick(group)}
                  >
                    <span className="conf-nav-icon">{group.icon}</span>
                    <span className="conf-nav-label">{group.label}</span>
                    {hasMultiple && (
                      <svg className={`conf-chevron ${isHovered ? 'rotate' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    )}
                  </button>

                  {/* Fast Hover Dropdown */}
                  {hasMultiple && isHovered && (
                    <div className="conf-dropdown-menu">
                      <div className="conf-dropdown-header">
                        <span className="conf-dropdown-group-icon">{group.icon}</span>
                        <span className="conf-dropdown-group-title">{group.label}</span>
                      </div>
                      <div className="conf-dropdown-items">
                        {group.items.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path);
                          const metricVal = subItem.metricKey ? metrics[subItem.metricKey] : null;

                          return (
                            <NavLink
                              key={subItem.path}
                              to={`${subItem.path}${searchStr}`}
                              className={`conf-dropdown-item ${isSubActive ? 'active' : ''}`}
                              onClick={() => setHoveredDropdown(null)}
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

        {/* Tier 2: Active Sub-Navigation Pills (Directly Clickable Strip) */}
        {activeGroup && activeGroup.items && activeGroup.items.length > 1 && (
          <div className="conf-subnav-strip">
            <div className="conf-subnav-container">
              <span className="conf-subnav-tag">
                {activeGroup.icon} {activeGroup.label}:
              </span>
              <div className="conf-subnav-pills">
                {activeGroup.items.map((subItem) => {
                  const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path);
                  const metricVal = subItem.metricKey ? metrics[subItem.metricKey] : null;

                  return (
                    <NavLink
                      key={subItem.path}
                      to={`${subItem.path}${searchStr}`}
                      className={`conf-subnav-pill ${isSubActive ? 'active' : ''}`}
                    >
                      <span className="conf-subnav-pill-icon">{subItem.icon}</span>
                      <span className="conf-subnav-pill-label">{subItem.label}</span>
                      {metricVal > 0 && (
                        <span className="conf-subnav-pill-badge">{metricVal}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Elegant Context & Breadcrumb Bar */}
        <div className="conf-context-bar">
          <div className="conf-context-container">
            <div className="conf-breadcrumb">
              <span className="conf-bc-root" onClick={() => navigate(`/admin/dashboard${searchStr}`)}>Workspace</span>
              <span className="conf-bc-sep">/</span>
              <span className="conf-bc-group" onClick={() => handlePrimaryTabClick(activeGroup)}>{activeGroup.label}</span>
              <span className="conf-bc-sep">/</span>
              <span className="conf-bc-current">
                <span className="conf-bc-icon">{activeItemInfo.icon}</span>
                {activeItemInfo.label}
              </span>
            </div>

            <div className="conf-context-hint">
              <span className="conf-status-indicator"></span>
              <span>Live synchronized with website</span>
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
                <button type="button" className="conf-mobile-close" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
              </div>

              <div className="conf-mobile-drawer-content">
                {navGroups.map((group) => {
                  const hasMultiple = group.items.length > 1;
                  const isExpanded = expandedMobileGroup === group.id || activeGroup.id === group.id;

                  if (!hasMultiple) {
                    const single = group.items[0];
                    const isActive = location.pathname === single.path || location.pathname.startsWith(single.path);
                    return (
                      <NavLink
                        key={group.id}
                        to={`${single.path}${searchStr}`}
                        className={`conf-mobile-item ${isActive ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="conf-mobile-icon">{single.icon}</span>
                        <span className="conf-mobile-label">{group.label}</span>
                      </NavLink>
                    );
                  }

                  const isCurrentActive = activeGroup.id === group.id;

                  return (
                    <div key={group.id} className="conf-mobile-accordion">
                      <div className={`conf-mobile-accordion-header ${isCurrentActive ? 'has-active' : ''}`}>
                        <div 
                          className="conf-mobile-accordion-left"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handlePrimaryTabClick(group);
                          }}
                        >
                          <span className="conf-mobile-icon">{group.icon}</span>
                          <span className="conf-mobile-label">{group.label}</span>
                        </div>
                        <button
                          type="button"
                          className="conf-mobile-chevron-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedMobileGroup(isExpanded ? null : group.id);
                          }}
                        >
                          <svg className={`conf-chevron ${isExpanded ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="conf-mobile-accordion-body">
                          {group.items.map((subItem) => {
                            const isSubActive = location.pathname === subItem.path || location.pathname.startsWith(subItem.path);
                            return (
                              <NavLink
                                key={subItem.path}
                                to={`${subItem.path}${searchStr}`}
                                className={`conf-mobile-subitem ${isSubActive ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span className="conf-mobile-subicon">{subItem.icon}</span>
                                <span className="conf-mobile-sublabel">{subItem.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="conf-mobile-drawer-footer">
                <button type="button" onClick={logout} className="conf-mobile-logout-btn">
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
                <button type="button" className="conf-palette-close" onClick={() => setShowSearchModal(false)}>ESC</button>
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
