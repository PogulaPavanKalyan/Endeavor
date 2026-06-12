import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import { getSubdomainUrl } from "../utils/subdomain.jsx";
import "./Confrencespage.css";

const Confrencespage = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const data = await api.get("/api/conferences");
        if (Array.isArray(data)) {
          const mappedList = data.map((conf) => ({
            id: conf.slug || `dynamic-${conf.id}`,
            dbId: conf.id,
            title: conf.title || conf.tittle,
            date: `${conf.startDate} to ${conf.endDate}`,
            venue: conf.venue,
            image: conf.photo?.filePath 
              ? `/uploads/conference/${conf.photo.fileName}` 
              : "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
            subdomain: conf.slug
          }));
          setConferences(mappedList);
        }
      } catch (err) {
        console.error("Failed to load conferences from backend:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConferences();
  }, []);

  return (
    <>
      <Header />
      
      <section className="conf-hero">
        <div className="hero-overlay"></div>
        <div className="container conf-hero-content">
          <h1>Conferences</h1>
          <div className="breadcrumb-box">
            <Link to="/">Home</Link> &gt; <span>Conferences</span>
          </div>
        </div>
      </section>

      <section className="conferences-section">
        <div className="container">
          <h2 className="upcoming-title">UPCOMING CONFERENCES</h2>
          
          <div className="conferences-grid">
            {loading ? (
              <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "50px 0" }}>
                <div style={{ width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid #c62828", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 15px auto" }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                <p style={{ color: "#718096", fontSize: "15px" }}>Loading active conferences...</p>
              </div>
            ) : conferences.length === 0 ? (
              <div style={{ textAlign: "center", gridColumn: "1/-1", padding: "50px 0" }}>
                <p style={{ color: "#718096", fontSize: "16px", fontWeight: "500" }}>No conferences currently scheduled.</p>
              </div>
            ) : (
              conferences.map((conf) => (
                <div key={conf.id} className="conference-card">
                  <div className="card-image-wrapper">
                    <img src={conf.image} alt={conf.title} />
                    <div className="date-tag">
                      <span className="calendar-icon">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 192h424c6.6 0 12 5.4 12 12v260c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V204c0-6.6 5.4-12 12-12zm436-44v-36c0-26.5-21.5-48-48-48h-48V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H160V12c0-6.6-5.4-12-12-12h-40c-6.6 0-12 5.4-12 12v52H48C21.5 64 0 85.5 0 112v36c0 6.6 5.4 12 12 12h424c6.6 0 12-5.4 12-12z"></path>
                        </svg>
                      </span>
                      {conf.date}
                    </div>
                  </div>
                  
                  <div className="card-info" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "120px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#333333", margin: "0 0 15px 0", lineHeight: "1.45" }}>
                      {conf.title} | {conf.venue}
                    </h3>
                    <a 
                      href={getSubdomainUrl(conf.subdomain || conf.dbId)} 
                      className="read-more-link"
                    >
                      Read More
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Confrencespage;

