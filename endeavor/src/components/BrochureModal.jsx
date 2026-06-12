import React, { useState } from "react";
import { api } from "../utils/api";
import "./BrochureModal.css";

const BrochureModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
    query: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/api/brochure", formData);
      setSuccess(true);

      // Trigger automatic PDF download simulation
      const link = document.createElement("a");
      link.href = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"; // standard template
      link.download = "Endeavor_Conferences_2026_Brochure.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          country: "",
          query: "",
        });
      }, 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to register brochure request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="brochure-modal-overlay" onClick={onClose}>
      <div className="brochure-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>&times;</button>
        
        {success ? (
          <div className="success-modal-state">
            <span className="success-checkmark">✓</span>
            <h2>Thank You!</h2>
            <p>Your brochure request was submitted successfully. The PDF download has started.</p>
          </div>
        ) : (
          <>
            <h2>Request Event Brochure</h2>
            <p className="subtitle">Enter your contact details to download the comprehensive guide for the 2026 Conferences.</p>
            
            {error && <div className="error-alert">{error}</div>}
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group-modal">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-modal">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-modal">
                <input
                  type="text"
                  name="company"
                  placeholder="Institution/Company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-modal">
                <textarea
                  name="query"
                  placeholder="Any specific inquiry/question? (Optional)"
                  rows="3"
                  value={formData.query}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" disabled={submitting} className="btn-modal-submit">
                {submitting ? "Processing..." : "Download Brochure Now"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BrochureModal;
