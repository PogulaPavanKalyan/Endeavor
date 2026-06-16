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
    // Scroll to top on route change
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    if (activeConf && activeConf.id) {
      const fetchNavPages = async () => {
        try {
          const res = await api.get(`/api/conference-pages?conferenceId=${activeConf.id}`);
          if (Array.isArray(res)) {
            setNavPages(res);
          }
        } catch (err) {
          console.error("Failed to load nav pages:", err);
        }
      };
      fetchNavPages();
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
            email: data.contactEmail || "hello@endeavorresearchgroup.net",
            phone: data.contactPhone || "+1 (209) 299-5348",
            image: data.photo?.filePath 
              ? `/uploads/conference/${data.photo.fileName}` 
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            theme: {
              primary: data.themePrimary || "#e74c3c",
              primaryHover: data.themePrimaryHover || "#c0392b",
              accent: data.themeAccent || "#f39c12"
            },
            about: data.description || "Welcome to our premium international congress event. Meet and network with leaders in this discipline.",
            scientificSessions: data.scientificSessions || [],
            pricingTiers: data.pricingTiers || [],
            startDate: data.startDate,
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
              <img src="/logo.png" alt="Endeavor Conferences" />
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
                        <Link to={getSubRoutePath("speakers")} className="conf-dropdown-item">Keynote Speakers</Link>
                        <Link to={getSubRoutePath("speakers?type=oral")} className="conf-dropdown-item">Oral Presenters</Link>
                      </div>
                    </div>
                  );
                }
                if (page.pageKey === "program") {
                  return (
                    <div key={page.id || page.pageKey} className="conf-nav-dropdown">
                      <span className="conf-nav-link">{page.label} ▾</span>
                      <div className="conf-dropdown-menu">
                        <Link to={getSubRoutePath("program")} className="conf-dropdown-item">Scientific Program</Link>
                        <Link to={getSubRoutePath("program#schedule")} className="conf-dropdown-item">Program Schedule</Link>
                        <Link to={getSubRoutePath("program#tracks")} className="conf-dropdown-item">Scientific Tracks</Link>
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
        <Outlet context={{ conference: activeConf, getSubRoutePath }} />
      </div>

      {/* Clean Portal Footer */}
      <footer style={{ backgroundColor: "#111111", color: "#ffffff", padding: "30px 0", textAlign: "center", borderTop: "4px solid var(--conf-primary)", fontSize: "14px" }}>
        <p>© {new Date().getFullYear()} {activeConf.title}. All Rights Reserved | Powered by Endeavor Research Group</p>
      </footer>
    </div>
  );
};

export default ConferenceLayout;
