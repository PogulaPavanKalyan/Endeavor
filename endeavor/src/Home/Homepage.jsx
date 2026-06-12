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
            {alt || "Endeavor"}
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
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#0F172A" fontSize="24" fontWeight="800" fontFamily="Inter, system-ui">IEEE</text>
      </svg>
    );
  }
  if (normalized.includes("springer")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <circle cx="45" cy="30" r="10" fill="#E91E63"/>
        <text x="70" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Springer</text>
      </svg>
    );
  }
  if (normalized.includes("elsevier")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <path d="M40 42 L48 18 L56 42 Z" fill="#0F172A"/>
        <circle cx="48" cy="24" r="4" fill="#E91E63"/>
        <text x="75" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Elsevier</text>
      </svg>
    );
  }
  if (normalized.includes("googlescholar") || normalized.includes("google")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <path d="M45 20 L30 28 L45 36 L60 28 Z" fill="#E91E63"/>
        <path d="M45 36 L45 44" stroke="#0F172A" strokeWidth="3"/>
        <text x="75" y="36" fill="#0F172A" fontSize="15" fontWeight="800" fontFamily="Inter, system-ui">Scholar</text>
      </svg>
    );
  }
  if (normalized.includes("crossref")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <circle cx="40" cy="30" r="10" stroke="#E91E63" strokeWidth="4" fill="none"/>
        <text x="65" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">CrossRef</text>
      </svg>
    );
  }
  if (normalized.includes("scopus")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <rect x="30" y="20" width="25" height="20" rx="4" fill="#0F172A"/>
        <text x="70" y="36" fill="#0F172A" fontSize="16" fontWeight="800" fontFamily="Inter, system-ui">Scopus</text>
      </svg>
    );
  }
  if (normalized.includes("webofscience") || normalized.includes("science")) {
    return (
      <svg className="sponsor-svg-logo" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" rx="16" fill="#F8FAFC" stroke="rgba(15, 23, 42, 0.06)" strokeWidth="1"/>
        <polygon points="45,18 55,38 35,38" fill="#E91E63"/>
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
  description: "Research Endeavor acts as a pivotal axis connecting international experts, ideas, and publication pathways.",
  pillars: [
    { icon: "👤", title: "Who We Are", desc: "Endeavor Conferences brings together academicians, researchers, and engineers worldwide to exchange discoveries." },
    { icon: "🎯", title: "What We Do", desc: "We build communities through high-quality international meetings, workshops, virtual webinars, and proceedings." },
    { icon: "💡", title: "Why Choose Us", desc: "Exceptional global networking, robust abstract review, and guaranteed distribution through indexed media channels." }
  ],
  tabs: {
    about: {
      title: "About Company",
      text: "Research Endeavor is the scientific perseverance and so is the learning. Scientific Events are not just limited to discussion, but to connect people with people, people with ideas, and people with opportunities. Endeavor Research is one of the innovative organizers of webinars, conferences, workshops and exhibitions.",
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
    { id: 101, name: "Registration, Credentials Collection & Welcome Coffee", timeRange: "08:30 AM - 09:30 AM", speakerName: "Steering Committee", affiliation: "Endeavor Board", description: "Attendees sign in and collect validation badges, folders, and conference catalogs." }
  ]
};

const FALLBACK_COMMITTEE = [
  { name: "Prof. Sarah Higgins", role: "Scientific Committee Chair", institution: "University of Oxford", country: "UK", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80" }
];

const FALLBACK_PUBLICATIONS = [
  { title: "Scopus Proceedings", description: "Proceedings volumes carrying standard ISBN numbers and DOI links, submitted for full Scopus indexing.", image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80", type: "regular" }
];

const FALLBACK_JOURNALS = [
  { name: "International Journal of Food Sciences", publisher: "Endeavor Publications Group", impact: "4.8", issn: "ISSN 2643-9821", indexing: "Scopus, Web of Science, Google Scholar" }
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
  description: "Submitting your proposal to Endeavor Conferences is streamlined. Authors upload word/pdf drafts.",
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
            {/* Left Column: Text Content and Stats */}
            <div className="hero-left animate-fade-in-left">
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

              {/* Action Buttons */}
              <div className="hero-cta-buttons">
                <Link
                  to="/submit-abstract"
                  className="btn-premium-primary"
                >
                  Submit Abstract
                </Link>
                <button
                  className="btn-premium-secondary"
                  onClick={() => navigate("/conferences")}
                >
                  Explore Conferences
                </button>
              </div>

              {/* Left Column Statistics Counter Row */}
              <div className="hero-left-stats">
                <div className="stat-card">
                  <span className="stat-num">
                    <AnimatedCounter end={stats?.conferencesCount ?? 150} suffix="+" />
                  </span>
                  <span className="stat-txt">Conferences</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">
                    <AnimatedCounter end={stats?.researchersCount ?? 10000} suffix="+" />
                  </span>
                  <span className="stat-txt">Researchers</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">
                    <AnimatedCounter end={stats?.countriesCount ?? 50} suffix="+" />
                  </span>
                  <span className="stat-txt">Countries</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">
                    <AnimatedCounter end={stats?.publicationsCount ?? 500} suffix="+" />
                  </span>
                  <span className="stat-txt">Publications</span>
                </div>
              </div>
            </div>
            
            {/* Right Column: 3-Image Collage and Floating Badges */}
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

                  {/* Floating Glass Credibility Cards */}
                  <div className="glass-cred-card cred-1">
                    <span className="cred-icon">🔍</span>
                    <div className="cred-body">
                      <strong>Scopus Indexed</strong>
                      <span>Elsevier Indexation</span>
                    </div>
                  </div>

                  <div className="glass-cred-card cred-2">
                    <span className="cred-icon">🎯</span>
                    <div className="cred-body">
                      <strong>Peer Reviewed</strong>
                      <span>Double-Blind Review</span>
                    </div>
                  </div>

                  <div className="glass-cred-card cred-3">
                    <span className="cred-icon">🤝</span>
                    <div className="cred-body">
                      <strong>Global Network</strong>
                      <span>50+ Partner Countries</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Sponsor Logos Strip below Hero content */}
          <div className="hero-sponsor-strip container">
            <span className="sponsor-strip-title">TRUSTED & ACCREDITED BY LEADING SCIENTIFIC PUBLISHERS & RESEARCH GROUPS</span>
            <div className="sponsor-logos-grid">
              {sponsorsList.length > 0 ? (
                sponsorsList.slice(0, 6).map((sp) => (
                  <div key={sp.id} className="sponsor-logo-wrap">
                    <SponsorLogo name={sp.sponsorName} />
                  </div>
                ))
              ) : (
                <>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="IEEE" /></div>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="Springer Nature" /></div>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="Elsevier" /></div>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="Google Scholar" /></div>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="CrossRef" /></div>
                  <div className="sponsor-logo-wrap"><SponsorLogo name="Scopus" /></div>
                </>
              )}
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
                {aboutData?.description || "Research Endeavor acts as a pivotal axis connecting international experts, ideas, and publication pathways across 50+ countries."}
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

          {/* ── Bottom Credibility Strip ── */}
          <div className="about-cred-strip">
            <div className="about-cred-item">
              <span className="cred-strip-icon">🔬</span>
              <div>
                <strong>Scopus Indexed</strong>
                <span>Elsevier verified indexation</span>
              </div>
            </div>
            <div className="about-cred-divider" />
            <div className="about-cred-item">
              <span className="cred-strip-icon">✅</span>
              <div>
                <strong>Peer Reviewed</strong>
                <span>Double-blind review process</span>
              </div>
            </div>
            <div className="about-cred-divider" />
            <div className="about-cred-item">
              <span className="cred-strip-icon">🌐</span>
              <div>
                <strong>Global Network</strong>
                <span>50+ partner countries</span>
              </div>
            </div>
            <div className="about-cred-divider" />
            <div className="about-cred-item">
              <span className="cred-strip-icon">📚</span>
              <div>
                <strong>500+ Publications</strong>
                <span>Indexed research proceedings</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. CONFERENCE CATEGORIES (REDESIGNED & DYNAMIC) */}
      <section className="section categories-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Fields of Study</span>
            <h2 className="section-title">Diverse Academic Frontiers</h2>
            <p className="section-desc">
              Explore scientific calls and programs across all major disciplines and technical directories.
            </p>
          </div>
          <div className="categories-grid-redesign">
            {categories.map((cat, i) => (
              <div className="category-card-redesign card-premium" key={i}>
                <div className="cat-image-wrap">
                  <OptimizedImage src={cat.image} alt={cat.label} className="cat-img" fallbackType="research" />
                  <div className="cat-img-overlay" />
                  <span className="cat-icon-badge">{cat.icon}</span>
                </div>
                <div className="cat-content">
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                  <a href={getSubdomainUrl(item.subdomain || item.dbId)} className="btn-view-conf">View Program &rarr;</a>
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

      {/* 7. SCIENTIFIC PROGRAMS (REDESIGNED & DYNAMIC) */}
      <section className="section scientific-programs-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Programs</span>
            <h2 className="section-title">Generic Program Timeline</h2>
            <p className="section-desc">
              Interact with the Day-by-Day schedule layout representing standard 3-day congress agendas.
            </p>
          </div>
          <div className="timeline-day-selector">
            <button className={`day-tab-btn ${timelineActiveDay === "day1" ? "active" : ""}`} onClick={() => setTimelineActiveDay("day1")}>DAY 01 (Inaugural & Tracks)</button>
            <button className={`day-tab-btn ${timelineActiveDay === "day2" ? "active" : ""}`} onClick={() => setTimelineActiveDay("day2")}>DAY 02 (Keynotes & Panel)</button>
            <button className={`day-tab-btn ${timelineActiveDay === "day3" ? "active" : ""}`} onClick={() => setTimelineActiveDay("day3")}>DAY 03 (Symposia & Awards)</button>
          </div>
          <div className="timeline-wrapper-redesign">
            {(timelineData[timelineActiveDay] || []).map((session, index, arr) => (
              <div className="timeline-node" key={session.id}>
                <div className="node-time">
                  <span>⏰ {session.timeRange}</span>
                </div>
                <div className="node-marker">
                  <span className="node-dot"></span>
                  {index < arr.length - 1 && <span className="node-line"></span>}
                </div>
                <div className="node-card card-premium">
                  <h3>{session.name}</h3>
                  <p className="node-presenter">👤 Presenter: {session.speakerName} ({session.affiliation})</p>
                  <p className="node-desc">{session.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL FOR PAPERS (REDESIGNED & DYNAMIC) */}
      <section className="section call-for-papers-redesign">
        <div className="container">
          <div className="cfp-card-wrap glass-panel">
            <div className="cfp-text-side">
              <span className="cfp-badge">{callForAbstracts?.badge || "Call For Abstracts 2026"}</span>
              <h2>{callForAbstracts?.title || "Share Your Innovations Internationally"}</h2>
              <p>
                {callForAbstracts?.description || "Submitting your proposal to Endeavor Conferences is streamlined. Authors must register, upload a short draft abstract (word/pdf format), and select their target research category."}
              </p>
              <div className="cfp-milestones">
                <div className="milestone">
                  <strong>Milestone A</strong>
                  <span>Topic Selection</span>
                </div>
                <div className="milestone">
                  <strong>Milestone B</strong>
                  <span>Document Upload</span>
                </div>
                <div className="milestone">
                  <strong>Milestone C</strong>
                  <span>Portal Submission</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <Link to="/submit-abstract" className="btn-cfp-action">Submit Abstract proposal &rarr;</Link>
                <Link to="/conferences" className="btn-cfp-secondary">Abstract Guidelines</Link>
              </div>
            </div>
            <div className="cfp-image-side">
              <OptimizedImage src={callForAbstracts?.image} alt="Academic publishing review process" className="cfp-hero-img shadow-premium" fallbackType="research" />
            </div>
          </div>
        </div>
      </section>

      {/* 9. SPEAKERS (REDESIGNED) */}
      {speakersList.length > 0 && (
        <section className="section speakers-redesign">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Keynotes</span>
              <h2 className="section-title">Featured Plenary Presenters</h2>
              <p className="section-desc">
                Learn from world-renowned scientists and industry-leading specialists.
              </p>
            </div>
            <div className="speakers-grid-redesign">
              {speakersList.slice(0, 4).map((s, i) => {
                const headshot = s.photo?.filePath && s.photo.filePath.startsWith("http")
                  ? s.photo.filePath
                  : (s.photo?.fileName ? `${BASE_URL}/uploads/speakers/${s.photo.fileName}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=FFF1F5&color=E91E63&size=200`);
                return (
                  <div className="speaker-card-redesign card-premium" key={i}>
                    <div className="speaker-avatar-wrap">
                      <OptimizedImage src={headshot} alt={s.name} fallbackType="avatar" />
                    </div>
                    <div className="speaker-meta-info">
                      <h3>{s.name}</h3>
                      <p className="speaker-role">{s.designation}</p>
                      <p className="speaker-aff">{s.affiliation}</p>
                      {s.country && <span className="speaker-country-chip">🌍 {s.country}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 10. COMMITTEE MEMBERS (REDESIGNED & DYNAMIC) */}
      <section className="section committee-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Advisory Board</span>
            <h2 className="section-title">Global Steering Committee Section</h2>
            <p className="section-desc">
              Distinguished scholars directing research scopes, peer assessments, and track sessions.
            </p>
          </div>
          <div className="committee-grid-redesign">
            {committeeMembers.map((member, i) => (
              <div className="committee-card-redesign card-premium" key={i}>
                <div className="committee-img">
                  <OptimizedImage src={member.photo} alt={member.name} fallbackType="avatar" />
                </div>
                <div className="committee-body">
                  <h3>{member.name}</h3>
                  <p className="c-role">{member.role}</p>
                  <p className="c-inst">{member.institution}</p>
                  <span className="c-country">📍 {member.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. PUBLICATION OPPORTUNITIES (REDESIGNED & DYNAMIC) */}
      <section className="section publication-opp-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Publishing Tracks</span>
            <h2 className="section-title">Publication Indexation Opportunities</h2>
            <p className="section-desc">
              Ensure global academic reach by submitting abstracts to validated publishing tracks.
            </p>
          </div>
          <div className="pub-pathways-grid">
            {publicationPathways.map((path, i) => (
              <div className={`pathway-card card-premium ${path.type === "featured" ? "path-featured" : ""}`} key={i}>
                {path.type === "featured" && <span className="path-popular-badge">Special Issues</span>}
                <div className="path-img-wrap">
                  <OptimizedImage src={path.image} alt={path.title} fallbackType="research" />
                </div>
                <div className="path-body">
                  <h3>{path.title}</h3>
                  <p>{path.description}</p>
                  <Link to="/submit-abstract" className="btn-pathway-link">Submit Proposal &rarr;</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. JOURNALS (REDESIGNED & DYNAMIC) */}
      <section className="section journals-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Affiliated Publications</span>
            <h2 className="section-title">Indexed Academic Journals</h2>
            <p className="section-desc">
              Select special issues published in collaboration with top publishers.
            </p>
          </div>
          <div className="journals-grid-redesign">
            {journals.map((journal, i) => (
              <div className="journal-card-redesign card-premium" key={i}>
                <div className="j-badge">IMPACT FACTOR: {journal.impact}</div>
                <h3>{journal.name}</h3>
                <p className="j-publisher">{journal.publisher}</p>
                <div className="j-metadata">
                  <span>{journal.issn}</span>
                  <span>Indexed: {journal.indexing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. SPONSORS & PARTNERS (REDESIGNED & DYNAMIC LOGOS) */}
      <section className="section sponsors-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Partnerships</span>
            <h2 className="section-title">Organizers & Corporate Sponsors</h2>
            <p className="section-desc">
              Supported by leading academic groups and research laboratories.
            </p>
          </div>
          <div className="sponsors-ticker-wrapper">
            <div className="sponsors-ticker-content">
              {sponsorsList.map((sp) => (
                <div key={sp.id} className="sponsor-ticker-item">
                  <SponsorLogo name={sp.sponsorName} />
                </div>
              ))}
              {sponsorsList.length === 0 && (
                <>
                  <div className="sponsor-ticker-item"><SponsorLogo name="IEEE" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="Springer Nature" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="Elsevier" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="Google Scholar" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="CrossRef" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="Scopus" /></div>
                  <div className="sponsor-ticker-item"><SponsorLogo name="Web of Science" /></div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 14. WEBINAR SECTION (REDESIGNED & DYNAMIC) */}
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

      {/* 15. RESEARCH AREAS (REDESIGNED & DYNAMIC) */}
      <section className="section research-areas-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Scope of Research</span>
            <h2 className="section-title">Critical Research Domains</h2>
            <p className="section-desc">
              Focusing on computational and experimental frontiers that impact international scientific policies.
            </p>
          </div>
          <div className="research-areas-grid-expanded">
            {researchAreas.map((area, i) => (
              <div className="expanded-area-card card-premium" key={i}>
                <div className="area-head-img-wrap">
                  <OptimizedImage src={area.image} alt={area.label} className="area-cover-img" fallbackType="research" />
                  <div className="area-head-overlay" />
                  <div className="area-header-absolute">
                    <span className="area-icon-lg">{area.icon}</span>
                    <h3>{area.label}</h3>
                  </div>
                </div>
                <div className="area-body-content">
                  <p className="area-desc-text">{area.desc}</p>
                  <div className="area-subtracks">
                    <h4>Key Tracks:</h4>
                    <ul>
                      {(area.tracks || []).map((track, trackIdx) => (
                        <li key={trackIdx}>🧬 {track}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 16. WHY CHOOSE US (REDESIGNED & DYNAMIC) */}
      <section className="section why-choose-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Value Proposition</span>
            <h2 className="section-title">Why Scholars Choose Endeavor</h2>
            <p className="section-desc">
              Connecting researchers globally with validated publishing channels.
            </p>
          </div>
          <div className="why-choose-grid">
            {(aboutData?.pillars || FALLBACK_ABOUT.pillars).map((item, i) => (
              <div className="why-choose-card card-premium" key={i}>
                <span className="why-icon-badge">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 17. STATISTICS STRIP (REDESIGNED) */}
      {stats && (
        <section className="stats-strip-redesign">
          <div className="stats-strip-inner container">
            <div className="stat-item-redesign">
              <span className="stat-number-lg">
                <AnimatedCounter end={stats.conferencesCount} suffix="+" />
              </span>
              <span className="stat-label-muted">Conferences Hosted</span>
            </div>
            <div className="stat-item-redesign">
              <span className="stat-number-lg">
                <AnimatedCounter end={stats.countriesCount} suffix="+" />
              </span>
              <span className="stat-label-muted">Countries Represented</span>
            </div>
            <div className="stat-item-redesign">
              <span className="stat-number-lg">
                <AnimatedCounter end={stats.researchersCount} suffix="+" />
              </span>
              <span className="stat-label-muted">Scholars Connected</span>
            </div>
            <div className="stat-item-redesign">
              <span className="stat-number-lg">
                <AnimatedCounter end={stats.publicationsCount} suffix="+" />
              </span>
              <span className="stat-label-muted">Publications Indexed</span>
            </div>
          </div>
        </section>
      )}

      {/* 18. TESTIMONIALS (REDESIGNED) */}
      {/* <section className="section testimonials-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Reviews</span>
            <h2 className="section-title">Scholars Feedback</h2>
            <p className="section-desc">
              Read how international presenters value their conference experience.
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card card-premium">
              <div className="t-rating">⭐⭐⭐⭐⭐</div>
              <p className="t-text">"Outstanding double-blind peer review. The comments received on my abstract submission from the advisory committee significantly polished my final presentation."</p>
              <div className="t-user">
                <strong>Dr. Sarah Lee</strong>
                <span>MIT Graduate Researcher</span>
              </div>
            </div>
            <div className="testimonial-card card-premium">
              <div className="t-rating">⭐⭐⭐⭐⭐</div>
              <p className="t-text">"An invaluable platform for networking. I initiated joint research collaborations with experts from 3 different countries during the Spain Food Congress."</p>
              <div className="t-user">
                <strong>Prof. Alan Vance</strong>
                <span>CERN Laboratory Lead</span>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* 19. GALLERY (REDESIGNED & DYNAMIC) */}
      <section className="section gallery-redesign">
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
          <div className="gallery-grid-redesign-expanded">
            {filteredGallery.map((photo, i) => (
              <div className="gallery-img-holder-expanded card-premium" key={i}>
                <OptimizedImage src={photo.url} alt={`Congress moment ${photo.tag} ${i + 1}`} fallbackType="conference" />
                <span className="gallery-tag-label">{photo.tag.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 20. NEWS & UPDATES (REDESIGNED & DYNAMIC) */}
      <section className="section news-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Latest Announcements</span>
            <h2 className="section-title">News & Congress Deadlines</h2>
            <p className="section-desc">
              Stay informed about submission cutoff extensions and peer review updates.
            </p>
          </div>
          <div className="news-grid-redesign">
            {newsArticles.map((article, i) => (
              <div className="news-card-redesign card-premium" key={i}>
                <div className="news-media-wrap">
                  <OptimizedImage src={article.image} alt={article.title} fallbackType="research" />
                  <span className="news-cat-chip">{article.category}</span>
                </div>
                <div className="news-body-content">
                  <span className="news-date">{article.date}</span>
                  <h3>{article.title}</h3>
                  <p>{article.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 22. CONTACT INFORMATION (REDESIGNED) */}
      {/* <section className="section contact-redesign">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Support Desk</span>
            <h2 className="section-title">Contact Organizing Office</h2>
            <p className="section-desc">
              Direct inquiries to the steering committee or request administrative support.
            </p>
          </div>
          <div className="contact-box-grid">
            <div className="contact-details-panel">
              <div className="c-info-card card-premium">
                <h4>🏢 Address</h4>
                <p><strong>Endeavor Research Private Limited</strong></p>
                <p>1043 Garland Ave, Unit C #1012</p>
                <p>San Jose, CA 95126-3159</p>
              </div>
              <div className="c-info-card card-premium">
                <h4>✉️ Global Support Email</h4>
                <p>info@endeavorresearchgroup.com</p>
                <p>geology@endeavorresearchgroup.net</p>
              </div>
              <div className="c-info-card card-premium">
                <h4>📞 Hotlines</h4>
                <p>+1 (209) 299-5348</p>
              </div>
            </div>
            <div className="contact-form-panel card-premium">
              <h3>Send a Message</h3>
              {contactSuccess && <div className="contact-success-state">✓ Message transmitted successfully. We will follow up shortly.</div>}
              {contactError && <div className="contact-error-state">{contactError}</div>}
              <form onSubmit={handleContactSubmit}>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={contactForm.fullName}
                    onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                  />
                </div>
                <textarea
                  placeholder="Your message details..."
                  rows="5"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                ></textarea>
                <button type="submit" className="btn-send-msg" disabled={contactLoading}>
                  {contactLoading ? "Transmitting..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
          <div className="contact-map-frame card-premium">
            <iframe
              title="Global Office Map"
              src="https://maps.google.com/maps?q=1043%20Garland%20Ave,%20San%20Jose,%20CA%2095126&t=&z=14&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </section> */}

      {/* 23. FOOTER (UNTOUCHED) */}
      <Footer />
    </div>
  );
};

export default Homepage;