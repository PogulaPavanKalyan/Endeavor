import React, { useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceSuggestSpeaker.css";

const ConferenceSuggestSpeaker = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  const [formData, setFormData] = useState({
    name: "",
    compuniversity: "",
    desigdept: "",
    email: "",
    mobileno: "",
    profileurl: "",
    spName: "",
    spCompuniversity: "",
    spDesigdept: "",
    spEmail: "",
    spMobileno: "",
    spProfileurl: ""
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
    try {
      await api.post("/api/suggest-speaker", {
        ...formData,
        conferenceId: conference.id
      });
      setSuccess(true);
      setFormData({
        name: "",
        compuniversity: "",
        desigdept: "",
        email: "",
        mobileno: "",
        profileurl: "",
        spName: "",
        spCompuniversity: "",
        spDesigdept: "",
        spEmail: "",
        spMobileno: "",
        spProfileurl: ""
      });
    } catch (err) {
      setError("Failed to submit speaker suggestion: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="conf-subpage-section suggest-speaker-section">
      <div className="conf-subpage-container suggest-speaker-layout">
        
        {/* Main form column */}
        <div className="suggest-speaker-main">
          <div className="suggest-speaker-card">
            <h2 className="suggest-speaker-main-title">Suggest a Speaker</h2>
            <p className="suggest-speaker-subtitle">
              Recommend outstanding researchers, industry leaders, or academic pioneers to speak at <strong>{conference.title}</strong>.
            </p>

            {success && (
              <div className="success-message">
                <span className="success-icon">✓</span>
                <div>
                  <h4>Thank You!</h4>
                  <p>Your speaker suggestion has been submitted successfully and will be reviewed by the scientific committee.</p>
                </div>
              </div>
            )}
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠</span>
                <div>
                  <h4>Submission Error</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="suggest-speaker-form">
              
              {/* Section 1: Your Contact Information */}
              <div className="form-section-header">
                <h3>1. Your Contact Information (Referrer)</h3>
                <div className="form-section-line"></div>
              </div>

              <div className="form-grid">
                <div className="conf-form-group">
                  <label htmlFor="name">Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="name"
                    name="name" 
                    placeholder="Your Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="compuniversity">Institution / University <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="compuniversity"
                    name="compuniversity" 
                    placeholder="Your University or Institution"
                    value={formData.compuniversity}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="desigdept">Designation and Department <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="desigdept"
                    name="desigdept" 
                    placeholder="e.g. Professor, Dept of Food Science"
                    value={formData.desigdept}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="email">Email Address <span className="required-star">*</span></label>
                  <input 
                    type="email" 
                    id="email"
                    name="email" 
                    placeholder="your.email@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="mobileno">Phone Number <span className="required-star">*</span></label>
                  <input 
                    type="tel" 
                    id="mobileno"
                    name="mobileno" 
                    placeholder="Include country code (e.g. +1...)"
                    value={formData.mobileno}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="profileurl">Profile URL <span className="optional-tag">(Optional)</span></label>
                  <input 
                    type="url" 
                    id="profileurl"
                    name="profileurl" 
                    placeholder="Academic profile, Google Scholar or LinkedIn URL"
                    value={formData.profileurl}
                    onChange={handleChange}
                    className="conf-form-control" 
                  />
                </div>
              </div>

              {/* Section 2: Suggest a Speaker */}
              <div className="form-section-header" style={{ marginTop: "40px" }}>
                <h3>2. Suggested Speaker Details</h3>
                <div className="form-section-line"></div>
              </div>

              <div className="form-grid">
                <div className="conf-form-group">
                  <label htmlFor="spName">Speaker Name <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="spName"
                    name="spName" 
                    placeholder="Suggested Speaker's Full Name"
                    value={formData.spName}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="spCompuniversity">Institution / University <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="spCompuniversity"
                    name="spCompuniversity" 
                    placeholder="Speaker's University or Institution"
                    value={formData.spCompuniversity}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="spDesigdept">Designation and Department <span className="required-star">*</span></label>
                  <input 
                    type="text" 
                    id="spDesigdept"
                    name="spDesigdept" 
                    placeholder="e.g. Senior Researcher, Dept of Bioscience"
                    value={formData.spDesigdept}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="spEmail">Email Address <span className="required-star">*</span></label>
                  <input 
                    type="email" 
                    id="spEmail"
                    name="spEmail" 
                    placeholder="speaker.email@domain.com"
                    value={formData.spEmail}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="spMobileno">Phone Number <span className="required-star">*</span></label>
                  <input 
                    type="tel" 
                    id="spMobileno"
                    name="spMobileno" 
                    placeholder="Speaker's contact number"
                    value={formData.spMobileno}
                    onChange={handleChange}
                    required 
                    className="conf-form-control" 
                  />
                </div>

                <div className="conf-form-group">
                  <label htmlFor="spProfileurl">Profile URL <span className="optional-tag">(Optional)</span></label>
                  <input 
                    type="url" 
                    id="spProfileurl"
                    name="spProfileurl" 
                    placeholder="Speaker's research profile, website, or LinkedIn"
                    value={formData.spProfileurl}
                    onChange={handleChange}
                    className="conf-form-control" 
                  />
                </div>
              </div>

              <div className="form-submit-container">
                <button type="submit" disabled={loading} className="btn-conf-submit btn-suggest-submit">
                  {loading ? "Submitting Recommendation..." : "Submit Speaker Suggestion"}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="suggest-speaker-sidebar">
          <div className="sidebar-card latest-news-card">
            <h3>Latest News</h3>
            <div className="sidebar-decor-line"></div>
            <ul className="sidebar-links-list">
              <li>
                <Link to={getSubRoutePath("")} className="sidebar-link">
                  <span className="bullet">⚡</span> Home
                </Link>
              </li>
              <li>
                <Link to={getSubRoutePath("suggest-speaker")} className="sidebar-link active">
                  <span className="bullet">⚡</span> Suggest a Speaker
                </Link>
              </li>
              <li>
                <Link to={getSubRoutePath("speakers")} className="sidebar-link">
                  <span className="bullet">⚡</span> Event Speakers
                </Link>
              </li>
              <li>
                <Link to={getSubRoutePath("brochure")} className="sidebar-link">
                  <span className="bullet">⚡</span> Brochure Requests
                </Link>
              </li>
              <li>
                <Link to={getSubRoutePath("register")} className="sidebar-link">
                  <span className="bullet">⚡</span> Registration
                </Link>
              </li>
            </ul>
          </div>

          <div className="sidebar-card contact-box-card">
            <h3>Secretariat Office</h3>
            <div className="sidebar-decor-line"></div>
            <p className="contact-box-desc">For any inquiries, feel free to contact the event coordinators.</p>
            <div className="contact-box-detail">
              <span className="icon">✉️</span>
              <a href={`mailto:${conference.email}`} className="text">{conference.email}</a>
            </div>
            <div className="contact-box-detail">
              <span className="icon">📞</span>
              <a href={`tel:${conference.phone}`} className="text">{conference.phone}</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ConferenceSuggestSpeaker;
