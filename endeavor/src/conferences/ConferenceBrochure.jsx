import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import "./ConferenceBrochure.css";

const ConferenceBrochure = () => {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    phone: "",
    company: "",
    country: "",
    query: "" 
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/brochure", {
        ...formData,
        conferenceId: conference.id
      });
      setSuccess(true);
      if (conference?.brochureFileName) {
        window.open(`${BASE_URL}/uploads/brochures/${conference.brochureFileName}`, "_blank");
      }
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container conf-form-card">
        <h2 className="conf-page-title">Download Conference Brochure</h2>
        {success ? (
          <div className="brochure-success-container">
            <p className="brochure-success-icon">
              ✓ Request submitted successfully!
            </p>
            {conference?.brochureFileName ? (
              <>
                <p className="brochure-success-text">Your download is ready. Click below to download the brochure.</p>
                <a 
                  href={`${BASE_URL}/uploads/brochures/${conference.brochureFileName}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-conf-download"
                >
                  Download PDF Brochure
                </a>
              </>
            ) : (
              <>
                <p className="brochure-success-text">Thank you! Your request has been logged. The brochure PDF is currently being prepared and will be sent to your email address shortly.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="brochure-info-text">
              Enter your details to receive the comprehensive brochure guide for {conference.title}.
            </p>
            
            <div className="conf-form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                className="conf-form-control"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>

            <div className="brochure-form-grid">
              <div className="conf-form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="conf-form-control"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="conf-form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  className="conf-form-control"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="brochure-form-grid">
              <div className="conf-form-group">
                <label>Institution/Company</label>
                <input 
                  type="text" 
                  required 
                  className="conf-form-control"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="conf-form-group">
                <label>Country</label>
                <input 
                  type="text" 
                  required 
                  className="conf-form-control"
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="conf-form-group">
              <label>Any specific inquiry/question? (Optional)</label>
              <textarea 
                className="conf-form-control"
                rows="3"
                value={formData.query}
                onChange={e => setFormData({ ...formData, query: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" disabled={loading} className="btn-conf-submit">
              {loading ? "Submitting..." : "Submit & Access PDF"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ConferenceBrochure;
