import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

/* ── Main Footer Component ───────────────────────────────────────────────── */
const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);

  /* Scroll watcher */
  useEffect(() => {
    const handleScroll = () => setShowScrollBtn(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Newsletter submit */
  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setEmail("");
      setTimeout(() => setSuccess(false), 4000);
    }, 1200);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const toggleAccordion = (index) => {
    if (window.innerWidth <= 768) {
      setActiveAccordion(activeAccordion === index ? null : index);
    }
  };

  return (
    <footer className="footer-premium">



      {/* ── SECTION 3: MAIN FOOTER LINK COLUMNS ──────────────────────────── */}
      <div className="footer-main-links">
        <div className="footer-grid-container">

          {/* Column 1 – Brand */}
          <div className="footer-col-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="Endeavor Research Group" className="footer-logo-img" />
            </div>
            <p className="brand-desc">
              Empowering global research communities through international conferences,
              indexed publications, webinars, and scientific collaborations worldwide.
            </p>

            {/* Key value propositions */}
            <ul className="brand-value-props">
              <li>
                <span className="vp-check">✓</span>
                <span>150+ International Conferences</span>
              </li>
              <li>
                <span className="vp-check">✓</span>
                <span>Indexed Proceedings &amp; Publications</span>
              </li>
              <li>
                <span className="vp-check">✓</span>
                <span>Researchers from 50+ Countries</span>
              </li>
              <li>
                <span className="vp-check">✓</span>
                <span>Expert Peer Review Committee</span>
              </li>
            </ul>

            {/* Social icons */}
            <div className="social-links-grid">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <svg fill="currentColor" viewBox="0 0 24 24" height="1.2em" width="1.2em"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" /></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="LinkedIn">
                <svg fill="currentColor" viewBox="0 0 24 24" height="1.2em" width="1.2em"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.06-.5.15-.69a1.16 1.16 0 0 1 1.06-.77c.76 0 1.31.58 1.31 1.5v4.63h2.8M6.5 8.37a1.37 1.37 0 1 0 0-2.75 1.37 1.37 0 0 0 0 2.75M8 18.5V10.13H5.2v8.37H8z" /></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="X / Twitter">
                <svg fill="currentColor" viewBox="0 0 24 24" height="1.2em" width="1.2em"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg fill="currentColor" viewBox="0 0 24 24" height="1.2em" width="1.2em"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m8.4 4.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" /></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <svg fill="currentColor" viewBox="0 0 24 24" height="1.2em" width="1.2em"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div className={`footer-col ${activeAccordion === 1 ? "accordion-active" : ""}`}>
            <h3 onClick={() => toggleAccordion(1)}>
              Quick Links
              <svg className="accordion-arrow" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h3>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/conferences">Conferences</Link></li>
              <li><Link to="/sponsors">Sponsors</Link></li>
              <li><Link to="/webinars">Webinars</Link></li>
              <li><Link to="/submit-abstract">Proceedings</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Column 3 – Conferences */}
          <div className={`footer-col ${activeAccordion === 2 ? "accordion-active" : ""}`}>
            <h3 onClick={() => toggleAccordion(2)}>
              Conferences
              <svg className="accordion-arrow" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h3>
            <ul className="footer-links-list">
              <li><Link to="/conferences">Upcoming Conferences</Link></li>
              <li><Link to="/conferences">Past Conferences</Link></li>
              <li><Link to="/conferences">International Events</Link></li>
              <li><Link to="/conferences">Scientific Programs</Link></li>
              <li><Link to="/submit-abstract">Call For Papers</Link></li>
              <li><Link to="/conferences">Committee Members</Link></li>
              <li><Link to="/submit-abstract">Publication Opportunities</Link></li>
              <li><Link to="/submit-abstract">Conference Proceedings</Link></li>
            </ul>
          </div>

          {/* Column 4 – Contact */}
          <div className={`footer-col ${activeAccordion === 3 ? "accordion-active" : ""}`}>
            <h3 onClick={() => toggleAccordion(3)}>
              Contact Info
              <svg className="accordion-arrow" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </h3>
            <div className="contact-cards-container">
              <div className="contact-info-card">
                <h4>Email</h4>
                <p><a href="mailto:info@endeavorresearchgroup.com">info@endeavorresearchgroup.com</a></p>
              </div>
              <div className="contact-info-card">
                <h4>Phone</h4>
                <p><a href="tel:+12092995348">+1 (209) 299-5348</a></p>
              </div>
              <div className="contact-info-card">
                <h4>USA Office</h4>
                <p>1043 Garland Ave, Unit C #1012, San Jose, CA 95126-3159</p>
                <a
                  href="https://maps.google.com/?q=1043+Garland+Ave,+San+Jose,+CA+95126"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="maps-link-action"
                >
                  View on Google Maps →
                </a>
              </div>
              <div className="contact-info-card">
                <h4>India Office</h4>
                <p>#8-2-630, Mount Banjara Complex, Road No 12, Banjara Hills, Hyderabad, Telangana 500034</p>
              </div>
              <div className="contact-info-card-hours">
                <p>🕒 <strong>Business Hours:</strong> Mon – Fri, 9:00 AM – 6:00 PM EST</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION 4: NEWSLETTER ────────────────────────────────────────── */}
      {/* <div className="footer-newsletter-section">
        <div className="newsletter-wrapper">
          <div className="newsletter-glow-decor" />
          <h3>Stay Updated with Global Research</h3>
          <p className="newsletter-desc">
            Get conference announcements, webinar schedules, publication opportunities,
            and research insights delivered to your inbox.
          </p>

          {success ? (
            <div className="newsletter-success-state">
              <span className="success-icon">✓</span>
              <p>Thank you! You have successfully subscribed to our newsletter.</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubscribeSubmit} className="newsletter-form-premium">
                <div className="input-group">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="newsletter-input-premium"
                  />
                  <button type="submit" disabled={loading} className="btn-newsletter-submit">
                    {loading ? "Subscribing…" : "Subscribe"}
                  </button>
                </div>
              </form>
              <p className="newsletter-privacy">
                No spam, ever. Read our{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div> */}

      {/* ── SECTION 5: BOTTOM COPYRIGHT BAR (dark) ───────────────────────── */}
      <div className="footer-bottom-bar">
        <div className="bottom-bar-container">
          <div className="bottom-copyright">
            <p>© {new Date().getFullYear()} Endeavor Research Private Limited. All Rights Reserved.</p>
          </div>

          <div className="bottom-legal-links">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="separator">•</span>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <span className="separator">•</span>
            <Link to="/refund">Refund Policy</Link>
            <span className="separator">•</span>
            <Link to="/cookies">Cookies Policy</Link>
            <span className="separator">•</span>
            <Link to="/accessibility">Accessibility</Link>
          </div>

          <div className="bottom-brand-msg">
            <p>
              Designed by <a href="https://ygrgobalitservices.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#64748B", textDecoration: "none" }}>©YGR Gobal IT Services pvt.ltd</a></p>
          </div>
        </div>
      </div>

      {/* ── BACK TO TOP BUTTON ───────────────────────────────────────────── */}
      <button
        className={`btn-back-to-top ${showScrollBtn ? "visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Back to Top"
      >
        <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" height="1.3em" width="1.3em">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

    </footer>
  );
};

export default Footer;