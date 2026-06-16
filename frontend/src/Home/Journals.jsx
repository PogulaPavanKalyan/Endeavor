import React from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "./Journals.css";

const Journals = () => {
  const journalsList = [
    { title: "Journal of Food Science and Technology", impactFactor: "3.2", publisher: "Springer", index: "Scopus, SCIE", coverage: "Food Chemistry, Nutrition, Biotechnology" },
    { title: "International Journal of Clinical Medicine", impactFactor: "4.5", publisher: "Elsevier", index: "Scopus, PubMed, SCIE", coverage: "Cardiology, Oncology, General Medicine" },
    { title: "Advances in Engineering Materials", impactFactor: "2.8", publisher: "Wiley", index: "Scopus, ESCI", coverage: "Nanotechnology, Applied Physics, Metallurgy" },
    { title: "Journal of Environmental Science & Policy", impactFactor: "3.9", publisher: "Elsevier", index: "Scopus, SCIE", coverage: "Climate Change, Resource Policy, Ecology" }
  ];

  return (
    <>
      <Header />
      <section className="journals-hero">
        <div className="hero-overlay"></div>
        <div className="container journals-hero-content">
          <span className="badge-premium">PUBLICATIONS & RESEARCH</span>
          <h1>Indexed Academic Journals</h1>
          <p>
            Publish your peer-reviewed research in top-tier international journals. Fast-track review and indexing services available for conference presenters.
          </p>
        </div>
      </section>

      <div className="journals-container container">
        <div className="journals-grid">
          {journalsList.map((j, index) => (
            <div key={index} className="journal-card">
              <div className="journal-card-header">
                <span className="journal-publisher">{j.publisher}</span>
                <span className="journal-if">Impact Factor: <strong>{j.impactFactor}</strong></span>
              </div>
              <h3>{j.title}</h3>
              <p className="journal-coverage"><strong>Coverage:</strong> {j.coverage}</p>
              <div className="journal-footer">
                <span className="journal-index-pill">🔍 {j.index}</span>
                <button className="btn-journal-details">Submit Paper</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Journals;
