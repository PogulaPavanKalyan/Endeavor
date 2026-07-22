import React, { useState, useEffect } from "react";
import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import { getSubdomain } from "../utils/subdomain.jsx";
import NotFoundPage from "../components/NotFoundPage";
import "./ConferenceLayout.css";

const ConferenceLayout = () => {
  const { id: routeId } = useParams();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // 1. Detect active subdomain
  const subdomain = getSubdomain();
  const isSubdomainActive = !!subdomain;

  // Resolve the conference ID. Prioritize subdomain, fall back to route parameter.
  const activeConfId = subdomain || routeId || "generic";

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.classList.add("conf-portal-body-active");
    return () => {
      document.body.classList.remove("conf-portal-body-active");
    };
  }, []);

  const [activeConf, setActiveConf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [navPages, setNavPages] = useState([]);
  const [submenuItems, setSubmenuItems] = useState([]);
  const [speakerCategories, setSpeakerCategories] = useState([]);
  const [programCategories, setProgramCategories] = useState([]);

  const [subName, setSubName] = useState("");
  const [subEmail, setSubEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!subEmail || !subName) return;
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      setSubscribed(true);
      setSubName("");
      setSubEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }, 1200);
  };

  const [footerSettings, setFooterSettings] = useState(null);

  useEffect(() => {
    if (activeConf && activeConf.id) {
      const fetchFooterSettings = async () => {
        try {
          const res = await api.get(`/api/footer?conferenceId=${activeConf.id}`);
          if (res) {
            setFooterSettings(res);
          }
        } catch (err) {
          console.error("Failed to load footer settings:", err);
        }
      };

      const fetchNavPages = async () => {
        try {
          const res = await api.get(`/api/navigation?conferenceId=${activeConf.id}`);
          if (Array.isArray(res)) {
            const mappedPages = res.map(nav => ({
              id: nav.id,
              pageKey: nav.slug,
              label: nav.menuName,
              route: nav.url,
              isEnabled: nav.status !== false,
              displayOrder: nav.displayOrder || 0
            }));
            setNavPages(mappedPages);
          }
        } catch (err) {
          console.error("Failed to load nav pages:", err);
        }
      };

      const fetchSubmenuItems = async () => {
        try {
          const res = await api.get(`/api/navbar-menus?conferenceId=${activeConf.id}`);
          if (Array.isArray(res)) {
            setSubmenuItems(res);
          }
        } catch (err) {
          console.error("Failed to load submenus:", err);
        }
      };

      const fetchSpeakerCategories = async () => {
        try {
          const res = await api.get(`/api/speaker-categories?conferenceId=${activeConf.id}`);
          if (Array.isArray(res)) {
            setSpeakerCategories(res);
          }
        } catch (err) {
          console.error("Failed to load speaker categories:", err);
        }
      };

      const fetchProgramCategories = async () => {
        try {
          const res = await api.get(`/api/program-categories?conferenceId=${activeConf.id}`);
          if (Array.isArray(res)) {
            setProgramCategories(res);
          }
        } catch (err) {
          console.error("Failed to load program categories:", err);
        }
      };

      fetchFooterSettings();
      fetchNavPages();
      fetchSubmenuItems();
      fetchSpeakerCategories();
      fetchProgramCategories();
    }
  }, [activeConf?.id]);

  useEffect(() => {
    const fetchConferenceData = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = '/api/conference-details';
        if (activeConfId && activeConfId !== 'generic') {
          if (!isNaN(activeConfId)) {
            url += `?id=${activeConfId}`;
          } else {
            url += `?slug=${activeConfId}`;
          }
        }
        const data = await api.get(url);
        if (data && (data.tittle || data.title)) {
          setActiveConf({
            id: data.id,
            slug: data.slug,
            title: data.title || data.tittle,
            brochureFileName: data.brochureFileName,
            date: `${data.startDate} to ${data.endDate}`,
            countdownTarget: data.countdownEndDate || `${data.startDate}T09:00:00`,
            venue: data.venue,
            email: data.contactEmail || "hello@intelevoresearch.org",
            phone: data.contactPhone || "+1 (209) 299-5348",
            image: data.photo?.fileName
              ? `/uploads/conference/${data.photo.fileName}`
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            images: data.photos && data.photos.length > 0
              ? [...data.photos]
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map(p => `/uploads/conference/${p.fileName}`)
              : [data.photo?.fileName
                ? `/uploads/conference/${data.photo.fileName}`
                : "https://images.unsplash.com/photo-1540575467063-178a50c2df87"],
            theme: {
              primary: data.themePrimary || "#e74c3c",
              primaryHover: data.themePrimaryHover || "#c0392b",
              accent: data.themeAccent || "#f39c12"
            },
            about: data.description || "Welcome to our premium international congress event. Meet and network with leaders in this discipline.",
            aboutImage: data.aboutImage,
            scientificSessions: data.scientificSessions || [],
            pricingTiers: data.pricingTiers || [],
            importantDates: data.importantDates || [],
            startDate: data.startDate,
            endDate: data.endDate,
            showCommittee: data.showCommittee,
            sessions: data.scientificSessions && data.scientificSessions.length > 0
              ? data.scientificSessions.map(session => ({ title: session, desc: "Join us for an exciting deep-dive into " + session }))
              : [
                { title: "Session Track 1", desc: "Keynote speaking and panel presentations by senior researchers." },
                { title: "Session Track 2", desc: "Oral presentations and paper abstract reviews." },
                { title: "Session Track 3", desc: "Young research forum and poster contest sessions." }
              ]
          });
        } else {
          setError("Conference details not found in database.");
        }
      } catch (err) {
        console.error("Failed to load conference details from backend database:", err);
        setError("Failed to load conference details from backend database.");
      } finally {
        setLoading(false);
      }
    };

    if (activeConfId) {
      fetchConferenceData();
    }
  }, [activeConfId]);

  // 2. Dynamically apply branding colors to CSS variables
  useEffect(() => {
    if (activeConf && activeConf.theme) {
      const root = document.documentElement;
      root.style.setProperty("--conf-primary", activeConf.theme.primary);
      root.style.setProperty("--conf-primary-hover", activeConf.theme.primaryHover);
      root.style.setProperty("--conf-secondary", activeConf.theme.accent);
      root.style.setProperty("--conf-bg-accent", `${activeConf.theme.primary}08`); // 8% opacity fallback for active cards

      // Clean up variables on route/unmount transition
      return () => {
        root.style.removeProperty("--conf-primary");
        root.style.removeProperty("--conf-primary-hover");
        root.style.removeProperty("--conf-secondary");
        root.style.removeProperty("--conf-bg-accent");
      };
    }
  }, [activeConf]);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        color: "#ffffff",
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "5px solid #30363d",
          borderTop: "5px solid #e74c3c",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ marginTop: "20px", color: "#8b949e", fontSize: "16px" }}>Loading portal configuration...</p>
      </div>
    );
  }

  if (error || !activeConf) {
    return <NotFoundPage />;
  }

  // Resolves local path (inside conference routing context)
  const getSubRoutePath = (subPath) => {
    let hash = "";
    let cleanPath = subPath;
    const hashIndex = cleanPath.indexOf("#");
    if (hashIndex !== -1) {
      hash = cleanPath.substring(hashIndex);
      cleanPath = cleanPath.substring(0, hashIndex);
    }

    let existingQuery = "";
    const queryIndex = cleanPath.indexOf("?");
    if (queryIndex !== -1) {
      existingQuery = cleanPath.substring(queryIndex);
      cleanPath = cleanPath.substring(0, queryIndex);
    }

    let basePath = "";
    if (isSubdomainActive) {
      basePath = cleanPath === "" ? "/" : `/${cleanPath}`;
    } else {
      basePath = cleanPath === "" ? `/conferences/${activeConf.slug}` : `/conferences/${activeConf.slug}/${cleanPath}`;
    }

    const searchParams = new URLSearchParams(location.search);
    const qSubdomain = searchParams.get("subdomain");
    let queryString = existingQuery;
    if (qSubdomain) {
      if (queryString) {
        queryString += `&subdomain=${qSubdomain}`;
      } else {
        queryString = `?subdomain=${qSubdomain}`;
      }
    }

    return `${basePath}${queryString}${hash}`;
  };

  const isLinkActive = (subPath) => {
    if (isSubdomainActive) {
      const targetPath = subPath === "" ? "/" : `/${subPath}`;
      return location.pathname === targetPath;
    }
    const targetPath = subPath === "" ? `/conferences/${activeConf.slug}` : `/conferences/${activeConf.slug}/${subPath}`;
    return location.pathname === targetPath;
  };

  return (
    <div className="conf-portal-wrapper">
      {/* Top Red Contact Bar */}
      <div className="conf-top-bar">
        <div className="conf-top-bar-container">
          <div className="conf-top-bar-item">
            <span>📞</span>
            <a href={`tel:${activeConf.phone}`}>{activeConf.phone}</a>
          </div>
          <div className="conf-top-bar-item">
            <span>✉️</span>
            <a href={`mailto:${activeConf.email}`}>{activeConf.email}</a>
          </div>
        </div>
      </div>

      {/* Main Header & Navbar */}
      <header className="conf-header">
        <div className="conf-header-container">
          <div className="conf-logo">
            <Link to={getSubRoutePath("")}>
              <img src="/logo.png" alt="Intelevo Research" />
            </Link>
          </div>

          <nav className={`conf-nav ${menuOpen ? "active" : ""}`}>
            {navPages
              .filter(p => p.isEnabled)
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map(page => {
                if (page.pageKey === "speakers") {
                  return (
                    <div key={page.id || page.pageKey} className="conf-nav-dropdown">
                      <span className="conf-nav-link">{page.label} ▾</span>
                      <div className="conf-dropdown-menu">
                        {speakerCategories.length > 0 ? (
                          speakerCategories.map(cat => (
                            <Link key={cat.id} to={getSubRoutePath(`speakers?categoryId=${cat.id}`)} className="conf-dropdown-item">
                              {cat.categoryName}
                            </Link>
                          ))
                        ) : (
                          <Link to={getSubRoutePath("speakers")} className="conf-dropdown-item">Speakers</Link>
                        )}
                      </div>
                    </div>
                  );
                }
                if (page.pageKey === "program") {
                  return (
                    <div key={page.id || page.pageKey} className="conf-nav-dropdown">
                      <span className="conf-nav-link">{page.label} ▾</span>
                      <div className="conf-dropdown-menu">
                        {programCategories.length > 0 ? (
                          programCategories.map(cat => (
                            <Link key={cat.id} to={getSubRoutePath(`program?categoryId=${cat.id}`)} className="conf-dropdown-item">
                              {cat.categoryName}
                            </Link>
                          ))
                        ) : (
                          <Link to={getSubRoutePath("program")} className="conf-dropdown-item">Scientific Program</Link>
                        )}
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={page.id || page.pageKey}
                    to={getSubRoutePath(page.route)}
                    className={`conf-nav-link ${isLinkActive(page.route) ? "active" : ""}`}
                  >
                    {page.label}
                  </Link>
                );
              })}
            <Link
              to={getSubRoutePath("brochure")}
              className={`conf-nav-link ${isLinkActive("brochure") ? "active" : ""}`}
            >
              Brochure
            </Link>
          </nav>

          <button
            className="conf-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Renders dynamic child routes */}
      <div className="conf-portal-body">
        <Outlet context={{ conference: activeConf, getSubRoutePath, footerSettings }} />
      </div>

      {/* Compact Footer */}
      <footer className="saas-footer">
        {/* Main Row */}
        <div className="saas-footer-main">
          {/* Left: Brand + Links + Socials */}
          <div className="saas-footer-brand-col">
            <div className="saas-footer-links-row">
              <Link to={getSubRoutePath("sponsorship")} className="saas-pill-link">🤝 Sponsorship</Link>
              <Link to={getSubRoutePath("guidelines")} className="saas-pill-link">📄 Guidelines</Link>
              <Link to={getSubRoutePath("contact")} className="saas-pill-link">✉️ Contact</Link>
              <Link to={getSubRoutePath("privacy")} className="saas-pill-link">🛡️ Privacy</Link>
            </div>
            <div className="saas-footer-socials">
              <a href={footerSettings?.facebook || "https://facebook.com"} target="_blank" rel="noreferrer" className="saas-social-icon fb" title="Facebook">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M14 13.5h2.5l1-3H14V8.6c0-.8.2-1.1 1-1.1h1.5V4.7c-.5-.1-1.6-.2-2.7-.2-2.8 0-4.3 1.4-4.3 4v2.5H7v3h2.5V20h4.5v-6.5z"/></svg>
              </a>
              <a href={footerSettings?.linkedin || "https://linkedin.com"} target="_blank" rel="noreferrer" className="saas-social-icon li" title="LinkedIn">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </a>
              <a href={footerSettings?.twitter || "https://twitter.com"} target="_blank" rel="noreferrer" className="saas-social-icon tw" title="Twitter/X">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.2 4h2.7l-5.9 6.8 6.9 9.2h-5.4l-4.2-5.5-4.8 5.5H4.8l6.3-7.2L4.5 4h5.6l3.9 5.1L18.2 4zm-.9 14.4h1.5L9.3 5.8H7.7l10.6 12.6z"/></svg>
              </a>
              <a href={footerSettings?.instagram || "https://instagram.com"} target="_blank" rel="noreferrer" className="saas-social-icon ig" title="Instagram">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.4 2.5a1 1 0 1 1 2 0 1 1 0 0 1-2 0M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
              </a>
              <a href={footerSettings?.youtube || "https://youtube.com"} target="_blank" rel="noreferrer" className="saas-social-icon yt" title="YouTube">
                <svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9C2 9.3 2 12 2 12s0 2.7.4 4.4a2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-4.4.4-4.4s0-2.7-.4-4.4zM9.8 15.5V8.5l6 3.5-6 3.5z"/></svg>
              </a>
              {footerSettings?.github && (
                <a href={footerSettings.github} target="_blank" rel="noreferrer" className="saas-social-icon gh" title="GitHub">
                  <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Right: Compact Subscribe */}
          {footerSettings?.newsletterEnabled !== false && (
            <div className="saas-footer-subscribe-col">
              <p className="saas-sub-label">📬 Stay Updated</p>
              <form onSubmit={handleSubscribeSubmit} className="saas-sub-inline-form">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="saas-inline-input"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  className="saas-inline-input"
                />
                <button type="submit" className="saas-inline-btn" disabled={subscribing}>
                  {subscribing ? "..." : "Subscribe"}
                </button>
                {subscribed && <span className="saas-success-icon">✅</span>}
              </form>
            </div>
          )}
        </div>

        {/* Footer Bottom Bar */}
        <div className="saas-footer-bottom">
          <div className="saas-bottom-container">
            <div className="saas-bottom-copyright">
              © {new Date().getFullYear()} {activeConf.title || "Intelevo Research"}. All Rights Reserved.
            </div>
            <div className="saas-bottom-links">
              <Link to={getSubRoutePath("privacy")}>Privacy Policy</Link>
              <span className="saas-separator">|</span>
              <Link to={getSubRoutePath("terms")}>Terms</Link>
              <span className="saas-separator">|</span>
              <Link to={getSubRoutePath("cookies")}>Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ConferenceLayout;
