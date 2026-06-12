import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
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
    setSuccess(false);

    try {
      await api.post("/api/contact", formData);
      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to send your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* HERO */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <h1>Contact Us</h1>
          <div className="breadcrumb-box">
            <Link to="/">Home</Link> &gt; <span>Contact Us</span>
          </div>
        </div>
      </section>

      {/* CONTACT PANEL */}
      <section className="contact-wrapper">
        <div className="contact-card">
          
          {/* LEFT SIDE: Contact Information */}
          <div className="contact-left">
            <span className="contact-sub">GET INFORMATION</span>
            <h2>Contact Information</h2>
            <p className="contact-text">
              Reach out to our organizing committee directly.
            </p>

            <div className="contact-info-list">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Address</h4>
                  <p><strong>Endeavor Research Private Limited</strong></p>
                  <p>1043 Garland Ave, Unit C #1012,</p>
                  <p>San Jose, CA 95126-3159</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Emails</h4>
                  <p>info@endeavorresearchgroup.com</p>
                  <p>geology@endeavorresearchgroup.net</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Phones</h4>
                  <p>+1 (209) 299-5348</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Send Message Form */}
          <div className="contact-right">
            <span className="contact-sub">SEND MESSAGE</span>
            <h2>Have Questions?</h2>

            {success && <div className="success-message">Your message has been sent successfully. We will get back to you soon!</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <input
                  type="text"
                  name="fullName"
                  placeholder="First Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <textarea
                name="message"
                rows="6"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
          
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="map-section">
        <iframe
          title="map"
          src="https://maps.google.com/maps?q=1043%20Garland%20Ave,%20San%20Jose,%20CA%2095126&t=&z=14&ie=UTF8&iwloc=&output=embed"
        />
      </section>

      <Footer />
    </>
  );
};

export default Contact;