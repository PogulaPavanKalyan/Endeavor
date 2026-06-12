import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
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

/* ─── Sponsor SVG Logos ─────────────────────────────────────────────────── */
const SponsorLogo = ({ name }) => {
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
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
  return <span className="abt-partner-text">{name}</span>;
};

/* ─── Leadership Card ───────────────────────────────────────────────────── */
const LeaderCard = ({ emoji, name, role, institution, country }) => (
  <div className="abt-leader-card">
    <div className="abt-leader-avatar">{emoji}</div>
    <div className="abt-leader-info">
      <h4>{name}</h4>
      <span className="abt-leader-role">{role}</span>
      <span className="abt-leader-institution">{institution}</span>
      <span className="abt-leader-country">🌐 {country}</span>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
function AboutPage() {
  const navigate = useNavigate();

  const leaders = [
    { emoji: "👩‍🔬", name: "Prof. Sarah Higgins", role: "Scientific Committee Chair", institution: "University of Oxford", country: "United Kingdom" },
    { emoji: "👨‍🏫", name: "Dr. Rajan Mehta", role: "Advisory Board Member", institution: "IIT Bombay", country: "India" },
    { emoji: "👩‍💼", name: "Prof. Maria Chen", role: "Publication Director", institution: "MIT Cambridge", country: "USA" },
    { emoji: "👨‍🔬", name: "Dr. Ahmed Al-Farsi", role: "Peer Review Lead", institution: "KAUST", country: "Saudi Arabia" },
    { emoji: "👩‍🏫", name: "Prof. Elena Vasquez", role: "Program Committee Head", institution: "University of Madrid", country: "Spain" },
    { emoji: "👨‍💻", name: "Dr. Lucas Hoffmann", role: "Technology & Innovation", institution: "TU Munich", country: "Germany" },
  ];

  const milestones = [
    { year: "2015", title: "Founded", desc: "Research Endeavor incorporated with a mission to bring global researchers together through high-impact academic events.", side: "left" },
    { year: "2017", title: "First International Conference", desc: "Hosted our inaugural international conference with delegates from 18 countries, establishing our commitment to quality.", side: "right" },
    { year: "2019", title: "Scopus Partnership", desc: "Established formal indexing agreements with Elsevier's Scopus, ensuring all proceedings reach global academic databases.", side: "left" },
    { year: "2021", title: "100+ Conferences Milestone", desc: "Crossed the landmark of 100 successfully organized conferences across three continents.", side: "right" },
    { year: "2023", title: "10,000+ Researcher Network", desc: "Built a thriving community of over 10,000 researchers, scientists and academicians across 50+ countries.", side: "left" },
    { year: "2026", title: "Global Vision 2030", desc: "Expanding to serve 200+ conferences annually and launch our open-access journal series.", side: "right" },
  ];

  return (
    <div className="abt-wrapper">
      <Header />

      {/* ══ SECTION 1 — HERO ══════════════════════════════════════════════ */}
      <section className="abt-hero">
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
              <span>About Research Endeavor</span>
            </div>

            {/* Main Heading */}
            <h1 className="abt-hero-title">
              Connecting Global<br />
              <span className="abt-hero-title-accent">Research Communities</span>
            </h1>

            {/* Description */}
            <p className="abt-hero-desc">
              Research Endeavor brings together researchers, academicians, industry experts and
              innovators through international conferences, publications and scientific networking
              across 50+ countries worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="abt-hero-btns">
              <button className="abt-btn-primary" onClick={() => navigate("/conferences")}>
                🏛️ Explore Conferences
              </button>
              <button className="abt-btn-secondary" onClick={() => navigate("/submit-abstract")}>
                Submit Abstract →
              </button>
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
                <strong className="abt-hero-stat-num">150+</strong>
                <span className="abt-hero-stat-label">Conferences</span>
                <span className="abt-hero-stat-sub">Internationally hosted</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">👩‍🔬</span>
                <strong className="abt-hero-stat-num">10,000+</strong>
                <span className="abt-hero-stat-label">Researchers</span>
                <span className="abt-hero-stat-sub">Active global network</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">🌍</span>
                <strong className="abt-hero-stat-num">50+</strong>
                <span className="abt-hero-stat-label">Countries</span>
                <span className="abt-hero-stat-sub">Worldwide representation</span>
              </div>
              <div className="abt-hero-stat-card">
                <span className="abt-hero-stat-icon">📖</span>
                <strong className="abt-hero-stat-num">500+</strong>
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
            <span className="abt-chip">Company Overview</span>
            <h2 className="abt-section-title">Who We Are</h2>
            <p className="abt-lead-text">
              Research Endeavor is a premier global platform designed specifically to connect
              researchers, scientists, academicians, and industry experts worldwide.
            </p>
            <p className="abt-body-text">
              We focus on building international communities by organizing double-blind peer-reviewed
              conferences, workshops, and dynamic webinars. Through strategic indexing relationships,
              we ensure the dissemination of accepted abstracts inside recognized global proceedings.
            </p>

            {/* Stats Row */}
            <div className="abt-stats-row">
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={150} suffix="+" /></strong>
                <span>Conferences</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={10000} suffix="+" /></strong>
                <span>Researchers</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={50} suffix="+" /></strong>
                <span>Countries</span>
              </div>
              <div className="abt-stat-divider" />
              <div className="abt-stat-item">
                <strong><AnimatedCounter end={500} suffix="+" /></strong>
                <span>Publications</span>
              </div>
            </div>

            <div className="abt-check-list">
              <div className="abt-check-row">
                <span className="abt-check-icon">✓</span>
                <div>
                  <strong>Global Dissemination</strong>
                  <span>Fast-tracking proceedings publication through Scopus channels.</span>
                </div>
              </div>
              <div className="abt-check-row">
                <span className="abt-check-icon">✓</span>
                <div>
                  <strong>Rigorous Peer Assessment</strong>
                  <span>Supervised by distinguished steering boards and domain committees.</span>
                </div>
              </div>
              <div className="abt-check-row">
                <span className="abt-check-icon">✓</span>
                <div>
                  <strong>International Recognition</strong>
                  <span>Indexed by Scopus, Web of Science, CrossRef, and Google Scholar.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image */}
          <div className="abt-who-right">
            <div className="abt-who-img-frame">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80"
                alt="International Research Conference"
                className="abt-who-img"
              />
              <div className="abt-who-img-secondary">
                <img
                  src="https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=500&q=80"
                  alt="Academic Networking"
                />
              </div>
              <div className="abt-who-float-badge">
                <span>🏆</span>
                <div>
                  <strong>Est. 2015</strong>
                  <span>10+ Years of Excellence</span>
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
              <h3>Our Mission</h3>
              <p>
                To empower the global research community by organizing high-impact international
                conferences and virtual assemblies. We facilitate knowledge exchange, ensure robust
                abstract vetting, and build stable bridges between pioneer researchers and index
                databases — making science accessible to all.
              </p>
              <ul className="abt-mv-points">
                <li>🔬 Peer-reviewed quality assurance</li>
                <li>🌍 Global researcher connectivity</li>
                <li>📖 Open-access publication pathways</li>
              </ul>
              <div className="abt-mv-bottom-bar abt-mv-bar-pink" />
            </div>

            <div className="abt-mv-card abt-mv-vision">
              <div className="abt-mv-icon">👁️</div>
              <h3>Our Vision</h3>
              <p>
                To lead as the world's most trusted scientific communication framework. We aim to
                accelerate the publication cycle of pioneering discoveries, making scientific findings
                accessible, discoverable, and impactful for global policy developers and innovators.
              </p>
              <ul className="abt-mv-points">
                <li>🚀 200+ annual conferences by 2030</li>
                <li>🤝 Cross-border research collaboration</li>
                <li>🏛️ Open-access journal series launch</li>
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
            <div className="abt-what-card">
              <div className="abt-what-icon-wrap">
                <span>🏛️</span>
              </div>
              <h3>International Conferences</h3>
              <p>
                Organize high-quality in-person, hybrid and virtual international conferences across
                all major scientific disciplines and engineering tracks.
              </p>
              <span className="abt-what-tag">150+ Events</span>
            </div>
            <div className="abt-what-card">
              <div className="abt-what-icon-wrap">
                <span>📖</span>
              </div>
              <h3>Research Publications</h3>
              <p>
                Fast-track publication of conference proceedings in globally recognized and indexed
                journals including Scopus, Web of Science and CrossRef.
              </p>
              <span className="abt-what-tag">500+ Papers</span>
            </div>
            <div className="abt-what-card">
              <div className="abt-what-icon-wrap">
                <span>💻</span>
              </div>
              <h3>Webinars & Workshops</h3>
              <p>
                Expert-led virtual webinars and intensive skill workshops bringing cutting-edge
                research insights directly to your screen from leading institutions.
              </p>
              <span className="abt-what-tag">200+ Sessions</span>
            </div>
            <div className="abt-what-card">
              <div className="abt-what-icon-wrap">
                <span>🤝</span>
              </div>
              <h3>Academic Networking</h3>
              <p>
                Connect with 10,000+ researchers, professors, scientists and industry leaders to
                discover collaboration opportunities and joint research programs.
              </p>
              <span className="abt-what-tag">10,000+ Members</span>
            </div>
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
            {[
              { icon: "🌐", title: "Global Reach", desc: "Connect with researchers and academics from 50+ countries across 6 continents at every event." },
              { icon: "✅", title: "Expert Review Process", desc: "Rigorous double-blind peer review by domain experts ensuring quality, integrity and academic standards." },
              { icon: "📚", title: "Publication Opportunities", desc: "Fast-track publication in Scopus, Web of Science, and CrossRef indexed journals and proceedings." },
              { icon: "🤝", title: "Industry Collaboration", desc: "Bridge academia and industry through strategic partnerships and innovation-focused symposiums." },
              { icon: "🏆", title: "Academic Excellence", desc: "Recognized internationally for maintaining the highest standards in conference organization and proceedings." },
              { icon: "🔬", title: "Scientific Innovation", desc: "Platform for cutting-edge discoveries across AI, healthcare, engineering, life sciences and more." },
            ].map((item, i) => (
              <div className="abt-why-card" key={i}>
                <span className="abt-why-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
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
              <strong><AnimatedCounter end={150} suffix="+" /></strong>
              <span>Conferences Hosted</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={10000} suffix="+" /></strong>
              <span>Researchers Connected</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={50} suffix="+" /></strong>
              <span>Countries Represented</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={500} suffix="+" /></strong>
              <span>Publications Indexed</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={200} suffix="+" /></strong>
              <span>Keynote Speakers</span>
            </div>
            <div className="abt-impact-stat">
              <strong><AnimatedCounter end={98} suffix="%" /></strong>
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
                <path d="M 185 155 Q 500 60 685 230" stroke="rgba(233,30,99,0.5)" strokeWidth="2" strokeDasharray="8 5" fill="none" />
                <path d="M 685 230 Q 900 160 820 165" stroke="rgba(233,30,99,0.35)" strokeWidth="1.5" strokeDasharray="6 5" fill="none" />
                <path d="M 510 135 Q 580 120 685 230" stroke="rgba(233,30,99,0.4)" strokeWidth="1.5" strokeDasharray="6 5" fill="none" />
                <path d="M 185 155 Q 340 250 265 280" stroke="rgba(233,30,99,0.25)" strokeWidth="1.5" strokeDasharray="6 5" fill="none" />

                {/* USA – San Jose */}
                <g>
                  <circle cx="185" cy="155" r="18" fill="rgba(233,30,99,0.15)" />
                  <circle cx="185" cy="155" r="10" fill="rgba(233,30,99,0.3)" />
                  <circle cx="185" cy="155" r="5" fill="#E91E63" />
                  <text x="185" y="138" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Poppins">San Jose, USA</text>
                </g>

                {/* India – Bangalore */}
                <g>
                  <circle cx="685" cy="230" r="18" fill="rgba(233,30,99,0.15)" />
                  <circle cx="685" cy="230" r="10" fill="rgba(233,30,99,0.3)" />
                  <circle cx="685" cy="230" r="5" fill="#E91E63" />
                  <text x="685" y="213" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="Poppins">Bangalore, India</text>
                </g>

                {/* Europe – London */}
                <g>
                  <circle cx="512" cy="125" r="12" fill="rgba(233,30,99,0.15)" />
                  <circle cx="512" cy="125" r="6" fill="rgba(233,30,99,0.3)" />
                  <circle cx="512" cy="125" r="3" fill="#E91E63" />
                  <text x="512" y="112" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Poppins">Europe</text>
                </g>

                {/* Asia Pacific */}
                <g>
                  <circle cx="820" cy="170" r="10" fill="rgba(233,30,99,0.15)" />
                  <circle cx="820" cy="170" r="5" fill="rgba(233,30,99,0.3)" />
                  <circle cx="820" cy="170" r="3" fill="#E91E63" />
                  <text x="820" y="157" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Poppins">Asia Pacific</text>
                </g>

                {/* Labels */}
                <text x="100" y="430" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="Poppins">© Research Endeavor – Global Presence</text>
              </svg>

              {/* Office badges over map */}
              <div className="abt-map-office abt-office-usa">
                <span>🏢</span>
                <div>
                  <strong>USA Office</strong>
                  <span>San Jose, California</span>
                </div>
              </div>
              <div className="abt-map-office abt-office-india">
                <span>🏢</span>
                <div>
                  <strong>India Office</strong>
                  <span>Bangalore, Karnataka</span>
                </div>
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
              <LeaderCard key={i} {...l} />
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
              <div key={i} className={`abt-timeline-row abt-tl-${m.side}`}>
                <div className="abt-timeline-card">
                  <span className="abt-tl-year">{m.year}</span>
                  <h4>{m.title}</h4>
                  <p>{m.desc}</p>
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
            {["IEEE", "Springer Nature", "Elsevier", "CrossRef", "Scopus", "Google Scholar"].map(n => (
              <div className="abt-partner-logo" key={n}><SponsorLogo name={n} /></div>
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
              Join the Global Research Community
            </h2>
            <p className="abt-cta-desc">
              Submit your abstract proposal to obtain rigorous peer reviews, expand your publication
              footprint, and network with distinguished scholars from 50+ countries.
            </p>
            <div className="abt-cta-btns">
              <button className="abt-cta-primary" onClick={() => navigate("/conferences")}>
                Explore Conferences
              </button>
              <button className="abt-cta-secondary" onClick={() => navigate("/submit-abstract")}>
                Submit Abstract
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