import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import "./WebinarDetails.css";

const WebinarDetails = () => {
  const { slug } = useParams();
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isEnded: false
  });

  useEffect(() => {
    fetchWebinarDetails();
  }, [slug]);

  const fetchWebinarDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/webinars/${slug}`);
      if (data) {
        setWebinar(data);
      } else {
        setError("Webinar details could not be found.");
      }
    } catch (err) {
      console.error("Failed to load webinar details:", err);
      setError("Failed to fetch webinar details. It may not be published or does not exist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!webinar) return;

    const timer = setInterval(() => {
      const datePart = webinar.webinarDate; // e.g. "2026-06-25"
      const startTimePart = webinar.startTime || "00:00"; // e.g. "14:00"
      const endTimePart = webinar.endTime || "23:59"; // e.g. "16:00"

      const startDateTime = new Date(`${datePart}T${startTimePart}:00`);
      const endDateTime = new Date(`${datePart}T${endTimePart}:00`);
      const now = new Date();

      const diffToStart = startDateTime - now;
      const diffToEnd = endDateTime - now;

      if (diffToStart > 0) {
        const days = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffToStart % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isLive: false, isEnded: false });
      } else if (diffToEnd > 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isEnded: false });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isEnded: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [webinar]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Could not copy page URL:", err));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="webinar-details-loading container">
          <div className="pulse-loader"></div>
          <p>Retrieving webinar materials...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !webinar) {
    return (
      <>
        <Header />
        <div className="webinar-details-error container">
          <div className="error-card">
            <h2>⚠️ Out of Reach</h2>
            <p>{error || "Webinar not found or is currently archived."}</p>
            <Link to="/webinars" className="btn-back-catalog">
              &larr; Back to Webinars
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isUpcoming = !timeLeft.isLive && !timeLeft.isEnded;

  return (
    <>
      <Header />

      <article className="webinar-details-wrapper">
        {/* Banner Section */}
        <section className="webinar-details-hero" style={{ backgroundImage: `url(${webinar.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"})` }}>
          <div className="details-hero-overlay"></div>
          <div className="container details-hero-content">
            <div className="details-breadcrumbs">
              <Link to="/webinars">Webinars</Link> &rarr; <span>{webinar.title}</span>
            </div>
            
            <div className="webinar-tags">
              <span className={`status-tag ${isUpcoming ? "upcoming" : timeLeft.isLive ? "live" : "completed"}`}>
                {isUpcoming ? "Upcoming Webinar" : timeLeft.isLive ? "Live Now 🔴" : "Completed"}
              </span>
              {webinar.certificateAvailable && (
                <span className="cert-tag">🎓 Certificate Provided</span>
              )}
            </div>

            <h1>{webinar.title}</h1>
            <p className="hero-speaker-byline">
              Presented by <strong>{webinar.speakerName}</strong> - {webinar.speakerDesignation}
            </p>
          </div>
        </section>

        {/* Content Layout */}
        <div className="container webinar-main-layout">
          <div className="webinar-left-col">
            {/* Description Card */}
            <div className="webinar-description-card">
              <h2>About this Webinar</h2>
              <div className="description-text">
                {webinar.description && webinar.description.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Speaker Bio Card */}
            <div className="speaker-profile-card">
              <h2>Keynote Speaker</h2>
              <div className="speaker-profile-grid">
                <div className="speaker-avatar-frame">
                  <img 
                    src={webinar.speakerPhoto || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&h=300&q=80"} 
                    alt={webinar.speakerName} 
                  />
                </div>
                <div className="speaker-profile-info">
                  <h3>{webinar.speakerName}</h3>
                  <p className="speaker-subtitle">{webinar.speakerDesignation}</p>
                  <p className="speaker-bio-desc">
                    Lead academic and keynote researcher. An expert in scientific collaborations with extensive publications and research contributions in advanced scientific fields.
                  </p>
                </div>
              </div>
            </div>

            {/* Video recording display if past & recording url available */}
            {timeLeft.isEnded && webinar.recordingUrl && (
              <div className="recording-player-card">
                <h2>📺 Webinar Recording</h2>
                <p>The live broadcast is completed. You can view the full recording below.</p>
                <div className="recording-embed-container">
                  <iframe 
                    src={webinar.recordingUrl.replace("watch?v=", "embed/")} 
                    title="Webinar Recording"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="recording-iframe"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          <div className="webinar-right-col">
            {/* Countdown / Status Card */}
            {isUpcoming && (
              <div className="details-countdown-card">
                <h3>Webinar Starts In</h3>
                <div className="countdown-grid">
                  <div className="countdown-item">
                    <span className="num">{timeLeft.days}</span>
                    <span className="lbl">Days</span>
                  </div>
                  <div className="countdown-item">
                    <span className="num">{timeLeft.hours}</span>
                    <span className="lbl">Hours</span>
                  </div>
                  <div className="countdown-item">
                    <span className="num">{timeLeft.minutes}</span>
                    <span className="lbl">Mins</span>
                  </div>
                  <div className="countdown-item">
                    <span className="num">{timeLeft.seconds}</span>
                    <span className="lbl">Secs</span>
                  </div>
                </div>
              </div>
            )}

            {timeLeft.isLive && (
              <div className="details-live-status-card">
                <div className="live-dot-pulse"></div>
                <h3>Broadcast in Progress</h3>
                <p>This webinar is currently live. Join the conference broadcast immediately.</p>
              </div>
            )}

            {/* Schedule & Access Card */}
            <div className="details-meta-card">
              <h3>Webinar Information</h3>
              
              <div className="meta-list">
                <div className="meta-list-item">
                  <span className="icon">📅</span>
                  <div className="info">
                    <span className="lbl">Date</span>
                    <span className="val">{webinar.webinarDate}</span>
                  </div>
                </div>
                <div className="meta-list-item">
                  <span className="icon">⏰</span>
                  <div className="info">
                    <span className="lbl">Time</span>
                    <span className="val">{webinar.startTime} - {webinar.endTime} ({webinar.timeZone || "UTC"})</span>
                  </div>
                </div>
                <div className="meta-list-item">
                  <span className="icon">🎟️</span>
                  <div className="info">
                    <span className="lbl">Access Type</span>
                    <span className="val">{webinar.registrationRequired ? "Registration Required" : "Free Public Access"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons-stack">
                {isUpcoming ? (
                  webinar.registrationRequired ? (
                    <a 
                      href={webinar.registrationUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-register-primary"
                    >
                      Register for Webinar
                    </a>
                  ) : (
                    <button className="btn-register-primary-disabled" disabled>
                      Free Access - Link Active at Start Time
                    </button>
                  )
                ) : timeLeft.isLive ? (
                  webinar.meetingLink ? (
                    <a 
                      href={webinar.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-join-primary"
                    >
                      Join Live Broadcast
                    </a>
                  ) : (
                    <button className="btn-register-primary-disabled" disabled>
                      Broadcast Link Pending
                    </button>
                  )
                ) : (
                  <button className="btn-register-primary-disabled" disabled>
                    Webinar Concluded
                  </button>
                )}

                <button className="btn-share-secondary" onClick={handleShare}>
                  {copied ? "✓ Copied to Clipboard!" : "🔗 Share Webinar Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
};

export default WebinarDetails;
