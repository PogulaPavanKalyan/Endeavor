import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import "./Webinar.css";

const Webinar = () => {
  const [filter, setFilter] = useState("all"); // 'all', 'upcoming', 'past'
  const [search, setSearch] = useState("");
  const [webinarsList, setWebinarsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 6;

  useEffect(() => {
    // Reset page when filter or search changes
    setPage(0);
  }, [filter, search]);

  useEffect(() => {
    fetchWebinars();
  }, [filter, search, page]);

  const fetchWebinars = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `/api/webinars?page=${page}&size=${pageSize}`;
      if (filter !== "all") {
        url += `&type=${filter}`;
      }
      if (search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      const response = await api.get(url);
      if (response && response.content) {
        setWebinarsList(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setWebinarsList([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("Failed to load webinars:", err);
      setError("Unable to load webinars. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (web) => {
    // If completed status
    if (web.status && web.status.toLowerCase() === "completed") {
      return { text: "Completed", class: "past" };
    }
    
    // Calculate if it's upcoming or past based on current date
    const todayStr = new Date().toISOString().split('T')[0];
    if (web.webinarDate < todayStr) {
      return { text: "Completed", class: "past" };
    }
    
    if (web.status && web.status.toLowerCase() === "published") {
      return { text: "Upcoming", class: "upcoming" };
    }
    
    return { text: web.status || "Draft", class: "draft" };
  };

  return (
    <>
      <Header />

      <section className="webinar-hero">
        <div className="hero-overlay"></div>
        <div className="container webinar-hero-content">
          <span className="badge-premium">ONLINE COLLABORATION</span>
          <h1>Expert-Led Live Webinars</h1>
          <p>
            Stay at the absolute forefront of academic research. Connect dynamically with global experts,
            participate in live panel discussions, and earn recognized certifications.
          </p>
        </div>
      </section>

      <div className="webinars-page-container container">
        {/* Search & Filter Bar */}
        <div className="search-filter-wrapper">
          <div className="filter-tabs">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`} 
              onClick={() => setFilter("all")}
            >
              All Webinars
            </button>
            <button 
              className={`filter-btn ${filter === "upcoming" ? "active" : ""}`} 
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </button>
            <button 
              className={`filter-btn ${filter === "past" ? "active" : ""}`} 
              onClick={() => setFilter("past")}
            >
              Past Broadcasts
            </button>
          </div>

          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search webinars, speakers..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="search-input"
            />
            {search && (
              <button className="clear-search" onClick={() => setSearch("")}>&times;</button>
            )}
          </div>
        </div>

        {error && (
          <div className="webinar-error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading ? (
          <div className="webinar-loading-state">
            <div className="pulse-loader"></div>
            <p>Fetching scientific webinars...</p>
          </div>
        ) : (
          <>
            {/* Catalog Grid */}
            <div className="webinar-catalog-grid">
              {webinarsList.map((web) => {
                const statusInfo = getStatusLabel(web);
                return (
                  <div key={web.id} className={`webinar-item-card ${statusInfo.class}`}>
                    <div className="web-img-holder">
                      <img 
                        src={web.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"} 
                        alt={web.title} 
                        loading="lazy" 
                      />
                      <span className={`status-pill ${statusInfo.class}`}>{statusInfo.text}</span>
                    </div>

                    <div className="web-info-holder">
                      <div>
                        <div className="webinar-card-top">
                          <span className="timezone-badge">{web.timeZone || "UTC"}</span>
                          {web.certificateAvailable && (
                            <span className="certificate-badge">🎓 Certificate Available</span>
                          )}
                        </div>
                        <h3>{web.title}</h3>
                        <h4 className="speaker-name">
                          🎙️ {web.speakerName} 
                          <span className="speaker-title"> - {web.speakerDesignation}</span>
                        </h4>
                        <p className="description">
                          {web.description && web.description.length > 180 
                            ? `${web.description.substring(0, 180)}...` 
                            : web.description}
                        </p>
                      </div>
                      
                      <div>
                        <div className="web-meta">
                          <span>📅 {web.webinarDate}</span>
                          <span>⏰ {web.startTime} - {web.endTime}</span>
                        </div>

                        <div className="web-action">
                          <Link to={`/webinars/${web.slug}`} className="btn-view-details">
                            View Details &rarr;
                          </Link>
                          {statusInfo.class === "upcoming" ? (
                            web.registrationRequired ? (
                              <a 
                                href={web.registrationUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-register-action"
                              >
                                Register Now
                              </a>
                            ) : (
                              <span className="free-tag">Free Entry</span>
                            )
                          ) : (
                            web.recordingUrl && (
                              <span className="recording-available-tag">📹 Recording Available</span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {webinarsList.length === 0 && (
                <div className="empty-webinars-state">
                  <div className="empty-icon">📅</div>
                  <h3>No Webinars Found</h3>
                  <p>There are no webinars listed matching your criteria at this moment.</p>
                </div>
              )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="webinar-pagination">
                <button 
                  disabled={page === 0} 
                  onClick={() => setPage(page - 1)}
                  className="page-nav-btn"
                >
                  &larr; Prev
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setPage(i)}
                    className={`page-num-btn ${page === i ? "active" : ""}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  disabled={page === totalPages - 1} 
                  onClick={() => setPage(page + 1)}
                  className="page-nav-btn"
                >
                  Next &rarr;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </>
  );
};

export default Webinar;
