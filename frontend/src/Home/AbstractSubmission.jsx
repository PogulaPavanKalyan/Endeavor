import React, { useState, useEffect } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import "./AbstractSubmission.css";

const AbstractSubmission = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    designation: "",
    company: "",
    email: "",
    phone: "",
    country: "",
    presentationType: "Oral Presentation",
    sessionName: "",
  });
  const [file, setFile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await api.get("/api/sessions");
        if (Array.isArray(data) && data.length > 0) {
          setSessions(data);
          setFormData((prev) => ({ ...prev, sessionName: data[0].name }));
        } else {
          // Standard defaults
          const defaults = [
            { id: 1, name: "Food Science, Nutrition & Health" },
            { id: 2, name: "Quantum Computing & Quantum Physics" },
            { id: 3, name: "Zero Trust Architecture & Cyber Defense" },
            { id: 4, name: "Advanced Materials & Chemical Synthesis" },
          ];
          setSessions(defaults);
          setFormData((prev) => ({ ...prev, sessionName: defaults[0].name }));
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    fetchSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a document file (.pdf, .doc, or .docx) to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("designation", formData.designation);
    data.append("company", formData.company);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("country", formData.country);
    data.append("presentationType", formData.presentationType);
    data.append("sessionName", formData.sessionName);
    data.append("file", file);

    try {
      await api.postMultipart("/api/abstracts", data);
      setSuccess(true);
      setFormData({
        fullName: "",
        designation: "",
        company: "",
        email: "",
        phone: "",
        country: "",
        presentationType: "Oral Presentation",
        sessionName: sessions[0]?.name || "",
      });
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("abstract-file");
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit abstract. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <section className="abstract-hero">
        <div className="hero-overlay"></div>
        <div className="container abstract-hero-content">
          <span className="badge-premium">CALL FOR PAPERS</span>
          <h1>Submit Your Research Abstract</h1>
          <p>
            Share your research outcomes with the global scientific community. 
            Submit your abstract for keynote, oral, or poster presentation tracks.
          </p>
        </div>
      </section>

      <div className="abstract-container container">
        <div className="abstract-form-card">
          <h2>Abstract Submission Form</h2>
          <p className="description">Please fill in your primary details and upload your abstract file (.pdf, .doc, .docx format, max 10MB).</p>

          {success && (
            <div className="success-banner">
              <strong>✓ Submission Successful!</strong>
              <p>Your abstract was uploaded and is now under peer review. A confirmation email has been logged.</p>
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="abstract-form">
            <div className="form-section">
              <h3>Presenter Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Designation *</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="e.g. Associate Professor"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>University / Company *</label>
                  <input
                    type="text"
                    name="company"
                    placeholder="e.g. Stanford University"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Presentation Tracks</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Presentation Type *</label>
                  <select
                    name="presentationType"
                    value={formData.presentationType}
                    onChange={handleChange}
                  >
                    <option value="Oral Presentation">Oral Presentation</option>
                    <option value="Poster Presentation">Poster Presentation</option>
                    <option value="Keynote Presentation">Keynote Presentation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Select Conference Session *</label>
                  <select
                    name="sessionName"
                    value={formData.sessionName}
                    onChange={handleChange}
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Upload Document</h3>
              <div className="form-group">
                <label>Attach Abstract File * (PDF, DOC, DOCX)</label>
                <div className="file-dropzone">
                  <input
                    id="abstract-file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="dropzone-text">
                    <span className="upload-icon">📁</span>
                    {file ? (
                      <p className="file-selected">Selected file: <strong>{file.name}</strong></p>
                    ) : (
                      <p>Drag & drop or click to choose file</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-abstract-submit">
              {loading ? "Uploading Abstract..." : "Submit My Abstract"}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AbstractSubmission;
