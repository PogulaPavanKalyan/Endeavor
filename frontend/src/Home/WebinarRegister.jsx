import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import SEOHead from "../components/SEOHead";
import "./WebinarRegister.css";

const WebinarRegister = () => {
  const { slug, id } = useParams();
  const [webinar, setWebinar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [regResult, setRegResult] = useState(null);

  // Form State
  const [form, setForm] = useState({
    title: "Mr.",
    fullName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    jobTitle: ""
  });

  useEffect(() => {
    console.log("[WebinarRegister] Initialized. Params: ", { slug, id });
    fetchWebinarDetails();
  }, [slug, id]);

  const fetchWebinarDetails = async () => {
    setLoading(true);
    setError("");
    try {
      let data = null;
      if (slug) {
        console.log(`[WebinarRegister] Fetching webinar details by slug: "${slug}"`);
        data = await api.get(`/api/webinars/${slug}`);
      } else if (id) {
        console.log(`[WebinarRegister] Fetching webinar details by ID: "${id}"`);
        data = await api.get(`/api/webinars/id/${id}`);
      } else {
        throw new Error("Missing routing parameters. Neither Slug nor ID was specified.");
      }

      if (data) {
        console.log("[WebinarRegister] Webinar details loaded successfully:", data);
        setWebinar(data);
      } else {
        setError("Webinar details not found.");
      }
    } catch (err) {
      console.error("[WebinarRegister] Error fetching webinar details:", err);
      setError(err.message || "Failed to load webinar details. The webinar might be draft or archived.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.company || !form.country) {
      setError("Please fill in all required fields (*).");
      return;
    }

    setSubmitting(true);
    setError("");
    console.log("[WebinarRegister] Submitting registration payload with form:", form);

    try {
      const payload = {
        currency: "USD",
        title: form.title,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || "N/A",
        company: form.company,
        country: form.country,
        packageType: "Webinar Registration",
        packagePrice: 0.0,
        addOns: "None",
        addOnsPrice: 0.0,
        totalAmount: 0.0,
        paymentStatus: "CONFIRMED",
        transactionId: `WEBINAR-${webinar.id}-${Math.floor(100000 + Math.random() * 900000)}`,
        conferenceId: null,
        webinarId: webinar.id
      };

      console.log("[WebinarRegister] API POST Payload: ", payload);
      const result = await api.post("/api/register", payload);
      console.log("[WebinarRegister] Submission response: ", result);
      setRegResult(result);
    } catch (err) {
      console.error("[WebinarRegister] Registration failed:", err);
      setError(err.message || "Registration failed. Please check your network connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="webinar-reg-loading">
          <div className="pulse-loader"></div>
          <p>Retrieving webinar session information...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !webinar) {
    return (
      <>
        <Header />
        <div className="webinar-reg-error container">
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            <h2>Webinar Not Found</h2>
            <p>{error || "The specified webinar is invalid, archived, or currently unavailable."}</p>
            <Link to="/webinars" className="btn-catalog">
              &larr; Back to Webinars
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={`Register: ${webinar?.title || "Webinar"} | Intelevo Research`}
        description={`Register for ${webinar?.title || "scientific webinar"} presented by ${webinar?.speakerName || "guest speaker"} at Intelevo Research.`}
        robots="noindex, follow"
      />
      <Header />
      <div className="webinar-reg-wrapper">
        <div className="webinar-reg-hero" style={{ backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.8)), url(${webinar.bannerUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"})` }}>
          <div className="container" style={{ textAlign: "center" }}>
            <img src="/logo.svg" alt="Intelevo Research Logo" style={{ height: "48px", marginBottom: "10px", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }} />
            <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", color: "#60A5FA", marginBottom: "8px" }}>Intelevo Research • Intelligence Evolved</div>
            <h1>{webinar.title}</h1>
            <p className="speaker-credit">🎙️ Speaker: <strong>{webinar.speakerName}</strong> - {webinar.speakerDesignation}</p>
          </div>
        </div>

        <div className="container webinar-reg-body">
          {regResult ? (
            /* Successful Registration Ticket */
            <div className="ticket-outer-container">
              <div className="success-banner">
                <span className="check-icon">✓</span>
                <h2>Registration Confirmed!</h2>
                <p>Your webinar access details have been registered successfully.</p>
              </div>

              <div className="webinar-ticket">
                <div className="ticket-section left-sec">
                  <div className="ticket-label">SCIENTIFIC WEBINAR PASS</div>
                  <h3>{webinar.title}</h3>
                  
                  <div className="ticket-meta-grid">
                    <div>
                      <span>REGISTRANT</span>
                      <p>{regResult.title} {regResult.fullName}</p>
                    </div>
                    <div>
                      <span>PASS ID</span>
                      <p>#W-{regResult.id}</p>
                    </div>
                    <div>
                      <span>DATE</span>
                      <p>{webinar.webinarDate}</p>
                    </div>
                    <div>
                      <span>TIME</span>
                      <p>{webinar.startTime} - {webinar.endTime} ({webinar.timeZone || "UTC"})</p>
                    </div>
                  </div>
                </div>

                <div className="ticket-section right-sec">
                  <div className="barcode-container">
                    <div className="barcode-stripes"></div>
                    <p className="reference-code">{regResult.transactionId}</p>
                  </div>
                  <div className="ticket-access-badge">FREE ACCESS</div>
                </div>
              </div>

              <div className="ticket-instructions">
                <p><strong>Next Steps:</strong> A calendar invite and broadcast join URL will be shared to <strong>{regResult.email}</strong> before the live session. If a certificate option is available for this event, it will be issued upon attendance validation.</p>
                <div className="actions">
                  <Link to="/webinars" className="btn-primary">Back to Catalog</Link>
                  {webinar.meetingLink && (
                    <a href={webinar.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">Add to Calendar</a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <div className="registration-grid">
              <div className="form-column">
                <div className="form-card">
                  <h2>Claim Your Access Ticket</h2>
                  <p className="subtitle">Enter your details below to register. Entry is free.</p>
                  
                  {error && <div className="form-error-alert">{error}</div>}

                  <form onSubmit={handleSubmit} className="premium-form">
                    <div className="form-row">
                      <div className="form-group val-salutation">
                        <label>Title</label>
                        <select name="title" value={form.title} onChange={handleInputChange}>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                        </select>
                      </div>
                      
                      <div className="form-group val-fullname">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          placeholder="e.g. Sarah Jenkins"
                          value={form.fullName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="sarah.j@university.edu"
                          value={form.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="+1 (555) 019-2834"
                          value={form.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Institution / Company *</label>
                        <input
                          type="text"
                          name="company"
                          placeholder="e.g. Stanford University"
                          value={form.company}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Country *</label>
                        <input
                          type="text"
                          name="country"
                          placeholder="United States"
                          value={form.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Job Title / Designation</label>
                      <input
                        type="text"
                        name="jobTitle"
                        placeholder="e.g. Associate Professor / Researcher"
                        value={form.jobTitle}
                        onChange={handleInputChange}
                      />
                    </div>

                    <button type="submit" className="btn-register-submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner"></span> Processing Registration...
                        </>
                      ) : (
                        "Generate Free Webinar Pass"
                      )}
                    </button>
                  </form>
                </div>
              </div>

              <div className="sidebar-column">
                <div className="info-card">
                  <h3>Webinar Details</h3>
                  
                  <div className="info-item">
                    <span className="icon">📅</span>
                    <div>
                      <strong>Date</strong>
                      <p>{webinar.webinarDate}</p>
                    </div>
                  </div>
                  
                  <div className="info-item">
                    <span className="icon">⏰</span>
                    <div>
                      <strong>Time</strong>
                      <p>{webinar.startTime} - {webinar.endTime} ({webinar.timeZone || "UTC"})</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="icon">🎟️</span>
                    <div>
                      <strong>Price</strong>
                      <p style={{ color: "#10b981", fontWeight: "700" }}>FREE ACCESS</p>
                    </div>
                  </div>

                  {webinar.certificateAvailable && (
                    <div className="info-item">
                      <span className="icon">🎓</span>
                      <div>
                        <strong>Certificate Available</strong>
                        <p>Receive a certified attendance record upon completion.</p>
                      </div>
                    </div>
                  )}

                  <div className="secure-badge">
                    <span className="lock-icon">🔒</span>
                    <p>Secure Academic Registration Portal. No credit card required.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WebinarRegister;
