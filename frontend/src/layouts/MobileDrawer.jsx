import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "./MobileDrawer.css";

/* ─── SVG Icons ─────────────────────────────────────────────── */
const IconHome = () => (
  <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const IconAbout = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></svg>
);
const IconConferences = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
);
const IconWebinars = () => (
  <svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
);
const IconProceedings = () => (
  <svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);
const IconContact = () => (
  <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
);

/* ─── Nav Config ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "home",        path: "/",            icon: <IconHome />,        title: "Home",        desc: "Latest updates and announcements" },
  { id: "about",       path: "/about",       icon: <IconAbout />,       title: "About Us",    desc: "Know our vision and mission" },
  {
    id: "conferences", path: "/conferences", icon: <IconConferences />, title: "Conferences", desc: "Browse upcoming conferences",
    children: [
      { label: "Upcoming Conferences", path: "/conferences" },
      { label: "Past Conferences",     path: "/conferences" },
      { label: "Call for Papers",      path: "/submit-abstract" },
      { label: "Registration",         path: "/register" },
      { label: "Speakers",             path: "/conferences" },
      { label: "Committee",            path: "/conferences" },
      { label: "Venue",                path: "/conferences" },
    ]
  },
  { id: "webinars",    path: "/webinars",    icon: <IconWebinars />,    title: "Webinars",    desc: "Join live research sessions" },
  { id: "proceedings", path: "/proceedings", icon: <IconProceedings />, title: "Proceedings", desc: "Published conference proceedings" },
  { id: "contact",     path: "/contact",     icon: <IconContact />,     title: "Contact",     desc: "Reach our support team" },
];

/* ─── Social SVGs ─────────────────────────────────────────────── */
const SvgFacebook = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const SvgLinkedIn = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>;
const SvgX = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const SvgYouTube = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" style={{fill:'var(--nav-accent)'}}/></svg>;
const SvgEmail = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6" style={{fill:'none', stroke:'currentColor', strokeWidth:'1.8'}}/></svg>;

/* ─── AccordionItem (smooth height) ─────────────────────────── */
const AccordionItem = ({ isOpen, children }) => {
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    if (isOpen) {
      setHeight(ref.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="drawer-submenu-wrapper" style={{ height }}>
      <div ref={ref} className="drawer-submenu">
        {children}
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */
const MobileDrawer = ({ open, onClose, isActive, onSubscribeOpen }) => {
  const [confOpen, setConfOpen] = useState(false);
  const drawerRef = useRef(null);

  /* ESC key closes */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  /* Lock body scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /* Close conf submenu when drawer closes */
  useEffect(() => { if (!open) setConfOpen(false); }, [open]);

  const handleNavClick = useCallback(() => {
    onClose();
    setConfOpen(false);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`mobile-drawer-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <nav
        ref={drawerRef}
        className={`mobile-drawer${open ? " open" : ""}`}
        aria-label="Mobile Navigation"
        aria-hidden={!open}
        role="dialog"
      >
        {/* ── Premium Header ── */}
        <div className="drawer-header-premium">
          <div className="drawer-header-top">
            <Link to="/" onClick={handleNavClick} tabIndex={open ? 0 : -1}>
              <img src="/logo.png" alt="Intelevo Research" className="drawer-logo-premium" />
            </Link>
            <button
              className="drawer-close-btn-premium"
              onClick={onClose}
              aria-label="Close navigation menu"
              tabIndex={open ? 0 : -1}
            >
              ✕
            </button>
          </div>
          <div className="drawer-brand-details">
             <h2 className="drawer-conf-name">Intelevo Research</h2>
             <p className="drawer-conf-theme">Advancing Research Through Global Conferences</p>
             <div className="drawer-conf-meta">
               <span className="drawer-conf-year">2027</span>
               <span className="drawer-conf-dot">•</span>
               <span className="drawer-conf-location">Hyderabad, India</span>
             </div>
             <div className="drawer-conf-badge">Upcoming</div>
          </div>
        </div>

        {/* ── Nav Body ── */}
        <div className="drawer-nav-body">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children;
            const active = isActive ? isActive(item.path) === "active" : false;

            if (hasChildren) {
              return (
                <React.Fragment key={item.id}>
                  <div
                    className={`drawer-nav-item${active ? " active" : ""}`}
                    onClick={() => setConfOpen(v => !v)}
                    tabIndex={open ? 0 : -1}
                    role="button"
                    aria-expanded={confOpen}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setConfOpen(v => !v); }}
                  >
                    <div className="drawer-nav-icon-wrap">
                      <span className="drawer-nav-icon">{item.icon}</span>
                    </div>
                    <div className="drawer-nav-text">
                      <span className="drawer-nav-title">{item.title}</span>
                      <span className="drawer-nav-desc">{item.desc}</span>
                    </div>
                    <span className={`drawer-chevron${confOpen ? " rotated" : ""}`}>
                      <IconChevron />
                    </span>
                  </div>
                  <AccordionItem isOpen={confOpen}>
                    {item.children.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className="drawer-submenu-item"
                        onClick={handleNavClick}
                        tabIndex={open && confOpen ? 0 : -1}
                      >
                        <span className="drawer-submenu-dot" />
                        <span className="drawer-submenu-label">{sub.label}</span>
                      </Link>
                    ))}
                  </AccordionItem>
                </React.Fragment>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`drawer-nav-item${active ? " active" : ""}`}
                onClick={handleNavClick}
                tabIndex={open ? 0 : -1}
              >
                <div className="drawer-nav-icon-wrap">
                  <span className="drawer-nav-icon">{item.icon}</span>
                </div>
                <div className="drawer-nav-text">
                  <span className="drawer-nav-title">{item.title}</span>
                  <span className="drawer-nav-desc">{item.desc}</span>
                </div>
              </Link>
            );
          })}
          
          <div className="drawer-divider" />
        </div>

        {/* ── Premium Footer ── */}
        <div className="drawer-footer">
          <div className="drawer-footer-btns">
            <Link
              to="/submit-abstract"
              className="drawer-btn-premium-primary"
              onClick={handleNavClick}
              tabIndex={open ? 0 : -1}
            >
              📄 Submit Your Paper
            </Link>
            <Link
              to="/register"
              className="drawer-btn-premium-glass"
              onClick={handleNavClick}
              tabIndex={open ? 0 : -1}
            >
              🎟️ Register Conference
            </Link>
          </div>

          {/* Social Icons */}
          <div className="drawer-social-row">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="drawer-social-btn-premium" aria-label="Facebook" tabIndex={open ? 0 : -1}>
              <SvgFacebook />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="drawer-social-btn-premium" aria-label="LinkedIn" tabIndex={open ? 0 : -1}>
              <SvgLinkedIn />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="drawer-social-btn-premium" aria-label="X (Twitter)" tabIndex={open ? 0 : -1}>
              <SvgX />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="drawer-social-btn-premium" aria-label="YouTube" tabIndex={open ? 0 : -1}>
              <SvgYouTube />
            </a>
            <a href="mailto:info@intelevoresearch.org" className="drawer-social-btn-premium" aria-label="Email" tabIndex={open ? 0 : -1}>
              <SvgEmail />
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileDrawer;
