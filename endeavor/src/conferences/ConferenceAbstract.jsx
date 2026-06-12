import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceAbstract.css";

const ConferenceAbstract = () => {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({
    fullName: "", designation: "", company: "", email: "", phone: "", country: "",
    presentationType: "Oral Presentation", sessionName: conference.sessions?.[0]?.title || "General Track"
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your abstract file (doc/docx/pdf).");
      return;
    }
    setLoading(true);
    try {
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
      if (conference && conference.id) {
        data.append("conferenceId", conference.id);
      }

      await api.postMultipart("/api/abstracts", data);
      setSuccess(true);
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container conf-form-card">
        <h2 className="conf-page-title">Submit Abstract Proposal</h2>
        {success ? (
          <div className="abstract-success-container">
            <p className="abstract-success-title">
              ✓ Abstract Submitted Successfully!
            </p>
            <p className="abstract-success-desc">
              Our review committee will examine your submission and notify you via email regarding acceptance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="abstract-form-row">
              <div className="conf-form-group">
                <label>Full Name</label>
                <input type="text" required className="conf-form-control" onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
              </div>
              <div className="conf-form-group">
                <label>Designation</label>
                <input type="text" required className="conf-form-control" onChange={e => setFormData({ ...formData, designation: e.target.value })} />
              </div>
            </div>

            <div className="abstract-form-row">
              <div className="conf-form-group">
                <label>Institution/Company</label>
                <input type="text" required className="conf-form-control" onChange={e => setFormData({ ...formData, company: e.target.value })} />
              </div>
              <div className="conf-form-group">
                <label>Email Address</label>
                <input type="email" required className="conf-form-control" onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>

            <div className="abstract-form-row">
              <div className="conf-form-group">
                <label>Phone Number</label>
                <input type="tel" required className="conf-form-control" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="conf-form-group">
                <label>Country</label>
                <input type="text" required className="conf-form-control" onChange={e => setFormData({ ...formData, country: e.target.value })} />
              </div>
            </div>

            <div className="abstract-form-row">
              <div className="conf-form-group">
                <label>Presentation Preference</label>
                <select className="conf-form-control" value={formData.presentationType} onChange={e => setFormData({ ...formData, presentationType: e.target.value })}>
                  <option>Oral Presentation</option>
                  <option>Poster Presentation</option>
                  <option>Keynote Speech</option>
                  <option>Webinar Speaker</option>
                </select>
              </div>
              <div className="conf-form-group">
                <label>Target Scientific Session</label>
                <select className="conf-form-control" value={formData.sessionName} onChange={e => setFormData({ ...formData, sessionName: e.target.value })}>
                  {conference.sessions?.map((s, idx) => (
                    <option key={idx} value={s.title}>{s.title}</option>
                  ))}
                  <option value="General Track">General Track</option>
                </select>
              </div>
            </div>

            <div className="conf-form-group" style={{ marginTop: "10px" }}>
              <label>Abstract File (doc, docx, pdf)</label>
              <input type="file" required accept=".doc,.docx,.pdf" className="conf-form-control" onChange={e => setFile(e.target.files[0])} />
            </div>

            <button type="submit" disabled={loading} className="btn-conf-submit" style={{ marginTop: "15px" }}>
              {loading ? "Uploading Submission..." : "Submit Proposal"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ConferenceAbstract;
