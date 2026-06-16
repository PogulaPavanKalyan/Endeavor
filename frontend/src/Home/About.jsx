import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api, BASE_URL } from "../utils/api";
import "../Home/About.css";

/* ─── Animated Counter ──────────────────────────────────────────────────── */
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
        else { setStarted(false); setCount(0); }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let t = null;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) t = requestAnimationFrame(tick);
      else setCount(end);
    };
    t = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(t);
  }, [started, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Sponsor Logo ──────────────────────────────────────────────────────── */
const SponsorLogo = ({ name, logoFileName }) => {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  // If it's a known default and logoFileName is not custom uploaded, render the original beautiful inline SVG
  const isDefaultLogo = !logoFileName || logoFileName === "ieee" || logoFileName === "springer" || logoFileName === "elsevier" || logoFileName === "scopus" || logoFileName === "crossref" || logoFileName === "google";

  if (isDefaultLogo) {
    if (n.includes("ieee"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="800" fontFamily="Poppins, sans-serif">IEEE</text>
        </svg>
      );
    if (n.includes("springer"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="30" r="10" fill="#E91E63"/>
          <text x="48" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Poppins, sans-serif">Springer</text>
        </svg>
      );
    if (n.includes("elsevier"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 42 L28 18 L36 42 Z" fill="#0F172A"/>
          <circle cx="28" cy="24" r="4" fill="#E91E63"/>
          <text x="50" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Poppins, sans-serif">Elsevier</text>
        </svg>
      );
    if (n.includes("scopus"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="18" width="24" height="22" rx="4" fill="#0F172A"/>
          <text x="50" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Poppins, sans-serif">Scopus</text>
        </svg>
      );
    if (n.includes("crossref"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="30" r="10" stroke="#E91E63" strokeWidth="4" fill="none"/>
          <text x="48" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Poppins, sans-serif">CrossRef</text>
        </svg>
      );
    if (n.includes("google"))
      return (
        <svg className="abt-partner-svg" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 18 L10 28 L24 38 L38 28 Z" fill="#E91E63"/>
          <text x="52" y="36" fill="#0F172A" fontSize="15" fontWeight="800" fontFamily="Poppins, sans-serif">Scholar</text>
        </svg>
      );
  }

  // Otherwise, render the uploaded logo file
  const logoUrl = logoFileName.startsWith("http://") || logoFileName.startsWith("https://") 
    ? logoFileName 
    : `${BASE_URL}/uploads/about/${logoFileName}`;

  return <img className="abt-partner-logo-img" src={logoUrl} alt={name} style={{ maxHeight: "36px", objectFit: "contain" }} />;
};

/* ─── Leadership Card ───────────────────────────────────────────────────── */
const LeaderCard = ({ emoji, name, role, institution, country, photoFileName }) => {
  const avatarUrl = photoFileName 
    ? (photoFileName.startsWith("http") ? photoFileName : `${BASE_URL}/uploads/about/${photoFileName}`) 
    : null;

  return (
    <div className="abt-leader-card">
      <div className="abt-leader-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="abt-leader-photo-img" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
        ) : (
          emoji || "👩‍🔬"
        )}
      </div>
      <div className="abt-leader-info">
        <h4>{name}</h4>
        <span className="abt-leader-role">{role}</span>
        <span className="abt-leader-institution">{institution}</span>
        <span className="abt-leader-country">🌐 {country}</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
function AboutPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const result = await api.get("/api/about");
        setData(result);
      } catch (err) {
        console.error("Failed to load about us data:", err);
        setError(err.message || "Failed to load content.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getImageUrl = (pathOrName, fallback) => {
    if (!pathOrName) return fallback;
    if (pathOrName.startsWith("http://") || pathOrName.startsWith("https://")) {
      return pathOrName;
    }
    return `${BASE_URL}/uploads/about/${pathOrName}`;
  };

  if (loading) {
    return (
      <div className="abt-wrapper">
        <Header />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", gap: "20px" }}>
          <div className="abt-hero-badge-dot" style={{ width: "24px", height: "24px", animationDuration: "1s" }} />
          <p style={{ color: "#64748B", fontWeight: 600, fontFamily: "Outfit" }}>Loading About Us Details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="abt-wrapper">
        <Header />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "60vh", padding: "40px", textAlign: "center" }}>
          <span style={{ fontSize: "48px" }}>⚠️</span>
          <h3 style={{ marginTop: "16px", color: "#0F172A" }}>Could not load content</h3>
          <p style={{ color: "#64748B", marginTop: "8px", maxWidth: "400px" }}>{error || "An unexpected error occurred while fetching About Us data."}</p>
          <button className="abt-btn-primary" style={{ marginTop: "24px" }} onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
        <Footer />
      </div>
    );
  }

  const section = data.section || {};
  const features = data.features || [];
  const services = data.services || [];
  const whyChoose = data.whyChoose || [];
  const partners = data.partners || [];
  const milestones = data.milestones || [];
  const leaders = data.leaders || [];
  const locations = data.locations || [];
  const connections = data.connections || [];

  // Parse title into line1 and line2 based on newline split
  const heroTitle = section.heroTitle || "";
  const titleLines = heroTitle.split("\n");
  const heroTitleLine1 = titleLines[0] || "Connecting Global";
  const heroTitleLine2 = titleLines[1] || "Research Communities";

  // Parse points lists
  const missionPointsArray = section.missionPoints ? section.missionPoints.split("\n").filter(Boolean) : [];
  const visionPointsArray = section.visionPoints ? section.visionPoints.split("\n").filter(Boolean) : [];

  return (
    <div className="abt-wrapper">
      <Header />

      {/* ══ SECTION 1 — HERO ══════════════════════════════════════════════ */}
      <section 
        className="abt-hero"
        style={{ backgroundImage: `url('${getImageUrl(section.heroBgImage, "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1800&q=90")}')` }}
      >
        {/* Layered overlays */}
        <div className="abt-hero-overlay-dark" />
        <div className="abt-hero-overlay-gradient" />
        <div className="abt-hero-glow-pink" />
        <div className="abt-hero-glow-blue" />

        <div className="abt-hero-inner container">
          {/* ── Left Column: Content ── */}
          <div className="abt-hero-left abt-hero-animate-left">
            {/* Top Badge */}
            <div className="abt-hero-badge">
              <span className="abt-hero-badge-dot" />
              <span>{section.heroBadge}</span>
            </div>

            {/* Main Heading */}
            <h1 className="abt-hero-title">
              {heroTitleLine1}<br />
              <span className="abt-hero-title-accent">{heroTitleLine2}</span>
            </h1>

            {/* Description */}
            <p className="abt-hero-desc">
              {section.heroDescription}
            </p>

            {/* CTA Buttons */}
            <div className="abt-hero-btns">
              {section.heroCtaText1 && (
                <button className="abt-btn-primary" onClick={() => navigate(section.heroCtaLink1 || "/conferences")}>
                  {section.heroCtaText1}
                </button>
              )}
              {section.heroCtaText2 && (
                <button className="abt-btn-secondary" onClick={() => navigate(section.heroCtaLink2 || "/submit-abstract")}>
                  {section.heroCtaText2}
                </button>
              )}
            </div>

            {/* Trust Badges Row */}
            <div className="abt-hero-trust-row">
              <div className="abt-hero-trust-item">
                <span className="abt-trust-check">✓</span>
                <span>Scopus Indexed</span>
              </div>
              <div className="abt-hero-trust-divider" />
              <div className="abt-hero-trust-item">
                <span className="abt-trust-check">✓</span>
                <span>Peer Reviewed</span>
              </div>
              <div className="abt-hero-trust-divider" />
              <div className="abt-hero-trust-item">
                <span className="abt-trust-check">✓</span>
                <span>Global Networking</span>
              </div>
              <div className="abt-hero-trust-divider" />
              <div className="abt-hero-trust-item">
                <span className="abt-trust-check">✓</span>
                <span>Fast-Track Publication</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: 4 Glass Stat Cards ── */}
          <div className="abt-hero-right abt-hero-animate-right">
            <div className="abt-hero-stats-grid">
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">🎙️</span>
                <strong className="abt-hero-stat-num">{section.statConferences}+</strong>
                <span className="abt-hero-stat-label">Conferences</span>
                <span className="abt-hero-stat-sub">Internationally hosted</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">👩‍🔬</span>
                <strong className="abt-hero-stat-num">{(section.statResearchers || 10000).toLocaleString()}+</strong>
                <span className="abt-hero-stat-label">Researchers</span>
                <span className="abt-hero-stat-sub">Active global network</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">🌍</span>
                <strong className="abt-hero-stat-num">{section.statCountries}+</strong>
                <span className="abt-hero-stat-label">Countries</span>
                <span className="abt-hero-stat-sub">Worldwide representation</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">📖</span>
                <strong className="abt-hero-stat-num">{section.statPublications}+</strong>
                <span className="abt-hero-stat-label">Publications</span>
                <span className="abt-hero-stat-sub">Scopus indexed papers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 2 — WHO WE ARE ═══════════════════════════════════════ */}
      <section className="abt-section abt-who">
        <div className="container abt-who-grid">
          {/* Left: Content */}
          <div className="abt-who-left">
            <span className="abt-chip">{section.overviewLabel}</span>
            <h2 className="abt-section-title">{section.overviewTitle}</h2>
            <p className="abt-lead-text">
              {section.overviewLead}
            </p>
            <p className="abt-body-text">
              {section.overviewBody}
            </p>

            {/* Stats Row */}
            <div className="abt-stats-row">
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={section.statConferences || 150} suffix="+" /></strong>
                <span>Conferences</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={section.statResearchers || 10000} suffix="+" /></strong>
                <span>Researchers</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={section.statCountries || 50} suffix="+" /></strong>
                <span>Countries</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={section.statPublications || 500} suffix="+" /></strong>
                <span>Publications</span>
              </div>
            </div>

            <div className="abt-check-list">
              {features.map((f, i) => (
                <div className="abt-check-row" key={f.id || i}>
                  <span className="abt-check-icon">✓</span>
                  <div>
                    <strong>{f.title}</strong>
                    <span>{f.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="abt-who-right">
            <div className="abt-who-img-frame">
              <img
                src={getImageUrl(section.overviewImage1, "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80")}
                alt="International Research Conference"
                className="abt-who-img"
              />
              <div className="abt-who-img-secondary">
                <img
                  src={getImageUrl(section.overviewImage2, "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=500&q=80")}
                  alt="Academic Networking"
                />
              </div>
              <div className="abt-who-float-badge">
                <span>{section.overviewBadgeIcon || "🏆"}</span>
                <div>
                  <strong>{section.overviewBadgeTitle}</strong>
                  <span>{section.overviewBadgeText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 3 — MISSION & VISION ═════════════════════════════════ */}
      <section className="abt-section abt-bg-light abt-mv">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip">Our Purpose</span>
            <h2 className="abt-section-title-center">Mission & Vision</h2>
            <p className="abt-section-desc">
              Driven by a singular commitment to advancing global scientific knowledge.
            </p>
          </div>
          <div className="abt-mv-grid">
            <div className="abt-mv-card abt-mv-mission">
              <div className="abt-mv-icon">🎯</div>
              <h3>{section.missionTitle}</h3>
              <p>
                {section.missionDesc}
              </p>
              <ul className="abt-mv-points">
                {missionPointsArray.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              <div className="abt-mv-bottom-bar abt-mv-bar-pink" />
            </div>

            <div className="abt-mv-card abt-mv-vision">
              <div className="abt-mv-icon">👁️</div>
              <h3>{section.visionTitle}</h3>
              <p>
                {section.visionDesc}
              </p>
              <ul className="abt-mv-points">
                {visionPointsArray.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              <div className="abt-mv-bottom-bar abt-mv-bar-purple" />
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 4 — WHAT WE DO ═══════════════════════════════════════ */}
      <section className="abt-section abt-what">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip">Our Services</span>
            <h2 className="abt-section-title-center">What We Do</h2>
            <p className="abt-section-desc">
              Comprehensive academic services supporting researchers at every stage of their scientific journey.
            </p>
          </div>
          <div className="abt-what-grid">
            {services.map((item, i) => (
              <div className="abt-what-card" key={item.id || i}>
                <div className="abt-what-icon-wrap">
                  <span>{item.icon}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="abt-what-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 5 — WHY CHOOSE US ════════════════════════════════════ */}
      <section className="abt-section abt-bg-light abt-why">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip">Value Proposition</span>
            <h2 className="abt-section-title-center">Why Choose Endeavor</h2>
            <p className="abt-section-desc">
              We optimize academic publication workflows and foster high-impact scientific networking.
            </p>
          </div>
          <div className="abt-why-grid">
            {whyChoose.map((item, i) => (
              <div className="abt-why-card" key={item.id || i}>
                <span className="abt-why-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 6 — GLOBAL IMPACT ════════════════════════════════════ */}
      <section className="abt-section abt-impact">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip abt-chip-white">Global Impact</span>
            <h2 className="abt-section-title-center abt-text-white">Our Numbers Speak</h2>
            <p className="abt-section-desc abt-text-muted-light">
              A decade of dedicated service to the global research community.
            </p>
          </div>

          <div className="abt-impact-stats">
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statConferences || 150} suffix="+" /></strong>
              <span>Conferences Hosted</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statResearchers || 10000} suffix="+" /></strong>
              <span>Researchers Connected</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statCountries || 50} suffix="+" /></strong>
              <span>Countries Represented</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statPublications || 500} suffix="+" /></strong>
              <span>Publications Indexed</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statSpeakers || 200} suffix="+" /></strong>
              <span>Keynote Speakers</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={section.statSatisfaction || 98} suffix="%" /></strong>
              <span>Delegate Satisfaction</span>
            </div>
          </div>

          {/* World Map */}
          <div className="abt-impact-map">
            <div className="abt-map-card">
              <svg viewBox="0 0 1100 480" className="abt-world-map" xmlns="http://www.w3.org/2000/svg">
                {/* Grid dots representing world map */}
                <defs>
                  <pattern id="mapDots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.4" fill="rgba(148,163,184,0.25)" />
                  </pattern>
                </defs>
                <rect width="1100" height="480" fill="url(#mapDots)" />

                {/* Continent shapes simplified */}
                {[
                  [150,100,200,120],[165,115,210,135],[180,130,215,150],[195,145,225,165],[200,160,230,180],
                  [160,165,200,185],[250,260,280,280],[265,280,290,300],[275,300,295,330],[285,330,305,355],
                  [480,100,530,120],[495,115,545,135],[510,130,555,150],[500,145,545,165],[495,155,540,175],
                  [520,170,560,195],[510,200,545,225],[530,215,565,240],[540,230,570,255],[545,250,570,275],
                  [540,270,565,295],[545,290,570,310],[550,305,575,325],
                  [660,160,700,180],[670,175,715,200],[680,195,720,215],[685,205,722,225],[680,220,715,240],
                  [685,235,715,255],[675,250,710,270],
                  [760,110,800,130],[775,125,820,145],[790,140,840,165],[800,155,845,180],[810,170,850,190],
                  [820,185,860,205],[825,200,860,220],[830,210,860,230],
                  [850,310,900,335],[860,325,910,350],[870,340,920,365],
                ].map(([cx, cy, dx, dy], i) => (
                  <ellipse key={i} cx={(cx+dx)/2} cy={(cy+dy)/2} rx={(dx-cx)/2} ry={(dy-cy)/2} fill="rgba(148,163,184,0.18)" />
                ))}

                {/* Connection curves */}
                {connections.map((conn, i) => (
                  <path 
                    key={conn.id || i}
                    d={`M ${conn.startX} ${conn.startY} Q ${conn.controlX} ${conn.controlY} ${conn.endX} ${conn.endY}`} 
                    stroke="rgba(233,30,99,0.4)" 
                    strokeWidth="1.5" 
                    strokeDasharray={conn.dashArray || "8 5"} 
                    fill="none" 
                  />
                ))}

                {/* Locations markers */}
                {locations.map((loc, i) => {
                  const r1 = loc.isOffice ? 18 : 12;
                  const r2 = loc.isOffice ? 10 : 6;
                  const r3 = loc.isOffice ? 5 : 3;
                  const textOffset = loc.isOffice ? 17 : 13;
                  return (
                    <g key={loc.id || i}>
                      <circle cx={loc.x} cy={loc.y} r={r1} fill="rgba(233,30,99,0.15)" />
                      <circle cx={loc.x} cy={loc.y} r={r2} fill="rgba(233,30,99,0.3)" />
                      <circle cx={loc.x} cy={loc.y} r={r3} fill="#E91E63" />
                      <text x={loc.x} y={loc.y - textOffset} textAnchor="middle" fill="white" fontSize={loc.isOffice ? "10" : "9"} fontWeight="700" fontFamily="Poppins">
                        {loc.name}
                      </text>
                    </g>
                  );
                })}

                {/* Labels */}
                <text x="100" y="430" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="Poppins">© Research Endeavor – Global Presence</text>
              </svg>

              {/* Office badges over map */}
              {locations.filter(loc => loc.isOffice).map((loc, i) => {
                const leftPercent = (loc.x / 1100) * 100;
                const topPercent = (loc.y / 480) * 100;
                const adjustedTop = topPercent + 4; // offset card slightly below marker
                return (
                  <div 
                    key={loc.id || i} 
                    className="abt-map-office"
                    style={{ left: `${leftPercent}%`, top: `${adjustedTop}%`, transform: 'translateX(-50%)' }}
                  >
                    <span>🏢</span>
                    <div>
                      <strong>{loc.officeTitle}</strong>
                      <span>{loc.officeAddress}</span>
                    </div>
                  </div>
                );
              })}

              {/* Mobile Office Address Cards list (only visible on mobile viewports via CSS) */}
              <div className="abt-mobile-offices">
                {locations.filter(loc => loc.isOffice).map((loc, i) => (
                  <div key={loc.id || i} className="abt-mobile-office-card">
                    <span className="abt-mobile-office-icon">🏢</span>
                    <div className="abt-mobile-office-info">
                      <strong>{loc.officeTitle}</strong>
                      <span>{loc.officeAddress}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 7 — LEADERSHIP & ADVISORY BOARD ═════════════════════ */}
      <section className="abt-section abt-leadership">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip">Our People</span>
            <h2 className="abt-section-title-center">Leadership & Advisory Board</h2>
            <p className="abt-section-desc">
              Our distinguished panel of global experts, scientists and academic leaders steering Endeavor's mission.
            </p>
          </div>
          <div className="abt-leaders-grid">
            {leaders.map((l, i) => (
              <LeaderCard key={l.id || i} {...l} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 8 — TIMELINE ═════════════════════════════════════════ */}
      <section className="abt-section abt-bg-light abt-timeline-section">
        <div className="container">
          <div className="abt-section-header">
            <span className="abt-chip">Our Journey</span>
            <h2 className="abt-section-title-center">Milestones & Growth</h2>
            <p className="abt-section-desc">
              A decade of academic excellence, global expansion and scientific impact.
            </p>
          </div>
          <div className="abt-timeline">
            <div className="abt-timeline-spine" />
            {milestones.map((m, i) => (
              <div key={m.id || i} className={`abt-timeline-row abt-tl-${m.side || "left"}`}>
                <div className="abt-timeline-card">
                  <span className="abt-tl-year">{m.year}</span>
                  <h4>{m.title}</h4>
                  <p>{m.description}</p>
                </div>
                <div className="abt-timeline-dot" />
                <div className="abt-timeline-spacer" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 9 — ACADEMIC PARTNERS ═══════════════════════════════ */}
      <section className="abt-partners-strip">
        <div className="container">
          <p className="abt-partners-label">INDEXING ALIGNMENTS & PARTNER NETWORKS</p>
          <div className="abt-partners-flex">
            {partners.map((p, i) => (
              <div className="abt-partner-logo" key={p.id || i}>
                <SponsorLogo name={p.name} logoFileName={p.logoFileName} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 10 — CTA ═════════════════════════════════════════════ */}
      <section className="abt-section abt-cta">
        <div className="container">
          <div className="abt-cta-card">
            <div className="abt-cta-glow-1" />
            <div className="abt-cta-glow-2" />
            <span className="abt-chip abt-chip-white">Join Us</span>
            <h2 className="abt-cta-title">
              {section.ctaTitle}
            </h2>
            <p className="abt-cta-desc">
              {section.ctaDesc}
            </p>
            <div className="abt-cta-btns">
              {section.ctaButton1Text && (
                <button className="abt-cta-primary" onClick={() => navigate(section.ctaButton1Link || "/conferences")}>
                  {section.ctaButton1Text}
                </button>
              )}
              {section.ctaButton2Text && (
                <button className="abt-cta-secondary" onClick={() => navigate(section.ctaButton2Link || "/submit-abstract")}>
                  {section.ctaButton2Text}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;