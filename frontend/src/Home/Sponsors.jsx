import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./Sponsors.css";

const Sponsors = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const data = await api.get("/api/sponsors");
        if (Array.isArray(data)) {
          setSponsors(data);
        }
      } catch (err) {
        console.error("Failed to load sponsors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSponsors();
  }, []);

  return (
    <>
      <SEOHead
        title="Global Sponsors & Academic Partners | Intelevo Research"
        description="Discover the leading academic institutions, publishing partners, and global technology sponsors collaborating with Intelevo Research."
        keywords="Intelevo Research Sponsors, Academic Partners, Global Collaborations, Scientific Publishing, Technology Sponsors"
        ogTitle="Global Sponsors & Academic Partners | Intelevo Research"
        ogDescription="Partnering with global technology organizations and academic institutions to advance research."
      />
      <Header />

      <section className="sponsors-hero">
        <div className="hero-overlay"></div>
        <div className="sponsors-hero-content container">
          <h1>Sponsors & Partners</h1>
          <div className="breadcrumb-box">
            <Link to="/">Home</Link> &gt; <span>Sponsors</span>
          </div>
        </div>
      </section>

      <section className="sponsors-section">
        <div className="container">
          <h2 className="sponsors-heading">Our Event Sponsors</h2>

          <div className="sponsors-grid">
            {loading ? (
              <div className="sponsors-loading">
                <div className="sponsors-spinner"></div>
                <p>Loading sponsors and partners...</p>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="sponsors-empty">
                <p>No sponsors currently listed. For sponsorship opportunities, please contact our support team.</p>
              </div>
            ) : (
              sponsors.map((sponsor) => {
                const logoUrl = sponsor.image?.fileName
                  ? `/uploads/sponsors/${sponsor.image.fileName}`
                  : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";

                return (
                  <div key={sponsor.id} className="sponsor-card">
                    <div className="sponsor-logo-wrapper">
                      <img src={logoUrl} alt={sponsor.sponsorName} />
                    </div>
                    <div className="sponsor-info">
                      <h3>{sponsor.sponsorName}</h3>
                      <p>{sponsor.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default Sponsors;
