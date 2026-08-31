import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import SEOHead from "../components/SEOHead";
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
      <SEOHead
        title="Contact Intelevo Research | Hyderabad"
        description="Contact Intelevo Research headquarters in Hyderabad, Telangana, India. Find our office address, official email info@intelevoresearch.com, business hours, and contact form."
        keywords="Contact Intelevo Research, Hyderabad, Office Address, Email, Business Hours, Contact Form, Intelligence Evolved, IT Consulting, Technology Company Hyderabad"
        ogTitle="Contact Intelevo Research | Hyderabad"
        ogDescription="Connect with Intelevo Research headquarters in Hyderabad. Office address, email, and direct inquiry form."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contact Intelevo Research",
            "url": "https://intelevoresearch.com/contact"
          },
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "Intelevo Research",
            "image": "https://intelevoresearch.com/logo.svg",
            "url": "https://intelevoresearch.com/contact",
            "email": "info@intelevoresearch.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "SRI SAI ANANDAMAI, Chennareddy Enclave Road, Indira Nagar Colony",
              "addressLocality": "Hyderabad",
              "addressRegion": "Telangana",
              "postalCode": "500033",
              "addressCountry": "IN"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          }
        ]}
      />
      <Header />

      {/* HERO */}
      <section className="contact-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content container">
          <div className="contact-brand-header">
            <h1 className="contact-company-name">Intelevo Research</h1>
            <p className="contact-company-tagline">Intelligence Evolved</p>
          </div>
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
            <span className="contact-sub">GET IN TOUCH</span>
            <h2>Intelevo Research Headquarters</h2>
            <p className="contact-text">
              Connect with our international scientific committee and research operations team.
            </p>

            <div className="contact-info-list">
              {/* Office Address */}
              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Office Address</h4>
                  <p><strong>Intelevo Research</strong></p>
                  <p>SRI SAI ANANDAMAI,</p>
                  <p>Chennareddy Enclave Road,</p>
                  <p>Indira Nagar Colony,</p>
                  <p>Hyderabad, Telangana, India</p>
                </div>
              </div>

              {/* Official Email */}
              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Official Email</h4>
                  <p><a href="mailto:info@intelevoresearch.com">info@intelevoresearch.com</a></p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="contact-item">
                <div className="contact-icon">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="contact-item-text">
                  <h4>Business Hours</h4>
                  <p>Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                  <p>Saturday – Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Send Message Form */}
          <div className="contact-right">
            <span className="contact-sub">DIRECT INQUIRY</span>
            <h2>Send Us a Message</h2>

            {success && <div className="success-message">Your message has been sent successfully to Intelevo Research. We will respond promptly.</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
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
                placeholder="How can Intelevo Research assist you?"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>

              <button type="submit" disabled={loading}>
                {loading ? "Sending Message..." : "Send Message"}
              </button>
            </form>
          </div>
          
        </div>
      </section>

      {/* GOOGLE MAP SECTION */}
      <section className="map-section">
        <iframe
          title="Intelevo Research Headquarters Map"
          src="https://maps.google.com/maps?q=SRI%20SAI%20ANANDAMAI,%20Chennareddy%20Enclave%20Road,%20Indira%20Nagar%20Colony,%20Hyderabad,%20Telangana,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
        />
      </section>

      <Footer />
    </>
  );
};

export default Contact;