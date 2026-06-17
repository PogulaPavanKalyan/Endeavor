import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { api } from '../utils/api';
import NotFoundPage from '../components/NotFoundPage';
import './DynamicConferencePage.css';

const DynamicConferencePage = () => {
  const { slug } = useParams();
  const { conference, getSubRoutePath } = useOutletContext();

  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (conference && conference.id && slug) {
      fetchPageData();
    }
  }, [conference?.id, slug]);

  const fetchPageData = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await api.get(`/api/navbar-menus/page?conferenceId=${conference.id}&slug=${slug}`);
      if (data && data.id) {
        setPageData(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching dynamic page data:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        backgroundColor: "#0d1117",
        color: "#ffffff",
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid #30363d",
          borderTop: "4px solid var(--conf-primary, #e74c3c)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <p style={{ marginTop: "16px", color: "#8b949e", fontSize: "14px" }}>Loading page content...</p>
      </div>
    );
  }

  if (error || !pageData) {
    return <NotFoundPage />;
  }

  const { title, pageTitle, menuType, content, bannerPath, thumbnailPath } = pageData;

  // Banner image styling
  const heroStyle = bannerPath 
    ? { backgroundImage: `url(${bannerPath})` } 
    : { background: `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)` };

  return (
    <div className="dynamic-page-wrapper">
      {/* Dynamic Hero Banner */}
      <div className="dynamic-hero-banner" style={heroStyle}>
        <div className="dynamic-hero-overlay" />
        <div className="dynamic-hero-content">
          <h1 className="dynamic-hero-title">{pageTitle || title}</h1>
          <div className="dynamic-breadcrumbs">
            <Link to={getSubRoutePath("")}>Home</Link>
            <span>/</span>
            <span>{menuType}</span>
            <span>/</span>
            <span style={{ color: "var(--conf-primary, #e74c3c)", fontWeight: "600" }}>{title}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="dynamic-main-container">
        {/* Left Side: Rich text Content */}
        <div className="dynamic-content-body">
          <div 
            className="rich-content-wrapper" 
            dangerouslySetInnerHTML={{ __html: content || "<p>No content provided yet.</p>" }} 
          />
        </div>

        {/* Right Side: Sidebar info & shortcuts */}
        <div className="dynamic-sidebar">
          {thumbnailPath && (
            <div className="sidebar-card" style={{ padding: "16px", textAlign: "center" }}>
              <img src={thumbnailPath} alt={title} className="sidebar-thumbnail" />
            </div>
          )}

          <div className="sidebar-card">
            <h4 className="sidebar-title">Quick Actions</h4>
            <div className="sidebar-buttons">
              <Link to={getSubRoutePath("register")} className="sidebar-btn sidebar-btn-primary">
                Register For Conference
              </Link>
              <Link to={getSubRoutePath("submit-abstract")} className="sidebar-btn sidebar-btn-secondary">
                Submit Abstract
              </Link>
              {conference?.brochureFileName && (
                <a 
                  href={`/uploads/brochures/${conference.brochureFileName}`} 
                  download 
                  className="sidebar-btn sidebar-btn-secondary"
                >
                  Download Brochure
                </a>
              )}
              <Link to={getSubRoutePath("contact")} className="sidebar-btn sidebar-btn-secondary">
                Contact Organizer
              </Link>
            </div>
          </div>

          <div className="sidebar-card" style={{ fontSize: "14px", color: "#8b949e", lineHeight: "1.6" }}>
            <h4 className="sidebar-title" style={{ marginBottom: "12px" }}>Event Details</h4>
            <p style={{ margin: "0 0 8px 0" }}>
              <strong style={{ color: "#ffffff" }}>Date:</strong><br />
              {conference?.date}
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: "#ffffff" }}>Venue:</strong><br />
              {conference?.venue}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicConferencePage;
