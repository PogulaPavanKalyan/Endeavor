import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const [visible, setVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [confDropdownOpen, setConfDropdownOpen] = useState(false);
  const [subFormData, setSubFormData] = useState({ name: "", email: "" });
  const [subSuccess, setSubSuccess] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // Reveal header after mount
    const timer = setTimeout(() => setVisible(true), 200);
    
    // Scroll event listener for sticky floating transition
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    setSubLoading(true);
    // Simulate API registration
    setTimeout(() => {
      setSubLoading(false);
      setSubSuccess(true);
      setTimeout(() => {
        setIsSubscribeOpen(false);
        setSubSuccess(false);
        setSubFormData({ name: "", email: "" });
      }, 2000);
    }, 1000);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <>
      <header className={`header ${visible ? "show" : ""} ${isSticky ? "sticky-active" : ""} ${menuOpen ? "menu-active" : ""}`}>
        
        {/* TOP TIER (White Header) */}
        <div className="top-header">
          <div className="top-header-container">
            {/* Logo */}
            <div className="logo">
              <Link to="/">
                <img src="/logo.png" alt="Endeavor Conferences" />
              </Link>
            </div>
            
            {/* Action Group (Subscribe + Hamburger) */}
            <div className="top-actions-group">
              {/* Subscribe CTA */}
              <div className="top-actions">
                <button className="btn-subscribe" onClick={() => setIsSubscribeOpen(true)}>
                  <span>Subscribe</span>
                </button>
              </div>
              
              {/* Hamburger Toggle */}
              <button
                className={`hamburger ${menuOpen ? "open" : ""}`}
                onClick={toggleMenu}
                aria-label="Toggle Navigation"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM TIER (Dark Navy Navbar) */}
        <div className={`bottom-navbar ${isSticky ? "floating-capsule" : ""}`}>
          <div className="bottom-navbar-container">
            
            {/* Logo in Sticky State (Fades in on scroll) */}
            <div className="sticky-logo">
              <Link to="/">
                <img src="/logo.png" alt="Logo" className="sticky-logo-img" />
              </Link>
            </div>

            {/* Navigation Menu */}
            <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
              
              {/* Home */}
              <Link to="/" className={isActive("/")} onClick={() => setMenuOpen(false)}>
                Home
              </Link>

              {/* Conferences with Mega Menu */}
              <div 
                className="nav-item-dropdown"
                onMouseEnter={() => setConfDropdownOpen(true)}
                onMouseLeave={() => setConfDropdownOpen(false)}
              >
                <Link 
                  to="/conferences" 
                  className={`dropdown-trigger ${isActive("/conferences") || isActive("/submit-abstract") ? "active" : ""}`}
                  onClick={(e) => {
                    // Toggle dropdown on click for mobile/tablet screen sizes
                    if (window.innerWidth <= 992) {
                      e.preventDefault();
                      setConfDropdownOpen(!confDropdownOpen);
                    } else {
                      setMenuOpen(false);
                    }
                  }}
                >
                  Conferences
                  <svg className="chevron-icon" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </Link>

                {/* MEGA MENU DROPDOWN */}
                <div className={`mega-menu-panel ${confDropdownOpen ? "show" : ""}`}>
                  <div className="mega-menu-grid">
                    
                    {/* Column 1: Categories */}
                    <div className="mega-menu-col">
                      <h4>Conferences by Category</h4>
                      <ul>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Clinical Medicine
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Life Sciences
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Earth & Environmental
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Engineering & Technology
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 2: Speakers */}
                    <div className="mega-menu-col">
                      <h4>Speaker Directory</h4>
                      <ul>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Keynote Speakers
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Technical Committee
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Young Research Forum
                          </Link>
                        </li>
                        <li>
                          <Link to="/conferences" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                            <span className="dot pink"></span> Poster Presenters
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Column 3: Featured Promo card */}
                    <div className="mega-menu-col featured-card">
                      <div className="featured-inner">
                        <span className="featured-badge">Featured Event</span>
                        <h5>Global Science Congress 2026</h5>
                        <p>Meet and network with international leaders and present your research abstract.</p>
                        <Link to="/submit-abstract" className="btn-featured-action" onClick={() => { setConfDropdownOpen(false); setMenuOpen(false); }}>
                          Submit Abstract &rarr;
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Webinars */}
              <Link to="/webinars" className={isActive("/webinars")} onClick={() => setMenuOpen(false)}>
                Webinars
              </Link>

              {/* Proceedings */}
              <Link to="/proceedings" className={isActive("/proceedings")} onClick={() => setMenuOpen(false)}>
                Proceedings
              </Link>

              {/* Journals */}
              <Link to="/journals" className={isActive("/journals")} onClick={() => setMenuOpen(false)}>
                Journals
              </Link>

              {/* Contact */}
              <Link to="/contact" className={isActive("/contact")} onClick={() => setMenuOpen(false)}>
                Contact
              </Link>

              {/* Subscribe button inside mobile nav drawer */}
              <div className="mobile-subscribe-wrapper">
                <button className="btn-subscribe mobile" onClick={() => { setIsSubscribeOpen(true); setMenuOpen(false); }}>
                  Subscribe
                </button>
              </div>

            </nav>

            {/* Subscribe in Sticky State (Fades in on scroll) */}
            <div className="sticky-action">
              <button className="btn-subscribe sticky-btn" onClick={() => setIsSubscribeOpen(true)}>
                <span>Subscribe</span>
              </button>
            </div>

          </div>
        </div>

      </header>

      {/* Glassmorphic Subscribe Modal Overlay */}
      {isSubscribeOpen && (
        <div className="subscribe-modal-overlay" onClick={() => setIsSubscribeOpen(false)}>
          <div className="subscribe-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setIsSubscribeOpen(false)}>&times;</button>
            
            {subSuccess ? (
              <div className="success-modal-state">
                <div className="success-checkmark">&#10003;</div>
                <h2>Thank You!</h2>
                <p>You have successfully subscribed to Endeavor updates and event news.</p>
              </div>
            ) : (
              <>
                <h2>Subscribe to Updates</h2>
                <p className="modal-subtitle">Stay notified about upcoming scientific conferences, abstract submission deadlines, and speaker announcements.</p>
                
                <form onSubmit={handleSubscribeSubmit} className="modal-form">
                  <div className="form-group-modal">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      value={subFormData.name} 
                      onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-modal">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={subFormData.email} 
                      onChange={(e) => setSubFormData({ ...subFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-modal-submit" disabled={subLoading}>
                    {subLoading ? "Subscribed..." : "Subscribe Now"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;