import React from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "./Proceedings.css";

const Proceedings = () => {
  const volumes = [
    { year: 2026, title: "Proceedings of the Global Congress on Food Science", index: "Scopus, Web of Science", code: "FOOD-26", status: "Published" },
    { year: 2025, title: "Proceedings of the Global Summit on Medical and Health Sciences", index: "Scopus, CrossRef", code: "MED-25", status: "Indexed" },
    { year: 2025, title: "Proceedings of the International Conference on Engineering", index: "IEEE Xplore, Scopus", code: "ENG-25", status: "Indexed" }
  ];

  return (
    <>
      <Header />
      <section className="proceedings-hero">
        <div className="hero-overlay"></div>
        <div className="container proceedings-hero-content">
          <span className="badge-premium">ARCHIVES & PUBLICATIONS</span>
          <h1>Conference Proceedings</h1>
          <p>
            Access official peer-reviewed research papers and publications from Endeavor Scientific Conferences.
            All publications are indexed in major international academic directories.
          </p>
        </div>
      </section>

      <div className="proceedings-container container">
        <div className="proceedings-card">
          <h2>Indexed Volumes & Proceedings</h2>
          <p className="subtitle">Download and explore research manuscripts accepted at our international summits.</p>
          
          <div className="volumes-list">
            {volumes.map((vol, index) => (
              <div key={index} className="volume-item">
                <div className="volume-meta">
                  <span className="volume-year">{vol.year}</span>
                  <span className="volume-code">{vol.code}</span>
                </div>
                <div className="volume-info">
                  <h3>{vol.title}</h3>
                  <p className="indexing">Index: <strong>{vol.index}</strong></p>
                </div>
                <div className="volume-action">
                  <span className="status-badge-vol">{vol.status}</span>
                  <button className="btn-vol-download">Browse Papers</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Proceedings;
