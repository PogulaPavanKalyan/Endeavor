import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import SEOHead from "../components/SEOHead";
import { api } from "../utils/api";
import "../Home/About.css";

function AboutPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);

  // Carousel background slides (default high-res academic images)
  const defaultSlides = [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=2560&q=100",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2560&q=100",
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=2560&q=100",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=2560&q=100"
  ];

  const [slides, setSlides] = useState(defaultSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchAboutDetails();
  }, []);

  const fetchAboutDetails = async () => {
    try {
      const res = await api.get("/api/about");
      if (res) {
        setAboutData(res);
        if (res.section?.heroBgImage) {
          setSlides([res.section.heroBgImage, ...defaultSlides.slice(1)]);
        }
      }
    } catch (err) {
      console.error("Failed to load dynamic about data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const sec = aboutData?.section || {};
  const servicesList = (aboutData?.services && aboutData.services.length > 0)
    ? aboutData.services
    : [
        {
          id: 1,
          icon: "🏛️",
          title: "International Conferences",
          description: "Organizing world-class summits, symposia, and hybrid academic forums that serve as key hubs for knowledge exchange across diverse scientific disciplines."
        },
        {
          id: 2,
          icon: "📖",
          title: "Research Publications",
          description: "Facilitating double-blind peer-review processes and indexing alignments with leading international databases to maximize the impact of scientific papers."
        },
        {
          id: 3,
          icon: "🤝",
          title: "Global Networking",
          description: "Connecting eminent scholars, researchers, and industrial leaders across continents to establish collaborative partnerships and solve complex challenges."
        }
      ];

  const whyChooseList = (aboutData?.whyChoose && aboutData.whyChoose.length > 0)
    ? aboutData.whyChoose
    : [
        {
          id: 1,
          icon: "🌐",
          title: "Global Reach",
          description: "Connecting researchers and organizations across more than 120 countries."
        },
        {
          id: 2,
          icon: "🎙️",
          title: "Expert Speakers",
          description: "Eminent keynote addresses from distinguished academic and industrial pioneers."
        },
        {
          id: 3,
          icon: "⭐",
          title: "Research Excellence",
          description: "High scientific integrity through rigorous peer-review and steering panels."
        },
        {
          id: 4,
          icon: "🤝",
          title: "Industry Collaboration",
          description: "Bridging pure academic findings with practical, scalable industrial application."
        }
      ];

  return (
    <div className="abt-wrapper">
      <SEOHead
        title="About Intelevo Research | AI, Research & Technology"
        description="Learn about Intelevo Research, a global institution fostering scientific excellence, double-blind peer-reviewed publications, international summits, and academic collaborations."
        keywords="About Intelevo Research, Intelligence Evolved, Technology Research, Artificial Intelligence, Academic Conferences, Scientific Publications, Peer Review, Global Collaborations"
        ogTitle="About Intelevo Research | AI, Research & Technology"
        ogDescription="Intelevo Research fosters academic excellence and scientific discovery through double-blind peer-reviewed conferences and publications."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": "About Intelevo Research",
            "url": "https://intelevoresearch.com/about",
            "description": "Intelevo Research is a premier global institution dedicated to academic excellence, high-impact research dissemination, and scientific discovery."
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://intelevoresearch.com/" },
              { "@type": "ListItem", "position": 2, "name": "About Us", "item": "https://intelevoresearch.com/about" }
            ]
          }
        ]}
      />
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
            <div className="abt-hero-brand-top" style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#60A5FA" }}>
                {sec.heroBadge || "Intelligence Evolved"}
              </div>
            </div>
            <div className="abt-new-breadcrumbs">
              <Link to="/">Home</Link>
              <span className="abt-new-breadcrumbs-sep">/</span>
              <span className="abt-new-breadcrumbs-active">About Us</span>
            </div>
            <h1 className="abt-hero-new-title">
              {sec.heroTitle ? sec.heroTitle.replace("\\n", " ") : "About Intelevo Research"}
            </h1>
            <p className="abt-hero-new-desc">
              {sec.heroDescription || "Intelevo Research brings together researchers, academicians, industry experts and innovators through international conferences, publications and scientific networking across 50+ countries worldwide."}
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
              src={sec.overviewImage1 || "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"} 
              alt={sec.overviewTitle || "Who We Are"} 
              className="abt-who-image" 
            />
          </div>
          <div className="abt-who-text-box">
            <span className="abt-section-tag">{sec.overviewLabel || "Organization Overview"}</span>
            <h2 className="abt-section-heading">{sec.overviewTitle || "Who We Are"}</h2>
            <p className="abt-who-paragraph">
              {sec.overviewLead || "Intelevo Research is a premier global institution dedicated to fostering academic excellence, high-impact research dissemination, and scientific discovery. By bridging the gap between pioneering theories and industrial implementation, we serve as a vital catalyst for researchers and scholars worldwide."}
            </p>
            <p className="abt-who-paragraph">
              {sec.overviewBody || "Our core focus is the design and execution of world-class double-blind peer-reviewed international conferences, specialized workshops, and scientific symposia. Through deep collaborations with renowned international publishers and indexing networks, we ensure accepted works gain maximum global recognition."}
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
            {servicesList.map((card, idx) => (
              <div className="abt-what-card" key={card.id || idx}>
                <div className="abt-what-icon-wrapper" style={{ fontSize: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {card.icon || "✨"}
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
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
            {whyChooseList.map((item, idx) => (
              <div className="abt-why-item" key={item.id || idx}>
                <div className="abt-why-icon-box" style={{ fontSize: "22px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.icon || "🌟"}
                </div>
                <div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — CALL TO ACTION */}
      <section className="abt-cta-new-section">
        <div className="abt-container">
          <div className="abt-cta-new-card">
            <h2 className="abt-cta-new-heading">
              {sec.ctaTitle || "Join Our Global Research Community"}
            </h2>
            <p className="abt-cta-new-text">
              {sec.ctaDesc || "Submit your latest research, expand your scientific credentials, and network with leading academicians and industry professionals at our upcoming conferences."}
            </p>
            <div className="abt-cta-new-buttons">
              <button 
                className="abt-cta-new-btn-primary" 
                onClick={() => navigate(sec.ctaButton1Link || "/conferences")}
              >
                {sec.ctaButton1Text || "Explore Conferences"}
              </button>
              <button 
                className="abt-cta-new-btn-secondary" 
                onClick={() => navigate(sec.ctaButton2Link || "/contact")}
              >
                {sec.ctaButton2Text || "Contact Us"}
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