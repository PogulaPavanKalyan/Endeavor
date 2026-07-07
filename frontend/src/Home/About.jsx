import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import "../Home/About.css";

function AboutPage() {
  const navigate = useNavigate();

  // Carousel background slides (highly professional academic and research related images)
  const slides = [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2560&q=100", // professional stage conference screen
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2560&q=100", // high tech research space
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=2560&q=100", // academic collaboration and panels
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2560&q=100"  // brainstorming academic research workspace
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // fade every 6 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="abt-wrapper">
      <Header />

      {/* SECTION 1 — HERO BANNER */}
      <section className="abt-hero-banner-new">
        {/* Carousel Background Slides */}
        <div className="abt-hero-carousel-container">
          {slides.map((slideUrl, idx) => (
            <div 
              key={idx}
              className={`abt-hero-slide ${idx === currentSlide ? "active" : ""}`}
              style={{ backgroundImage: `url('${slideUrl}')` }}
            />
          ))}
        </div>
        <div className="abt-hero-new-overlay" />
        
        <div className="abt-container">
          <div className="abt-hero-new-content">
            <div className="abt-new-breadcrumbs">
              <Link to="/">Home</Link>
              <span className="abt-new-breadcrumbs-sep">/</span>
              <span className="abt-new-breadcrumbs-active">About Us</span>
            </div>
            <h1 className="abt-hero-new-title">About Intelevo Research</h1>
            <p className="abt-hero-new-desc">
              Intelevo Research brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking across 50+ countries worldwide.
            </p>
            
            {/* Elegant Carousel Navigation Dots */}
            <div className="abt-hero-carousel-dots">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`abt-hero-dot ${idx === currentSlide ? "active" : ""}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHO WE ARE */}
      <section className="abt-who-we-are-section">
        <div className="abt-container abt-who-grid">
          <div className="abt-who-image-box">
            <img 
              src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80" 
              alt="Who We Are" 
              className="abt-who-image" 
            />
          </div>
          <div className="abt-who-text-box">
            <span className="abt-section-tag">Organization Overview</span>
            <h2 className="abt-section-heading">Who We Are</h2>
            <p className="abt-who-paragraph">
              Intelevo Research is a premier global institution dedicated to fostering academic excellence, high-impact research dissemination, and scientific discovery. By bridging the gap between pioneering theories and industrial implementation, we serve as a vital catalyst for researchers and scholars worldwide.
            </p>
            <p className="abt-who-paragraph">
              Our core focus is the design and execution of world-class double-blind peer-reviewed international conferences, specialized workshops, and scientific symposia. Through deep collaborations with renowned international publishers and indexing networks, we ensure accepted works gain maximum global recognition.
            </p>
            <p className="abt-who-paragraph">
              By hosting multidisciplinary forums, we invite researchers to share their findings, form cross-border partnerships, and shape the future of global scientific policy and technology.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHAT WE DO */}
      <section className="abt-what-we-do-section">
        <div className="abt-container">
          <div className="abt-center-header">
            <span className="abt-section-tag">Core Activities</span>
            <h2 className="abt-section-heading">What We Do</h2>
            <p className="abt-center-subheading">Fostering progress through specialized academic channels and publishing pathways.</p>
          </div>
          
          <div className="abt-what-cards-grid">
            {/* Card 1: International Conferences */}
            <div className="abt-what-card">
              <div className="abt-what-icon-wrapper">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>International Conferences</h3>
              <p>Organizing world-class summits, symposia, and hybrid academic forums that serve as key hubs for knowledge exchange across diverse scientific disciplines.</p>
            </div>

            {/* Card 2: Research Publications */}
            <div className="abt-what-card">
              <div className="abt-what-icon-wrapper">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3>Research Publications</h3>
              <p>Facilitating double-blind peer-review processes and indexing alignments with leading international databases to maximize the impact of scientific papers.</p>
            </div>

            {/* Card 3: Global Networking */}
            <div className="abt-what-card">
              <div className="abt-what-icon-wrapper">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <h3>Global Networking</h3>
              <p>Connecting eminent scholars, researchers, and industrial leaders across continents to establish collaborative partnerships and solve complex challenges.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY CHOOSE US */}
      <section className="abt-why-choose-section">
        <div className="abt-container">
          <div className="abt-center-header">
            <span className="abt-section-tag">Our Value Proposition</span>
            <h2 className="abt-section-heading">Why Choose Us</h2>
            <p className="abt-center-subheading">Delivering rigorous standards and expansive scientific networking channels.</p>
          </div>

          <div className="abt-why-horizontal-grid">
            <div className="abt-why-item">
              <div className="abt-why-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div>
                <h4>Global Reach</h4>
                <p>Connecting researchers and organizations across more than 120 countries.</p>
              </div>
            </div>

            <div className="abt-why-item">
              <div className="abt-why-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h4>Expert Speakers</h4>
                <p>Eminent keynote addresses from distinguished academic and industrial pioneers.</p>
              </div>
            </div>

            <div className="abt-why-item">
              <div className="abt-why-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h4>Research Excellence</h4>
                <p>High scientific integrity through rigorous peer-review and steering panels.</p>
              </div>
            </div>

            <div className="abt-why-item">
              <div className="abt-why-icon-box">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4>Industry Collaboration</h4>
                <p>Bridging pure academic findings with practical, scalable industrial application.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — CALL TO ACTION */}
      <section className="abt-cta-new-section">
        <div className="abt-container">
          <div className="abt-cta-new-card">
            <h2 className="abt-cta-new-heading">Join Our Global Research Community</h2>
            <p className="abt-cta-new-text">
              Submit your latest research, expand your scientific credentials, and network with leading academicians and industry professionals at our upcoming conferences.
            </p>
            <div className="abt-cta-new-buttons">
              <button 
                className="abt-cta-new-btn-primary" 
                onClick={() => navigate("/conferences")}
              >
                Explore Conferences
              </button>
              <button 
                className="abt-cta-new-btn-secondary" 
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;