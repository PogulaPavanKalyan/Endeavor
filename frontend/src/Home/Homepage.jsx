import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api, BASE_URL } from "../utils/api";
import BrochureModal from "../components/BrochureModal";
import { getSubdomainUrl } from "../utils/subdomain.jsx";
import { fetchHero, fetchStatistics, fetchTrustBadges } from "../services/heroService";
import "./Homepage.css";

/* ─── Optimized Image with Fallback and Skeleton ────────────────────────── */
const OptimizedImage = ({ src, alt, className, fallbackType = "conference" }) => {
  const fallbacks = {
    conference: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
    research: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80"
  };

  const [imgSrc, setImgSrc] = useState(src || fallbacks[fallbackType]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [useUiFallback, setUseUiFallback] = useState(false);

  useEffect(() => {
    setImgSrc(src || fallbacks[fallbackType]);
    setLoading(true);
    setHasError(false);
    setUseUiFallback(false);
  }, [src, fallbackType]);

  const handleError = () => {
    if (imgSrc === fallbacks[fallbackType] || hasError) {
      console.error(`Image load failed for fallback URL or identical primary URL: ${imgSrc}. Using pure UI CSS fallback.`);
      setUseUiFallback(true);
      setLoading(false);
    } else {
      console.error(`Primary image load failed for URL: ${imgSrc}. Trying fallback URL.`);
      setImgSrc(fallbacks[fallbackType]);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", display: "block" }}>
      {loading && (
        <div
          className="skeleton"
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)",
            backgroundSize: "200% 100%",
            zIndex: 2
          }}
        />
      )}
      {useUiFallback ? (
        <div
          className={className}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)",
            color: "#64748B",
            padding: "16px",
            textAlign: "center",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxSizing: "border-box"
          }}
        >
          <span style={{ fontSize: "28px", marginBottom: "6px" }}>
            {fallbackType === "avatar" ? "👤" : fallbackType === "research" ? "🔬" : "🏛️"}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "600", opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {alt || "Intelevo Research"}
          </span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt || "Image"}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: loading ? 0 : 1,
            transition: "opacity 0.3s ease"
          }}
        />
      )}
    </div>
  );
};

/* Helper to dynamically parse descriptive texts into icon cards if they contain colon-separated lists */
const parseTextToHighlightCards = (text) => {
  if (!text) return null;
  if (text.includes(":") && (text.match(/:/g) || []).length >= 2) {
    const matches = [...text.matchAll(/([A-Z][a-zA-Z\s]+):/g)];
    if (matches.length >= 2) {
      const cards = [];
      let leadText = "";

      const firstMatchIndex = matches[0].index;
      leadText = text.substring(0, firstMatchIndex).trim();

      for (let i = 0; i < matches.length; i++) {
        const currentMatch = matches[i];
        const nextMatch = matches[i + 1];

        const title = currentMatch[1].trim();
        const startIdx = currentMatch.index + currentMatch[0].length;
        const endIdx = nextMatch ? nextMatch.index : text.length;

        let desc = text.substring(startIdx, endIdx).trim();
        desc = desc.replace(/[.;,\s]+$/, "").trim();

        if (title && desc) {
          let emoji = "⚙️";
          const lowerTitle = title.toLowerCase();
          if (lowerTitle.includes("conference")) emoji = "🏛️";
          else if (lowerTitle.includes("webinar")) emoji = "💻";
          else if (lowerTitle.includes("workshop")) emoji = "🛠️";
          else if (lowerTitle.includes("exhibition")) emoji = "🖼️";
          else if (lowerTitle.includes("publication") || lowerTitle.includes("journal")) emoji = "📖";
          else if (lowerTitle.includes("peer") || lowerTitle.includes("review")) emoji = "🔬";
          else if (lowerTitle.includes("global") || lowerTitle.includes("network")) emoji = "🤝";

          cards.push({ emoji, title, desc });
        }
      }
      return { leadText, cards };
    }
  }
  return null;
};

/* ─── Animated Counter ────────────────────────────────────────────────────── */
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStarted(true);
      else { setStarted(false); setCount(0); }
    }, { threshold: 0.1 });
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

/* ─── Hero Visual — Redesigned 3-Image Offset Collage with 4 Stats ─────────── */
const HeroVisual = ({ stats }) => {
  const mainImage = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";
  const secondImage = "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80";
  const thirdImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80";

  return (
    <div className="hero-collage-wrap">
      <div className="collage-glow-bg" />
      <div className="collage-container">
        {/* Main image */}
        <div className="collage-card card-main">
          <OptimizedImage
            src={mainImage}
            alt="International Scientific Congress"
            fallbackType="conference"
          />
          <div className="collage-card-overlay" />
        </div>

        {/* Second image - top right */}
        <div className="collage-card card-sub-top">
          <OptimizedImage
            src={secondImage}
            alt="Scientific Presentation"
            fallbackType="conference"
          />
          <div className="collage-card-overlay" />
        </div>

        {/* Third image - bottom left */}
        <div className="collage-card card-sub-bottom">
          <OptimizedImage
            src={thirdImage}
            alt="Research Collaboration"
            fallbackType="research"
          />
          <div className="collage-card-overlay" />
        </div>

        {/* Floating glassmorphic cards inside container - 4 Statistics */}
        <div className="glass-metric-card metric-1 animate-float-slow">
          <span className="metric-icon">🎤</span>
          <div className="metric-body">
            <strong>{(stats?.conferencesCount ?? 150).toLocaleString()}+</strong>
            <span>Conferences</span>
          </div>
        </div>

        <div className="glass-metric-card metric-2 animate-float-mid">
          <span className="metric-icon">🌍</span>
          <div className="metric-body">
            <strong>{(stats?.countriesCount ?? 50).toLocaleString()}+</strong>
            <span>Countries</span>
          </div>
        </div>

        <div className="glass-metric-card metric-3 animate-float-fast">
          <span className="metric-icon">👩‍🔬</span>
          <div className="metric-body">
            <strong>{(stats?.researchersCount ?? 10000).toLocaleString()}+</strong>
            <span>Researchers</span>
          </div>
        </div>

        <div className="glass-metric-card metric-4 animate-float-slow">
          <span className="metric-icon">📖</span>
          <div className="metric-body">
            <strong>{(stats?.publicationsCount ?? 500).toLocaleString()}+</strong>
            <span>Publications</span>
          </div>
        </div>
      </div>

      {/* Decorative ring */}
      <div className="hero-visual-ring" />
    </div>
  );
};

/* ─── Skeleton loader (UNTOUCHED) ─────────────────────────────────────────── */
const HeroSkeleton = () => (
  <section className="hero-section hero-skeleton">
    <div className="hero-inner">
      <div className="hero-left">
        <div className="skeleton skeleton-badge" />
        <div className="skeleton skeleton-h1" />
        <div className="skeleton skeleton-h1 short" />
        <div className="skeleton skeleton-p" />
        <div className="skeleton skeleton-p short" />
        <div className="skeleton-btns">
          <div className="skeleton skeleton-btn" />
          <div className="skeleton skeleton-btn" />
        </div>
      </div>
      <div className="hero-right"><div className="skeleton skeleton-illus" /></div>
    </div>
  </section>
);

/* ─── Sponsor Crisp Vector SVG Logo ───────────────────────────────────────── */
const SponsorLogo = ({ name }) => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normalized.includes("ieee")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="800" fontFamily="Inter, system-ui">IEEE</text>
      </svg>
    );
  }
  if (normalized.includes("springer")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <circle cx="45" cy="30" r="10" fill="#E91E63" />
        <text x="70" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Springer</text>
      </svg>
    );
  }
  if (normalized.includes("elsevier")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <path d="M40 42 L48 18 L56 42 Z" fill="#0F172A" />
        <circle cx="48" cy="24" r="4" fill="#E91E63" />
        <text x="75" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Elsevier</text>
      </svg>
    );
  }
  if (normalized.includes("googlescholar") || normalized.includes("google")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <path d="M45 20 L30 28 L45 36 L60 28 Z" fill="#E91E63" />
        <path d="M45 36 L45 44" stroke="#0F172A" strokeWidth="3" />
        <text x="75" y="36" fill="#0F172A" fontSize="15" fontWeight="800" fontFamily="Inter, system-ui">Scholar</text>
      </svg>
    );
  }
  if (normalized.includes("crossref")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <circle cx="40" cy="30" r="10" stroke="#E91E63" strokeWidth="4" fill="none" />
        <text x="65" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">CrossRef</text>
      </svg>
    );
  }
  if (normalized.includes("scopus")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <rect x="30" y="20" width="25" height="20" rx="4" fill="#0F172A" />
        <text x="70" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Scopus</text>
      </svg>
    );
  }
  if (normalized.includes("webofscience") || normalized.includes("science")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1" />
        <polygon points="45,18 55,38 35,38" fill="#E91E63" />
        <text x="70" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">WoS</text>
      </svg>
    );
  }

  return (
    <div className="fallback-sponsor-logo-badge">
      <span className="fallback-sponsor-text">{name}</span>
    </div>
  );
};

/* ─── Fallback badge icons ────────────────────────────────────────────────── */
const FALLBACK_BADGES = [
  { id: 1, icon: "🔬", title: "Scopus Indexed", description: "All proceedings indexed in major global databases" },
  { id: 2, icon: "✅", title: "Peer Reviewed", description: "Rigorous double-blind review by domain experts" },
  { id: 3, icon: "🌐", title: "Global Networking", description: "Connect with researchers from 50+ countries" },
  { id: 4, icon: "📚", title: "Publication Opportunities", description: "Fast-track publication in indexed journals" },
];

/* ─── Fallbacks for Dynamic Content ───────────────────────────────────────── */
const FALLBACK_ABOUT = {
  title: "Empowering Global Scientific Discovery",
  tag: "About Organization",
  description: "Intelevo Research acts as a pivotal axis connecting international experts, ideas, and publication pathways.",
  pillars: [
    { icon: "👤", title: "Who We Are", desc: "Intelevo Research brings together academicians, researchers, and engineers worldwide to exchange discoveries." },
    { icon: "🎯", title: "What We Do", desc: "We build communities through high-quality international meetings, workshops, virtual webinars, and proceedings." },
    { icon: "💡", title: "Why Choose Us", desc: "Exceptional global networking, robust abstract review, and guaranteed distribution through indexed media channels." }
  ],
  tabs: {
    about: {
      title: "About Company",
      text: "Intelevo Research is the scientific perseverance and so is the learning. Scientific Events are not just limited to discussion, but to connect people with people, people with ideas, and people with opportunities. Intelevo Research is one of the innovative organizers of webinars, conferences, workshops and exhibitions.",
      images: [
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80"
      ]
    }
  }
};

const FALLBACK_CATEGORIES = [
  { icon: "🤖", label: "AI & Machine Learning", desc: "Artificial intelligence architectures, networks, and neural compute paradigms.", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" },
  { icon: "🏥", label: "Healthcare & Medicine", desc: "Biomedical engineering breakthroughs, diagnostics, and modern healthcare.", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80" }
];

const FALLBACK_PAST_CONFERENCES = [
  { id: "past-1", title: "2nd International Conference on Food Science & Nutrition", date: "July 12 to July 14, 2025", venue: "Paris, France", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80", attendees: "350+ Scholars", countries: "32 represented" }
];

const FALLBACK_TIMELINE = {
  day1: [
    { id: 101, name: "Registration, Credentials Collection & Welcome Coffee", timeRange: "08:30 AM - 09:30 AM", speakerName: "Steering Committee", affiliation: "Intelevo Research Board", description: "Attendees sign in and collect validation badges, folders, and conference catalogs." }
  ]
};

const FALLBACK_COMMITTEE = [
  { name: "Prof. Sarah Higgins", role: "Scientific Committee Chair", institution: "University of Oxford", country: "UK", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80" }
];

const FALLBACK_PUBLICATIONS = [
  { title: "Scopus Proceedings", description: "Proceedings volumes carrying standard ISBN numbers and DOI links, submitted for full Scopus indexing.", image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80", type: "regular" }
];

const FALLBACK_JOURNALS = [
  { name: "International Journal of Food Sciences", publisher: "Intelevo Research Publications", impact: "4.8", issn: "ISSN 2643-9821", indexing: "Scopus, Web of Science, Google Scholar" }
];

const FALLBACK_WEBINARS = [
  { id: 1, title: "AI & Machine Learning in Healthcare", speaker: "Dr. Sarah Lee (MIT)", date: "Jun 25, 2026", time: "14:00 GMT", status: "upcoming", image: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=600&q=80", desc: "Explore the diagnostic capabilities of advanced deep neural models." }
];

const FALLBACK_RESEARCH = [
  { icon: "🧬", label: "Genetics & Bio-Tech", desc: "Protein linkage mapping and genomic editing models.", image: "https://images.unsplash.com/photo-1530026405186-ed1ea0007b2c?auto=format&fit=crop&w=600&q=80", tracks: ["CRISPR Cas-9 Models"] }
];

const FALLBACK_GALLERY = [
  { url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80", tag: "auditorium" }
];

const FALLBACK_NEWS = [
  { title: "Special Abstract Submission Deadline Extended", category: "Deadlines", date: "June 10, 2026", summary: "Cutoff extended for oral presentations.", image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80" }
];

const FALLBACK_CFP = {
  title: "Share Your Innovations Internationally",
  badge: "Call For Abstracts 2026",
  description: "Submitting your proposal to Intelevo Research is streamlined. Authors upload word/pdf drafts.",
  image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80"
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  HOMEPAGE COMPONENT                                                        */
/* ══════════════════════════════════════════════════════════════════════════ */
const Homepage = () => {
  const navigate = useNavigate();
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);

  // Dynamic data states from REST APIs
  const [heroData, setHeroData] = useState(null);
  const [heroLoading, setHeroLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [speakersList, setSpeakersList] = useState([]);
  const [sponsorsList, setSponsorsList] = useState([]);

  // Consolidated Dynamic content state
  const [aboutData, setAboutData] = useState(FALLBACK_ABOUT);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [pastConferences, setPastConferences] = useState(FALLBACK_PAST_CONFERENCES);
  const [timelineData, setTimelineData] = useState(FALLBACK_TIMELINE);
  const [committeeMembers, setCommitteeMembers] = useState(FALLBACK_COMMITTEE);
  const [publicationPathways, setPublicationPathways] = useState(FALLBACK_PUBLICATIONS);
  const [journals, setJournals] = useState(FALLBACK_JOURNALS);
  const [webinars, setWebinars] = useState(FALLBACK_WEBINARS);
  const [researchAreas, setResearchAreas] = useState(FALLBACK_RESEARCH);
  const [galleryPhotos, setGalleryPhotos] = useState(FALLBACK_GALLERY);
  const [newsArticles, setNewsArticles] = useState(FALLBACK_NEWS);
  const [callForAbstracts, setCallForAbstracts] = useState(FALLBACK_CFP);

  // Dynamic Layout control states
  const [aboutActiveTab, setAboutActiveTab] = useState("about");
  const [webinarFilter, setWebinarFilter] = useState("all");
  const [galleryActiveTag, setGalleryActiveTag] = useState("all");
  const [timelineActiveDay, setTimelineActiveDay] = useState("day1");
  const [committeeActiveTab, setCommitteeActiveTab] = useState("keynotes");

  // Admin detection & gallery visibility from database
  const isAdmin = !!localStorage.getItem("token");
  const galleryVisible = stats?.galleryVisible !== false;
  const pastCongressVisible = stats?.pastCongressVisible !== false;
  const webinarsVisible = stats?.webinarsVisible !== false;

  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });


  // Scroll ref for upcoming conferences strip
  const confRef = useRef(null);

  const galleryRef = useRef(null);
  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      galleryRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  /* ── Fetch dynamic content configuration on mount ── */
  useEffect(() => {
    api.get("/api/homepage-dynamic-data").then(res => {
      if (res) {
        if (res.about) setAboutData(res.about);
        if (res.categories) setCategories(res.categories);
        if (res.pastConferences) setPastConferences(res.pastConferences);
        if (res.timeline) setTimelineData(res.timeline);
        if (res.committee) setCommitteeMembers(res.committee);
        if (res.publications) setPublicationPathways(res.publications);
        if (res.journals) setJournals(res.journals);
        if (res.webinars) setWebinars(res.webinars);
        if (res.researchAreas) setResearchAreas(res.researchAreas);
        if (res.gallery) setGalleryPhotos(res.gallery);
        if (res.news) setNewsArticles(res.news);
        if (res.callForAbstracts) setCallForAbstracts(res.callForAbstracts);
      }
    }).catch(err => console.error("Failed to fetch homepage dynamic content:", err));
  }, []);

  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;

    let autoScrollInterval = null;
    let isInteracting = false;
    let userTimeout = null;

    const updateCardTransforms = () => {
      if (window.innerWidth > 768) {
        const cards = container.querySelectorAll(".gallery-img-holder-expanded");
        cards.forEach((card) => {
          card.style.transform = "";
          card.style.opacity = "";
          card.style.transition = "";
        });
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;
      const cards = container.querySelectorAll(".gallery-img-holder-expanded");

      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = cardCenter - containerCenter;

        // Normalize distance based on half-width of container
        const normalizedDistance = distance / (containerRect.width / 2 || 1);
        const clampedDistance = Math.max(-1.5, Math.min(1.5, normalizedDistance));

        // Scale: shrink slightly as card moves away from center
        const scale = 1 - Math.abs(clampedDistance) * 0.12;

        // Rotation: 3D coverflow style rotation
        const rotateY = clampedDistance * -15;

        // Translation: translateY pushes down at edges to create a downward scroll curve
        const translateY = Math.abs(clampedDistance) * Math.abs(clampedDistance) * 15;

        // Opacity: fade out slightly towards the edges
        const opacity = 1 - Math.abs(clampedDistance) * 0.25;

        card.style.transform = `perspective(800px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`;
        card.style.opacity = opacity;
        card.style.transition = "transform 0.1s ease-out, opacity 0.1s ease-out";
      });
    };

    const startAutoScroll = () => {
      if (window.innerWidth > 768) return;
      stopAutoScroll();
      autoScrollInterval = setInterval(() => {
        if (isInteracting) return;

        const cards = container.querySelectorAll(".gallery-img-holder-expanded");
        if (cards.length <= 1) return;

        const cardRect = cards[0].getBoundingClientRect();
        const cardWidth = cardRect.width + 16; // card width + gap
        const currentScroll = container.scrollLeft;
        const totalWidth = container.scrollWidth;
        const maxScroll = totalWidth - container.clientWidth;

        let nextScroll = currentScroll + cardWidth;
        // If we reach the end, wrap back to the beginning
        if (nextScroll >= maxScroll + 10) {
          nextScroll = 0;
        }

        container.scrollTo({
          left: nextScroll,
          behavior: "smooth"
        });
      }, 3000);
    };

    const stopAutoScroll = () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
      }
    };

    const handleInteraction = () => {
      isInteracting = true;
      stopAutoScroll();
      clearTimeout(userTimeout);
      userTimeout = setTimeout(() => {
        isInteracting = false;
        startAutoScroll();
      }, 5000); // Resume auto scroll after 5 seconds of inactivity
    };

    // Trigger initial calculations
    const timer = setTimeout(updateCardTransforms, 100);

    container.addEventListener("scroll", updateCardTransforms);
    container.addEventListener("touchstart", handleInteraction, { passive: true });
    container.addEventListener("mousedown", handleInteraction);
    window.addEventListener("resize", updateCardTransforms);

    startAutoScroll();

    return () => {
      clearTimeout(timer);
      clearTimeout(userTimeout);
      stopAutoScroll();
      if (container) {
        container.removeEventListener("scroll", updateCardTransforms);
        container.removeEventListener("touchstart", handleInteraction);
        container.removeEventListener("mousedown", handleInteraction);
      }
      window.removeEventListener("resize", updateCardTransforms);
    };
  }, [galleryPhotos]);

  /* ── Fetch hero, stats, badges in parallel ── */
  useEffect(() => {
    const load = async () => {
      setHeroLoading(true);
      const [heroRes, statsRes, badgesRes] = await Promise.all([
        fetchHero(),
        fetchStatistics(),
        fetchTrustBadges(),
      ]);
      setHeroData(heroRes);
      setStats(statsRes);
      setBadges(badgesRes.length > 0 ? badgesRes : FALLBACK_BADGES);
      setHeroLoading(false);
    };
    load();
  }, []);

  /* ── Fetch conferences ── */
  useEffect(() => {
    api.get("/api/conferences").then(data => {
      if (data && Array.isArray(data)) {
        setConferences(data.map(conf => ({
          id: conf.slug || `conf-${conf.id}`,
          dbId: conf.id,
          title: conf.title || conf.tittle,
          date: `${conf.startDate} to ${conf.endDate}`,
          venue: conf.venue,
          image: conf.photo?.filePath && conf.photo.filePath.startsWith("http")
            ? conf.photo.filePath
            : (conf.photo?.fileName ? `/uploads/conference/${conf.photo.fileName}` : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"),
          subdomain: conf.slug,
        })));
      }
    }).catch(err => console.error("Conferences fetch error:", err));
  }, []);

  /* ── Fetch speakers ── */
  useEffect(() => {
    api.get("/api/speakers").then(data => {
      if (data && Array.isArray(data) && data.length > 0) {
        setSpeakersList(data);
      }
    }).catch(err => console.error("Speakers fetch error:", err));
  }, []);

  /* ── Fetch sponsors ── */
  useEffect(() => {
    api.get("/api/sponsors").then(data => {
      if (data && Array.isArray(data)) {
        setSponsorsList(data);
      }
    }).catch(err => console.error("Sponsors fetch error:", err));
  }, []);

  /* ── Auto-scroll conference strip ── */
  useEffect(() => {
    const el = confRef.current;
    if (!el) return;
    let dir = 1;
    const id = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;
      if (el.scrollLeft >= max - 1) dir = -1;
      else if (el.scrollLeft <= 0) dir = 1;
      el.scrollLeft += dir * 1;
    }, 30);
    return () => clearInterval(id);
  }, [conferences]);

  /* ── Handle Contact Submit ── */
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError("");
    setContactSuccess(false);
    try {
      await api.post("/api/contact", contactForm);
      setContactSuccess(true);
      setContactForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      setContactError("Failed to transmit message. Please attempt later.");
    } finally {
      setContactLoading(false);
    }
  };


  /* ── Hero background style ── */
  const heroBgStyle = heroData?.backgroundImageUrl
    ? { backgroundImage: `url(${heroData.backgroundImageUrl})` }
    : {};
  const hasHeroBg = !!heroData?.backgroundImageUrl;

  const filteredWebinars = webinarFilter === "all"
    ? webinars
    : webinars.filter(w => w.status === webinarFilter);

  const filteredGallery = galleryActiveTag === "all"
    ? galleryPhotos
    : galleryPhotos.filter(photo => photo.tag === galleryActiveTag);

  const activeAboutTabs = aboutData?.tabs || FALLBACK_ABOUT.tabs;
  const currentTabContent = activeAboutTabs[aboutActiveTab] || activeAboutTabs[Object.keys(activeAboutTabs)[0]];

  return (
    <div className="homepage-redesign-wrapper">
      {/* 1. NAVBAR (UNTOUCHED) */}
      <Header />

      {/* 2. HERO SECTION REDESIGN */}
      {heroLoading ? <HeroSkeleton /> : (
        <section className="hero-section hero-premium-light">
          {/* Subtle Ambient Background Glow Bubbles */}
          <div className="hero-light-glow blue-glow" />
          <div className="hero-light-glow pink-glow" />

          <div className="hero-inner container">
            {/* Left Column: Text Content */}
            <div className="hero-left animate-fade-in-left">
              <div className="hero-content-wrapper">
                {/* Top Badge */}
                <span className="hero-badge-redesign">
                  🌐 Global Scientific Conferences 2026
                </span>

                {/* Headline */}
                <h1 className="hero-title">
                  {heroData?.title || "Advancing Global Research Through Innovation"}
                </h1>

                {/* Description */}
                <p className="hero-desc">
                  {heroData?.description || "Join researchers, scientists, and industry leaders from 50+ countries to share knowledge, publish innovations and build global partnerships."}
                </p>

                {/* Action Buttons (Removed) */}
                <div className="hero-cta-buttons">
                </div>
              </div>
            </div>

            {/* Right Column: 3-Image Collage */}
            <div className="hero-right animate-fade-in-right">
              <div className="hero-collage-wrap">
                <div className="collage-container">
                  {/* Main image */}
                  <div className="collage-card card-main">
                    <OptimizedImage
                      src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80"
                      alt="International Scientific Congress"
                      fallbackType="conference"
                    />
                    <div className="collage-card-overlay" />
                  </div>

                  {/* Second image - top right */}
                  <div className="collage-card card-sub-top">
                    <OptimizedImage
                      src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=400&q=80"
                      alt="Scientific Presentation"
                      fallbackType="conference"
                    />
                    <div className="collage-card-overlay" />
                  </div>

                  {/* Third image - bottom left */}
                  <div className="collage-card card-sub-bottom">
                    <OptimizedImage
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
                      alt="Research Collaboration"
                      fallbackType="research"
                    />
                    <div className="collage-card-overlay" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. UPCOMING CONFERENCES (REDESIGNED & DYNAMIC) */}
      <section className="section upcoming-conferences-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Conferences</span>
            <h2 className="section-title">Upcoming Global Congresses 2026</h2>
            <p className="section-desc">
              Participate as a presenter or delegate at our upcoming summits.
            </p>
          </div>
          <div className="upcoming-strip-wrap" ref={confRef}>
            {conferences.map((item) => (
              <div className="upcoming-conf-card card-premium" key={item.id}>
                <div className="card-media">
                  <span className="status-badge-active">Open Registration</span>
                  <OptimizedImage src={item.image} alt={item.title} fallbackType="conference" />
                </div>
                <div className="card-details">
                  <h3>{item.title}</h3>
                  <p className="conf-meta">📅 {item.date}</p>
                  <p className="conf-meta">📍 {item.venue}</p>
                  <a
                    href={getSubdomainUrl(item.subdomain || item.dbId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-view-conf"
                  >
                    View Program &rarr;
                  </a>
                </div>
              </div>
            ))}
            {conferences.length === 0 && (
              <p className="empty-state">No upcoming conferences listed. Please verify later.</p>
            )}
          </div>
        </div>
      </section>

      {/* 6. PAST CONFERENCES (REDESIGNED & DYNAMIC) */}
      {pastCongressVisible && (
        <section className="section past-conferences-redesign">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Success Footprint</span>
              <h2 className="section-title">Past Congress Editions</h2>
              <p className="section-desc">
                Review our global academic reach and previously held symposium volumes.
              </p>
            </div>
            <div className="past-conferences-grid">
              {pastConferences.map((item) => (
                <div className="past-conf-card card-premium" key={item.id}>
                  <div className="past-card-media">
                    <span className="past-year-badge">2025</span>
                    <OptimizedImage src={item.image} alt={item.title} fallbackType="conference" />
                  </div>
                  <div className="past-card-body">
                    <h3>{item.title}</h3>
                    <div className="past-metadata">
                      <span>📍 {item.venue}</span>
                      <span>👥 {item.attendees}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 14. WEBINAR SECTION (REDESIGNED & DYNAMIC) */}
      {webinarsVisible && (
        <section className="section webinars-redesign">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">E-Learning</span>
              <h2 className="section-title">Virtual Lectures & Webinars</h2>
              <p className="section-desc">
                Join online expert-led research discussions and live scientific assemblies.
              </p>
            </div>
            <div className="webinar-filter-bar">
              {["all", "live", "upcoming"].map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${webinarFilter === cat ? "active" : ""}`}
                  onClick={() => setWebinarFilter(cat)}
                >
                  {cat.toUpperCase()} WEBINARS
                </button>
              ))}
            </div>
            <div className="webinars-grid-redesign">
              {filteredWebinars.map((web) => (
                <div className={`webinar-card-redesign card-premium ${web.status}`} key={web.id}>
                  <div className="w-media">
                    <OptimizedImage src={web.image} alt={web.title} fallbackType="conference" />
                    <span className={`w-status-pill ${web.status}`}>{web.status.toUpperCase()}</span>
                  </div>
                  <div className="w-body">
                    <h3>{web.title}</h3>
                    <p className="w-speaker">🎙️ Speaker: {web.speaker}</p>
                    <p className="w-desc">{web.desc}</p>
                    <div className="w-footer-meta">
                      <span>📅 {web.date}</span>
                      <span>⏰ {web.time}</span>
                    </div>
                    <div className="w-actions">
                      {web.status === "live" ? (
                        <button className="btn-join-broadcast" onClick={() => navigate("/webinars")}>Join Broadcast</button>
                      ) : (
                        <button className="btn-reserve-seat" onClick={() => navigate("/webinars")}>Reserve Seat</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. ABOUT ORGANIZATION — PREMIUM 2026 REDESIGN */}
      <section className="section about-org-redesign">
        <div className="container">

          {/* ── Top Row: Two-column layout ── */}
          <div className="about-two-col">

            {/* Left Column: Content */}
            <div className="about-left-col">
              <span className="section-tag">{aboutData?.tag || "About Organization"}</span>
              <h2 className="about-main-heading">
                {aboutData?.title || "Empowering Global Scientific Discovery"}
              </h2>
              <p className="about-lead-para">
                {aboutData?.description || "Intelevo Research acts as a pivotal axis connecting international experts, ideas, and publication pathways across 50+ countries."}
              </p>

              {/* 4 Service Highlight Cards – 2×2 grid */}
              <div className="about-service-grid">
                {(aboutData?.pillars || FALLBACK_ABOUT.pillars).slice(0, 4).map((pillar, i) => (
                  <div className="about-svc-card" key={i}>
                    <span className="about-svc-icon">{pillar.icon}</span>
                    <div className="about-svc-body">
                      <h4>{pillar.title}</h4>
                      <p>{pillar.desc}</p>
                    </div>
                  </div>
                ))}
                {/* Extra static cards if API only returns 3 */}
                {(aboutData?.pillars || FALLBACK_ABOUT.pillars).length < 4 && (
                  <div className="about-svc-card">
                    <span className="about-svc-icon">📖</span>
                    <div className="about-svc-body">
                      <h4>Publication Support</h4>
                      <p>Fast-track proceedings published in Scopus, Web of Science indexed journals.</p>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/about" className="btn-about-learn">
                Discover Our Mission →
              </Link>
            </div>

            {/* Right Column: Large premium photo + floating glass badge */}
            <div className="about-right-col">
              <div className="about-photo-frame">
                <div className="about-photo-main">
                  <OptimizedImage
                    src={
                      (aboutData?.tabs?.about?.images?.[0]) ||
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80"
                    }
                    alt="International Research Conference"
                    fallbackType="conference"
                  />
                </div>
                <div className="about-photo-secondary">
                  <OptimizedImage
                    src={
                      (aboutData?.tabs?.about?.images?.[1]) ||
                      "https://images.unsplash.com/photo-1560439514-4e9645039924?auto=format&fit=crop&w=600&q=80"
                    }
                    alt="Workshop & Networking"
                    fallbackType="conference"
                  />
                </div>

                {/* Floating glassmorphism badge */}
                <div className="about-float-badge">
                  <span className="float-badge-icon">🏆</span>
                  <div className="float-badge-body">
                    <strong>Est. 2015</strong>
                    <span>10+ Years of Excellence</span>
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="about-float-stat">
                  <span className="float-stat-num">50+</span>
                  <span className="float-stat-lbl">Countries</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      {/* 19. GALLERY (REDESIGNED & DYNAMIC) */}
      {galleryVisible && (
        <section className="section gallery-redesign" style={{ position: "relative" }}>
          <div>
            <div className="container">
              <div className="section-header">
                <span className="section-tag">Visual Timeline</span>
                <h2 className="section-title">Large Congress Gallery Section</h2>
                <p className="section-desc">
                  Visual records representing collaborative discussions, presentations, and award dinners.
                </p>
              </div>
              <div className="gallery-filter-bar">
                {["all", "auditorium", "networking", "awards"].map((tag) => (
                  <button
                    key={tag}
                    className={`gallery-filter-btn ${galleryActiveTag === tag ? "active" : ""}`}
                    onClick={() => setGalleryActiveTag(tag)}
                  >
                    {tag.toUpperCase()} PHOTOS
                  </button>
                ))}
              </div>
              <div className="gallery-slider-wrapper">
                <button className="gallery-nav-btn prev" onClick={() => scrollGallery("left")} aria-label="Previous Image">
                  ‹
                </button>
                <div className="gallery-grid-redesign-expanded" ref={galleryRef}>
                  {filteredGallery.map((photo, i) => (
                    <div className="gallery-img-holder-expanded card-premium" key={i}>
                      <OptimizedImage src={photo.url} alt={`Congress moment ${photo.tag} ${i + 1}`} fallbackType="conference" />
                      <span className="gallery-tag-label">{photo.tag.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
                <button className="gallery-nav-btn next" onClick={() => scrollGallery("right")} aria-label="Next Image">
                  ›
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 23. FOOTER (UNTOUCHED) */}
      <Footer />
    </div>);
};

export default Homepage;