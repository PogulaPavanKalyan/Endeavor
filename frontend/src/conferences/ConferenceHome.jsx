import React, { useState, useEffect } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import "./ConferenceHome.css";

const DEFAULT_PRICING_TIERS = [
  { type: "Student Registration", earlyPrice: 129, midPrice: 159, finalPrice: 189 },
  { type: "Academic Registration", earlyPrice: 99, midPrice: 129, finalPrice: 169 },
  { type: "Business Delegate", earlyPrice: 149, midPrice: 179, finalPrice: 199 }
];

const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
};

const ConferenceHome = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [infoUpdates, setInfoUpdates] = useState([]);
  const [activeTab, setActiveTab] = useState("keynote");
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [loading, setLoading] = useState(true);

  const getActivePhase = () => {
    if (!conference.startDate) return "Early Bird";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseLocalDate(conference.startDate);

    const earlyDeadline = new Date(start);
    earlyDeadline.setDate(earlyDeadline.getDate() - 45);
    earlyDeadline.setHours(0, 0, 0, 0);

    const midDeadline = new Date(start);
    midDeadline.setDate(midDeadline.getDate() - 20);
    midDeadline.setHours(0, 0, 0, 0);

    if (today <= earlyDeadline) {
      return "Early Bird";
    } else if (today <= midDeadline) {
      return "Mid-On";
    } else {
      return "Final";
    }
  };

  const activePhase = getActivePhase();

  const baseTiers = conference.pricingTiers && conference.pricingTiers.length > 0
    ? conference.pricingTiers
    : DEFAULT_PRICING_TIERS;

  // Resolve prices for the three ticket cards
  const getTicketPrice = (category) => {
    const dbTiers = conference.pricingTiers || [];
    let tier;
    
    if (category === "students") {
      // Find "academic" in DB, fallback to Academic Registration default tier (index 1)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("academic")) || DEFAULT_PRICING_TIERS[1];
    } else if (category === "speaker") {
      // Find "student" in DB, fallback to Student Registration default tier (index 0)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("student") || t.type.toLowerCase().includes("speaker")) || DEFAULT_PRICING_TIERS[0];
    } else {
      // Find "delegate" or "business" in DB, fallback to Business Delegate default tier (index 2)
      tier = dbTiers.find(t => t.type.toLowerCase().includes("delegate") || t.type.toLowerCase().includes("business")) || DEFAULT_PRICING_TIERS[2];
    }
    
    if (!tier) return 0;
    if (activePhase === "Early Bird") return tier.earlyPrice;
    if (activePhase === "Mid-On") return tier.midPrice;
    return tier.finalPrice;
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(conference.countdownTarget);
      const difference = +target - +new Date();
      let time = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        time = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return time;
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [conference.countdownTarget]);

  // Fetch dynamic sessions, speakers & info updates
  useEffect(() => {
    if (!conference || !conference.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sessionsData, speakersData, infoData, tracksData] = await Promise.all([
          api.get(`/api/sessions?conferenceId=${conference.id}`),
          api.get(`/api/speakers?conferenceId=${conference.id}`),
          api.get("/api/info-updates"),
          api.get(`/api/tracks?conferenceId=${conference.id}`)
        ]);
        if (Array.isArray(sessionsData)) {
          setSessions(sessionsData);
        }
        if (Array.isArray(speakersData)) {
          setSpeakers(speakersData);
        }
        if (Array.isArray(infoData)) {
          setInfoUpdates(infoData);
        }
        if (Array.isArray(tracksData)) {
          setTracks(tracksData.filter(t => t.isEnabled));
        }
      } catch (err) {
        console.error("Failed to load home page dynamic details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conference.id]);

  // Format single digits with leading zero
  const formatNum = (num) => {
    return num < 10 ? `0${num}` : num;
  };

  // Mock fallbacks if database is empty
  const mockSpeakers = [
    { 
      id: "mock-1", 
      name: "Prof. Sarah Higgins", 
      designation: "Scientific Committee Chair", 
      affiliation: "University of Oxford", 
      country: "UK", 
      type: "ADVISORY_BOARD", 
      bio: "Prof. Higgins is a leading scholar in biochemical adaptation and has published over 120 papers in highly-indexed journals.",
      photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80" 
    },
    { 
      id: "mock-2", 
      name: "Dr. Kenji Sato", 
      designation: "Plenary Chair", 
      affiliation: "Tokyo Institute of Technology", 
      country: "Japan", 
      type: "ADVISORY_BOARD", 
      bio: "Dr. Sato specializes in nanotechnology integrations and has collaborated on several international research projects.",
      photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80" 
    },
    { 
      id: "mock-3", 
      name: "Dr. Andrea Miller", 
      designation: "Invited Keynote Presenter", 
      affiliation: "University of Valencia", 
      country: "Spain", 
      type: "KEYNOTE", 
      bio: "Dr. Miller's research centers on international adaptation models and sustainable agricultural systems.",
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80" 
    },
    { 
      id: "mock-4", 
      name: "Prof. Alan Vance", 
      designation: "Technical Lead", 
      affiliation: "CERN Particle Accelerator", 
      country: "Switzerland", 
      type: "KEYNOTE", 
      bio: "Prof. Vance is an experimental physicist coordinating major detector validation campaigns globally.",
      photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80" 
    }
  ];

  // Resolve which lists to display
  const activeSessions = sessions.length > 0 
    ? sessions.map(s => ({ title: s.name, desc: s.description }))
    : (conference.sessions || []);

  const allSpeakers = speakers.length > 0 ? speakers : mockSpeakers;
  const currentSpeakers = allSpeakers.filter(spk => {
    const t = (spk.type || "").toLowerCase();
    if (activeTab === "advisory") {
      return t.includes("advisory") || t.includes("board") || t.includes("committee");
    } else {
      return t.includes("keynote") || t.includes("speaker") || t === "";
    }
  });

  const renderAboutText = (text) => {
    if (!text) return null;
    return text.split(/\n+/).map((para, idx) => (
      <p key={idx} className="conf-about-para" style={{ whiteSpace: "pre-line", marginBottom: "15px", fontSize: "15.5px", lineHeight: "1.6", color: "#4a5568" }}>
        {para.trim()}
      </p>
    ));
  };

  return (
    <div className="conf-home-portal">
      {/* Hero Section */}
      <section 
        className="conf-home-hero" 
        style={{ backgroundImage: `url(${conference.image})` }}
      >
        <div className="conf-home-hero-content">
          <div className="conf-home-hero-meta">
            {conference.date} {conference.venue}
          </div>
          <h1>{conference.title}</h1>

          {/* Countdown circles */}
          <div className="conf-countdown">
            <div className="conf-countdown-item">
              <span className="conf-countdown-number">{formatNum(timeLeft.days)}</span>
              <span className="conf-countdown-label">Days</span>
            </div>
            <div className="conf-countdown-item">
              <span className="conf-countdown-number">{formatNum(timeLeft.hours)}</span>
              <span className="conf-countdown-label">Hours</span>
            </div>
            <div className="conf-countdown-item">
              <span className="conf-countdown-number">{formatNum(timeLeft.minutes)}</span>
              <span className="conf-countdown-label">Mins</span>
            </div>
            <div className="conf-countdown-item">
              <span className="conf-countdown-number">{formatNum(timeLeft.seconds)}</span>
              <span className="conf-countdown-label">Secs</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="conf-about-section" style={{ padding: "80px 0", backgroundColor: "#ffffff" }}>
        <div className="container conf-about-grid">
          <div className="conf-about-text">
            <h2 style={{ fontSize: "32px", color: "#0f172a", fontWeight: "800", marginBottom: "25px", position: "relative", display: "inline-block" }}>
              About the Congress
              <span style={{ display: "block", width: "60px", height: "4px", backgroundColor: "var(--conf-primary)", marginTop: "8px", borderRadius: "2px" }}></span>
            </h2>
            
            <div style={{ marginBottom: "20px" }}>
              {renderAboutText(conference.about)}
            </div>

            {/* Custom UI Highlights Grid */}
            <div className="conf-about-highlights" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "35px" }}>
              <div className="conf-highlight-card" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", transition: "transform 0.3s ease" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>🔬</div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Scientific tracks</h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Deep dive into state-of-the-art presentations and panel reviews.</p>
              </div>
              
              <div className="conf-highlight-card" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", transition: "transform 0.3s ease" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>🌐</div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Global Reach</h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Connect and collaborate with leading minds from 50+ countries.</p>
              </div>

              <div className="conf-highlight-card" style={{ padding: "24px", background: "var(--conf-bg-accent, rgba(231, 76, 60, 0.04))", borderLeft: "4px solid var(--conf-primary)", borderRadius: "8px", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", transition: "transform 0.3s ease" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>🏆</div>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: "700", color: "#1e293b" }}>Opportunities</h4>
                <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>Fast-tracked indexed journal publications and oral presentation slots.</p>
              </div>
            </div>

            <div style={{ marginTop: "35px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
              <Link to={getSubRoutePath ? getSubRoutePath("register") : "register"} className="btn-conf-submit" style={{ textDecoration: "none", display: "inline-block" }}>Register Now</Link>
              <Link to={getSubRoutePath ? getSubRoutePath("submit-abstract") : "submit-abstract"} className="btn-conf-download" style={{ textDecoration: "none", display: "inline-block" }}>Submit Abstract</Link>
            </div>
          </div>
          <div className="conf-about-image" style={{ alignSelf: "start", marginTop: "15px" }}>
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80" alt="Conference Presentation" style={{ width: "100%", borderRadius: "12px", boxShadow: "0 15px 40px rgba(15, 23, 42, 0.08)" }} />
          </div>
        </div>
      </section>

      {/* Scientific Sessions Grid */}
      {(() => {
        const defaultTracks = [
          "Advanced Research and Trends in Food Sciences",
          "Functional Food and Nutraceuticals",
          "Early Nutrition Influence – Preventive and Therapeutic Aspects",
          "Food Microbiology and Enzymology",
          "COVID-19 and Food Security Challenges",
          "Global and Public Health Nutrition",
          "Food Safety and Policies",
          "Beverages Production and Processing",
          "Immunity Booster Green Foods",
          "Nutritional Genetics and Genomics",
          "Food & Nutritional Toxicology",
          "Food Quality and Nutritional Values",
          "Meat, Poultry, Seafood and its Preservation",
          "Food Processing and Engineering",
          "Agricultural Food Science and Sustainable Food Systems",
          "Food Packaging and Preservation",
          "Clinical and Translational Nutrition",
          "Malnutrition and Under-nutrition",
          "Nutrition, Metabolism and Cardiovascular Diseases",
          "Food Hydrocolloids"
        ];

        const tracksList = tracks && tracks.length > 0
          ? tracks.map(t => t.name)
          : defaultTracks;

        const midPoint = Math.ceil(tracksList.length / 2);
        const leftColumnTracks = tracksList.slice(0, midPoint);
        const rightColumnTracks = tracksList.slice(midPoint);

        return (
          <section className="conf-sessions-section" style={{ padding: "60px 0", backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header" style={{ textAlign: "left", marginBottom: "35px" }}>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", marginBottom: "15px", textTransform: "none" }}>
                  Scientific Tracks & Sessions
                </h2>
                <p style={{ color: "#334155", fontSize: "16px", lineHeight: "1.6", maxWidth: "100%", margin: "0" }}>
                  We have enlisted some outstanding sessions that will give an opportunity to focus on specific areas from your own perspective experiences. All the related interest areas are accepted, but are not limited to the following sessions:
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px 40px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {leftColumnTracks.map((track, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ color: "#f97316", fontSize: "20px", display: "inline-block", transform: "translateY(-1px)", userSelect: "none" }}>👉</span>
                      <span style={{ fontSize: "16.5px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4" }}>
                        {track}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {rightColumnTracks.map((track, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ color: "#f97316", fontSize: "20px", display: "inline-block", transform: "translateY(-1px)", userSelect: "none" }}>👉</span>
                      <span style={{ fontSize: "16.5px", fontWeight: "700", color: "#1e293b", lineHeight: "1.4" }}>
                        {track}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Listen to the Speakers Section */}
      <section className="conf-speakers-section" id="speakers-list">
        <div className="container">
          <div className="conf-section-header">
            <h2>Listen to the Speakers</h2>
            <p style={{ color: "#718096", fontSize: "15px", maxWidth: "600px", margin: "0 auto" }}>
              Meet our world-renowned keynote speakers and advisory board members.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="conf-speaker-tabs">
            <button 
              className={`conf-tab-btn ${activeTab === "keynote" ? "active" : ""}`}
              onClick={() => setActiveTab("keynote")}
            >
              Event Speakers
            </button>
            <button 
              className={`conf-tab-btn ${activeTab === "advisory" ? "active" : ""}`}
              onClick={() => setActiveTab("advisory")}
            >
              Advisory Board
            </button>
          </div>

          {/* Speakers Grid */}
          <div className="conf-speakers-grid">
            {currentSpeakers.length === 0 ? (
              <p style={{ textAlign: "center", gridColumn: "1/-1", color: "#718096", padding: "40px 0" }}>
                No speakers registered for this category yet.
              </p>
            ) : (
              currentSpeakers.map((spk) => (
                <div key={spk.id} className="conf-speaker-card" onClick={() => setSelectedSpeaker(spk)}>
                  <div className="speaker-image-wrapper">
                    <img 
                      src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e")} 
                      alt={spk.name}
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"; }}
                    />
                    <div className="speaker-hover-overlay">
                      <span className="plus-icon">+</span>
                    </div>
                  </div>
                  <div className="speaker-info">
                    <h3>{spk.name}</h3>
                    <p className="speaker-description">
                      {spk.designation}, {spk.affiliation} - {spk.country}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Registration Section below Speakers */}
      <section 
        className="conf-registration-home-section"
        style={{ backgroundImage: `url(https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80)` }}
      >
        <div className="conf-registration-home-container">
          <h2>Registration</h2>
          
          <div className="tickets-grid">
            {/* Young Research Forum/Students Ticket */}
            <div className="ticket-card">
              <div className="ticket-title">Young Research Forum/Students</div>
              <div className="ticket-price-container">
                <div className="ticket-price">
                  <span>$</span>{getTicketPrice("students")}
                </div>
                <div className="ticket-line"></div>
              </div>
              <Link to={getSubRoutePath("register")} className="btn-ticket-register">
                Register
              </Link>
            </div>

            {/* Speaker Ticket */}
            <div className="ticket-card">
              <div className="ticket-title">Speaker</div>
              <div className="ticket-price-container">
                <div className="ticket-price">
                  <span>$</span>{getTicketPrice("speaker")}
                </div>
                <div className="ticket-line"></div>
              </div>
              <Link to={getSubRoutePath("register")} className="btn-ticket-register">
                Register
              </Link>
            </div>

            {/* Delegate Ticket */}
            <div className="ticket-card">
              <div className="ticket-title">Delegate</div>
              <div className="ticket-price-container">
                <div className="ticket-price">
                  <span>$</span>{getTicketPrice("delegate")}
                </div>
                <div className="ticket-line"></div>
              </div>
              <Link to={getSubRoutePath("register")} className="btn-ticket-register">
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info Update Section below Registration */}
      {(() => {
        const fallbackInfoUpdates = [
          {
            title: "Suggest a Speaker",
            imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
            link: "suggest-speaker",
            color: "#ec4899"
          },
          {
            title: "Conferences",
            imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80",
            link: "",
            color: "#f97316"
          },
          {
            title: "Latest News",
            imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
            link: "speakers",
            color: "#f97316"
          }
        ];

        const activeInfoUpdates = infoUpdates && infoUpdates.length > 0 ? infoUpdates : fallbackInfoUpdates;

        return (
          <section className="conf-info-update-section" style={{ padding: "80px 0", backgroundColor: "#f8fafc" }}>
            <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
              <div className="conf-section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase" }}>Info Update</span>
                <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#f97316", marginTop: "10px", textTransform: "none" }}>Latest News</h2>
              </div>

              <div className="info-updates-grid" style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap" }}>
                {activeInfoUpdates.map((item, idx) => (
                  <Link 
                    key={idx} 
                    to={getSubRoutePath ? getSubRoutePath(item.link) : `/${item.link}`}
                    className="info-update-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      overflow: "hidden",
                      width: "320px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
                      cursor: "pointer",
                      textDecoration: "none",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                  >
                    <div style={{ width: "100%", height: "220px", overflow: "hidden" }}>
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} 
                        className="info-card-image"
                      />
                    </div>
                    <div style={{ padding: "20px 15px", textAlign: "center", background: "#ffffff", borderTop: "1px solid #f1f5f9" }}>
                      <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: item.color }}>
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Speaker Details Modal */}
      {selectedSpeaker && (
        <div className="conf-modal-overlay" onClick={() => setSelectedSpeaker(null)}>
          <div className="conf-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="conf-modal-close" onClick={() => setSelectedSpeaker(null)}>×</button>
            <div className="conf-modal-content-grid">
              <div className="conf-modal-img-wrap">
                <img 
                  src={selectedSpeaker.photo?.fileName ? `${BASE_URL}/uploads/speakers/${selectedSpeaker.photo.fileName}` : (selectedSpeaker.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e")} 
                  alt={selectedSpeaker.name}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"; }}
                />
              </div>
              <div className="conf-modal-text-wrap">
                <h2>{selectedSpeaker.name}</h2>
                <p className="modal-role">
                  {(selectedSpeaker.type || "").toLowerCase().includes("advisory") 
                    ? "Advisory Board Member" 
                    : "Featured Speaker"}
                </p>
                <p className="modal-designation"><strong>{selectedSpeaker.designation}</strong></p>
                <p className="modal-affiliation">{selectedSpeaker.affiliation}, {selectedSpeaker.country}</p>
                <div className="modal-divider"></div>
                <div className="modal-bio">
                  <h3>Biography</h3>
                  <p>{selectedSpeaker.bio || "Biography details are pending publication."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceHome;
