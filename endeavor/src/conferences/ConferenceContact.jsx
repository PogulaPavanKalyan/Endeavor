import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceContact.css";

const ConferenceContact = () => {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/contact", {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: `[${conference.title}] ${formData.subject}`,
        message: formData.message,
        conferenceId: conference.id
      });
      setSuccess(true);
      setFormData({ fullName: "", phone: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError("Failed to send message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container">
        
        <div className="conf-contact-card">
          {/* Left Column: Contact Information */}
          <div className="conf-contact-left">
            <span className="conf-contact-sub">GET INFORMATION</span>
            <h2>Contact Details</h2>
            <p className="conf-contact-text">
              Reach out to the {conference.title} secretariat.
            </p>

            <div className="conf-contact-info-list">
              <div className="conf-contact-item">
                <div className="conf-contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="conf-contact-item-text">
                  <h4>Address</h4>
                  <p><strong>Endeavor Research Private Limited</strong></p>
                  <p>1043 Garland Ave, Unit C #1012,</p>
                  <p>San Jose, CA 95126-3159</p>
                </div>
              </div>

              <div className="conf-contact-item">
                <div className="conf-contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="conf-contact-item-text">
                  <h4>Secretariat Email</h4>
                  <p>{conference?.email || "info@endeavorresearchgroup.com"}</p>
                </div>
              </div>

              <div className="conf-contact-item">
                <div className="conf-contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="conf-contact-item-text">
                  <h4>Phone</h4>
                  <p>{conference?.phone || "+1 (209) 299-5348"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Query Form */}
          <div className="conf-contact-right">
            <span className="conf-contact-sub">SEND MESSAGE</span>
            <h2>Have Questions?</h2>

            {success && (
              <div className="success-message">
                Your message has been sent successfully. We will get back to you soon!
              </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="conf-form-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder="First Name" 
                    value={formData.fullName}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>
                <div className="conf-form-group">
                  <label>Phone</label>
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="Phone" 
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="conf-form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="Email Address" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>
                <div className="conf-form-group">
                  <label>Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    placeholder="Subject" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>
              </div>

              <div className="conf-form-group" style={{ marginTop: "10px" }}>
                <label>Message Content</label>
                <textarea 
                  name="message"
                  placeholder="Your message..." 
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  rows="5" 
                  className="conf-form-control"
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-conf-submit" style={{ marginTop: "10px" }}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ConferenceContact;
