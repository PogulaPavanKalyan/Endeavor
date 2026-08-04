import React, { useState, useEffect } from "react";
import { api } from "../../utils/api";
import { useAdmin } from "../AdminContext";
import { useAdminDialog } from "../components/AdminDialogContext";
import "./FooterManager.css";

const FooterManager = () => {
  const { activeConferenceId } = useAdmin();
  const { toast } = useAdminDialog();
  const [activeTab, setActiveTab] = useState("sponsorship");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    // Sponsorship
    sponsorshipTitle: "",
    sponsorshipDescription: "",
    sponsorshipContent: "",
    sponsorshipPdf: "",
    sponsorshipCtaText: "",
    sponsorshipCtaUrl: "",
    sponsorshipMetaTitle: "",
    sponsorshipMetaDesc: "",
    sponsorshipKeywords: "",
    sponsorshipOgImage: "",
    sponsorshipCanonicalUrl: "",

    // Guidelines
    guidelinesTitle: "",
    guidelinesContent: "",
    guidelinesPdf: "",
    guidelinesMetaTitle: "",
    guidelinesMetaDesc: "",
    guidelinesKeywords: "",
    guidelinesOgImage: "",
    guidelinesCanonicalUrl: "",

    // Contact
    contactEmail: "",
    contactPhone: "",
    contactWhatsapp: "",
    contactAddress: "",
    googleMap: "",
    officeHours: "",
    contactMetaTitle: "",
    contactMetaDesc: "",
    contactKeywords: "",
    contactOgImage: "",
    contactCanonicalUrl: "",

    // Privacy
    privacyContent: "",
    privacyMetaTitle: "",
    privacyMetaDesc: "",
    privacyKeywords: "",
    privacyOgImage: "",
    privacyCanonicalUrl: "",

    // Terms
    termsContent: "",
    termsMetaTitle: "",
    termsMetaDesc: "",
    termsKeywords: "",
    termsOgImage: "",
    termsCanonicalUrl: "",

    // Cookies
    cookiesContent: "",
    cookiesMetaTitle: "",
    cookiesMetaDesc: "",
    cookiesKeywords: "",
    cookiesOgImage: "",
    cookiesCanonicalUrl: "",

    // Social Media
    facebook: "",
    linkedin: "",
    instagram: "",
    twitter: "",
    youtube: "",
    github: "",
    website: "",

    // Newsletter
    newsletterEnabled: true,
    newsletterSuccessMessage: ""
  });

  useEffect(() => {
    fetchFooterSettings();
  }, [activeConferenceId]);

  const fetchFooterSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/admin/footer";
      if (activeConferenceId) {
        url += `?conferenceId=${activeConferenceId}`;
      }
      const data = await api.get(url);
      if (data) {
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to load footer settings:", err);
      setError("Failed to load footer settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setSaving(true);
      const res = await api.post("/api/admin/footer/upload", uploadData);
      if (res && res.url) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: res.url
        }));
        toast.success("✓ File uploaded successfully!");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("❌ Failed to upload file. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let url = "/api/admin/footer";
      if (activeConferenceId) {
        url += `?conferenceId=${activeConferenceId}`;
      }
      const res = await api.put(url, {
        ...formData,
        conferenceId: activeConferenceId || formData.conferenceId
      });
      if (res) {
        toast.success("✓ Footer updated successfully!");
        setFormData(prev => ({ ...prev, ...res }));
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("❌ Failed to save footer settings.");
    } finally {
      setSaving(false);
    }
  };

  const insertHtmlTag = (fieldName, tag, label) => {
    let textToInsert = "";
    if (tag === "h3") textToInsert = "<h3>Heading Title</h3>\n";
    else if (tag === "p") textToInsert = "<p>Your paragraph text here...</p>\n";
    else if (tag === "ul") textToInsert = "<ul>\n  <li>Feature or Rule 1</li>\n  <li>Feature or Rule 2</li>\n</ul>\n";
    else if (tag === "a") textToInsert = '<a href="https://example.com" target="_blank">Link Text</a>';
    else if (tag === "img") textToInsert = '<img src="https://via.placeholder.com/600x300" alt="Image" style="max-width:100%; border-radius:8px; margin: 15px 0;" />';
    else if (tag === "youtube") textToInsert = '<iframe width="100%" height="360" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen style="border-radius:8px; margin: 15px 0;"></iframe>';

    setFormData(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || "") + textToInsert
    }));
  };

  if (loading) {
    return (
      <div className="footer-mgr-loading">
        <div className="admin-spinner"></div>
        <p>Loading Footer Settings...</p>
      </div>
    );
  }

  return (
    <div className="footer-manager-container">
      <div className="footer-mgr-header">
        <div>
          <h2>🦶 Footer &amp; CMS Management</h2>
          <p>Customize conference-specific footer links, sponsorship packages, guidelines, contact details, legal policies, and SEO.</p>
        </div>
        <button type="button" onClick={handleSubmit} className="btn-admin-primary" disabled={saving}>
          {saving ? "Saving..." : "💾 Save All Changes"}
        </button>
      </div>

      {message && <div className="admin-alert alert-success">{message}</div>}
      {error && <div className="admin-alert alert-danger">{error}</div>}

      {/* Navigation Tabs */}
      <div className="footer-mgr-tabs">
        <button className={activeTab === "sponsorship" ? "active" : ""} onClick={() => setActiveTab("sponsorship")}>🤝 Sponsorship</button>
        <button className={activeTab === "guidelines" ? "active" : ""} onClick={() => setActiveTab("guidelines")}>📄 Guidelines</button>
        <button className={activeTab === "contact" ? "active" : ""} onClick={() => setActiveTab("contact")}>✉️ Contact Info</button>
        <button className={activeTab === "privacy" ? "active" : ""} onClick={() => setActiveTab("privacy")}>🛡️ Privacy Policy</button>
        <button className={activeTab === "terms" ? "active" : ""} onClick={() => setActiveTab("terms")}>📜 Terms</button>
        <button className={activeTab === "cookies" ? "active" : ""} onClick={() => setActiveTab("cookies")}>🍪 Cookies Policy</button>
        <button className={activeTab === "social" ? "active" : ""} onClick={() => setActiveTab("social")}>🌐 Social Media</button>
        <button className={activeTab === "newsletter" ? "active" : ""} onClick={() => setActiveTab("newsletter")}>📬 Newsletter</button>
      </div>

      <form onSubmit={handleSubmit} className="footer-mgr-form">

        {/* 1. SPONSORSHIP TAB */}
        {activeTab === "sponsorship" && (
          <div className="tab-pane">
            <h3>Sponsorship Page Settings</h3>
            <div className="form-group">
              <label>Sponsorship Page Title</label>
              <input type="text" name="sponsorshipTitle" value={formData.sponsorshipTitle || ""} onChange={handleChange} placeholder="e.g. Sponsorship Packages" />
            </div>

            <div className="form-group">
              <label>Short Description</label>
              <textarea name="sponsorshipDescription" rows={3} value={formData.sponsorshipDescription || ""} onChange={handleChange} placeholder="Brief summary of sponsorship opportunity..." />
            </div>

            <div className="form-group">
              <div className="editor-label-bar">
                <label>Rich Text Content (Supports HTML, Images, Videos)</label>
                <div className="editor-tools">
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "h3")}>+ H3</button>
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "p")}>+ Para</button>
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "ul")}>+ List</button>
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "a")}>+ Link</button>
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "img")}>+ Image</button>
                  <button type="button" onClick={() => insertHtmlTag("sponsorshipContent", "youtube")}>+ YouTube</button>
                </div>
              </div>
              <textarea name="sponsorshipContent" rows={10} value={formData.sponsorshipContent || ""} onChange={handleChange} placeholder="Enter HTML/Rich text content..." className="code-editor-input" />
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label>Sponsorship Brochure PDF</label>
                <div className="file-input-wrapper">
                  <input type="text" name="sponsorshipPdf" value={formData.sponsorshipPdf || ""} onChange={handleChange} placeholder="/uploads/footer/brochure.pdf" />
                  <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e, "sponsorshipPdf")} id="upload-sp-pdf" hidden />
                  <label htmlFor="upload-sp-pdf" className="btn-upload-label">Upload PDF</label>
                </div>
              </div>
              <div className="form-group col-half">
                <label>CTA Button Text</label>
                <input type="text" name="sponsorshipCtaText" value={formData.sponsorshipCtaText || ""} onChange={handleChange} placeholder="e.g. Become a Sponsor" />
              </div>
            </div>

            <div className="form-group">
              <label>CTA Button Link / External URL</label>
              <input type="text" name="sponsorshipCtaUrl" value={formData.sponsorshipCtaUrl || ""} onChange={handleChange} placeholder="e.g. /register or https://..." />
            </div>

            <h4 className="seo-section-title">🔍 SEO &amp; Social Meta Tags</h4>
            <div className="form-row">
              <div className="form-group col-half">
                <label>SEO Meta Title</label>
                <input type="text" name="sponsorshipMetaTitle" value={formData.sponsorshipMetaTitle || ""} onChange={handleChange} placeholder="Sponsorship Opportunities | AI Conference 2027" />
              </div>
              <div className="form-group col-half">
                <label>Keywords (comma separated)</label>
                <input type="text" name="sponsorshipKeywords" value={formData.sponsorshipKeywords || ""} onChange={handleChange} placeholder="sponsorship, conference sponsors, exhibit" />
              </div>
            </div>
            <div className="form-group">
              <label>SEO Meta Description</label>
              <textarea name="sponsorshipMetaDesc" rows={2} value={formData.sponsorshipMetaDesc || ""} onChange={handleChange} placeholder="Explore exclusive sponsorship options and exhibitor booths." />
            </div>
            <div className="form-row">
              <div className="form-group col-half">
                <label>Open Graph Image URL</label>
                <input type="text" name="sponsorshipOgImage" value={formData.sponsorshipOgImage || ""} onChange={handleChange} placeholder="https://..." />
              </div>
              <div className="form-group col-half">
                <label>Canonical URL</label>
                <input type="text" name="sponsorshipCanonicalUrl" value={formData.sponsorshipCanonicalUrl || ""} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>
        )}

        {/* 2. GUIDELINES TAB */}
        {activeTab === "guidelines" && (
          <div className="tab-pane">
            <h3>Author &amp; Submission Guidelines</h3>
            <div className="form-group">
              <label>Guidelines Page Title</label>
              <input type="text" name="guidelinesTitle" value={formData.guidelinesTitle || ""} onChange={handleChange} placeholder="e.g. Submission Guidelines" />
            </div>

            <div className="form-group">
              <div className="editor-label-bar">
                <label>Guidelines Rich Text Content</label>
                <div className="editor-tools">
                  <button type="button" onClick={() => insertHtmlTag("guidelinesContent", "h3")}>+ H3</button>
                  <button type="button" onClick={() => insertHtmlTag("guidelinesContent", "p")}>+ Para</button>
                  <button type="button" onClick={() => insertHtmlTag("guidelinesContent", "ul")}>+ List</button>
                  <button type="button" onClick={() => insertHtmlTag("guidelinesContent", "a")}>+ Link</button>
                  <button type="button" onClick={() => insertHtmlTag("guidelinesContent", "img")}>+ Image</button>
                </div>
              </div>
              <textarea name="guidelinesContent" rows={12} value={formData.guidelinesContent || ""} onChange={handleChange} placeholder="Enter HTML/Rich text content..." className="code-editor-input" />
            </div>

            <div className="form-group">
              <label>Downloadable Template / Guidelines PDF</label>
              <div className="file-input-wrapper">
                <input type="text" name="guidelinesPdf" value={formData.guidelinesPdf || ""} onChange={handleChange} placeholder="/uploads/footer/guidelines.pdf" />
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, "guidelinesPdf")} id="upload-gl-pdf" hidden />
                <label htmlFor="upload-gl-pdf" className="btn-upload-label">Upload Template PDF</label>
              </div>
            </div>

            <h4 className="seo-section-title">🔍 SEO &amp; Social Meta Tags</h4>
            <div className="form-row">
              <div className="form-group col-half">
                <label>SEO Meta Title</label>
                <input type="text" name="guidelinesMetaTitle" value={formData.guidelinesMetaTitle || ""} onChange={handleChange} />
              </div>
              <div className="form-group col-half">
                <label>Keywords</label>
                <input type="text" name="guidelinesKeywords" value={formData.guidelinesKeywords || ""} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>SEO Meta Description</label>
              <textarea name="guidelinesMetaDesc" rows={2} value={formData.guidelinesMetaDesc || ""} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* 3. CONTACT TAB */}
        {activeTab === "contact" && (
          <div className="tab-pane">
            <h3>Conference Contact Information</h3>
            <div className="form-row">
              <div className="form-group col-third">
                <label>Official Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail || ""} onChange={handleChange} placeholder="contact@conference.org" />
              </div>
              <div className="form-group col-third">
                <label>Phone Number</label>
                <input type="text" name="contactPhone" value={formData.contactPhone || ""} onChange={handleChange} placeholder="+1 (209) 299-5348" />
              </div>
              <div className="form-group col-third">
                <label>WhatsApp Contact</label>
                <input type="text" name="contactWhatsapp" value={formData.contactWhatsapp || ""} onChange={handleChange} placeholder="+1 (209) 299-5348" />
              </div>
            </div>

            <div className="form-group">
              <label>Physical Address</label>
              <textarea name="contactAddress" rows={3} value={formData.contactAddress || ""} onChange={handleChange} placeholder="Full address details..." />
            </div>

            <div className="form-row">
              <div className="form-group col-half">
                <label>Google Maps Embed or Link</label>
                <input type="text" name="googleMap" value={formData.googleMap || ""} onChange={handleChange} placeholder="https://maps.google.com/..." />
              </div>
              <div className="form-group col-half">
                <label>Business / Office Hours</label>
                <input type="text" name="officeHours" value={formData.officeHours || ""} onChange={handleChange} placeholder="Mon – Fri, 9:00 AM – 6:00 PM EST" />
              </div>
            </div>

            <h4 className="seo-section-title">🔍 SEO &amp; Social Meta Tags</h4>
            <div className="form-row">
              <div className="form-group col-half">
                <label>SEO Meta Title</label>
                <input type="text" name="contactMetaTitle" value={formData.contactMetaTitle || ""} onChange={handleChange} />
              </div>
              <div className="form-group col-half">
                <label>Keywords</label>
                <input type="text" name="contactKeywords" value={formData.contactKeywords || ""} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>SEO Meta Description</label>
              <textarea name="contactMetaDesc" rows={2} value={formData.contactMetaDesc || ""} onChange={handleChange} />
            </div>
          </div>
        )}

        {/* 4. PRIVACY TAB */}
        {activeTab === "privacy" && (
          <div className="tab-pane">
            <h3>Privacy Policy Page</h3>
            <div className="form-group">
              <div className="editor-label-bar">
                <label>Privacy Policy Rich Text Content</label>
                <div className="editor-tools">
                  <button type="button" onClick={() => insertHtmlTag("privacyContent", "h3")}>+ H3</button>
                  <button type="button" onClick={() => insertHtmlTag("privacyContent", "p")}>+ Para</button>
                  <button type="button" onClick={() => insertHtmlTag("privacyContent", "ul")}>+ List</button>
                </div>
              </div>
              <textarea name="privacyContent" rows={14} value={formData.privacyContent || ""} onChange={handleChange} className="code-editor-input" />
            </div>

            <h4 className="seo-section-title">🔍 SEO &amp; Social Meta Tags</h4>
            <div className="form-row">
              <div className="form-group col-half">
                <label>SEO Meta Title</label>
                <input type="text" name="privacyMetaTitle" value={formData.privacyMetaTitle || ""} onChange={handleChange} />
              </div>
              <div className="form-group col-half">
                <label>Keywords</label>
                <input type="text" name="privacyKeywords" value={formData.privacyKeywords || ""} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* 5. TERMS TAB */}
        {activeTab === "terms" && (
          <div className="tab-pane">
            <h3>Terms &amp; Conditions Page</h3>
            <div className="form-group">
              <div className="editor-label-bar">
                <label>Terms &amp; Conditions Content</label>
                <div className="editor-tools">
                  <button type="button" onClick={() => insertHtmlTag("termsContent", "h3")}>+ H3</button>
                  <button type="button" onClick={() => insertHtmlTag("termsContent", "p")}>+ Para</button>
                  <button type="button" onClick={() => insertHtmlTag("termsContent", "ul")}>+ List</button>
                </div>
              </div>
              <textarea name="termsContent" rows={14} value={formData.termsContent || ""} onChange={handleChange} className="code-editor-input" />
            </div>

            <h4 className="seo-section-title">🔍 SEO &amp; Social Meta Tags</h4>
            <div className="form-row">
              <div className="form-group col-half">
                <label>SEO Meta Title</label>
                <input type="text" name="termsMetaTitle" value={formData.termsMetaTitle || ""} onChange={handleChange} />
              </div>
              <div className="form-group col-half">
                <label>Keywords</label>
                <input type="text" name="termsKeywords" value={formData.termsKeywords || ""} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* 6. COOKIES TAB */}
        {activeTab === "cookies" && (
          <div className="tab-pane">
            <h3>Cookies Policy Page</h3>
            <div className="form-group">
              <div className="editor-label-bar">
                <label>Cookies Policy Content</label>
                <div className="editor-tools">
                  <button type="button" onClick={() => insertHtmlTag("cookiesContent", "h3")}>+ H3</button>
                  <button type="button" onClick={() => insertHtmlTag("cookiesContent", "p")}>+ Para</button>
                  <button type="button" onClick={() => insertHtmlTag("cookiesContent", "ul")}>+ List</button>
                </div>
              </div>
              <textarea name="cookiesContent" rows={14} value={formData.cookiesContent || ""} onChange={handleChange} className="code-editor-input" />
            </div>
          </div>
        )}

        {/* 7. SOCIAL MEDIA TAB */}
        {activeTab === "social" && (
          <div className="tab-pane">
            <h3>Social Media Links</h3>
            <div className="form-row">
              <div className="form-group col-half">
                <label>Facebook URL</label>
                <input type="text" name="facebook" value={formData.facebook || ""} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
              </div>
              <div className="form-group col-half">
                <label>LinkedIn URL</label>
                <input type="text" name="linkedin" value={formData.linkedin || ""} onChange={handleChange} placeholder="https://linkedin.com/company/yourpage" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-half">
                <label>Instagram URL</label>
                <input type="text" name="instagram" value={formData.instagram || ""} onChange={handleChange} placeholder="https://instagram.com/yourhandle" />
              </div>
              <div className="form-group col-half">
                <label>X / Twitter URL</label>
                <input type="text" name="twitter" value={formData.twitter || ""} onChange={handleChange} placeholder="https://twitter.com/yourhandle" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group col-third">
                <label>YouTube Channel</label>
                <input type="text" name="youtube" value={formData.youtube || ""} onChange={handleChange} placeholder="https://youtube.com/@channel" />
              </div>
              <div className="form-group col-third">
                <label>GitHub Profile</label>
                <input type="text" name="github" value={formData.github || ""} onChange={handleChange} placeholder="https://github.com/org" />
              </div>
              <div className="form-group col-third">
                <label>Main Website Link</label>
                <input type="text" name="website" value={formData.website || ""} onChange={handleChange} placeholder="https://intelevoresearch.com" />
              </div>
            </div>
          </div>
        )}

        {/* 8. NEWSLETTER TAB */}
        {activeTab === "newsletter" && (
          <div className="tab-pane">
            <h3>Newsletter Subscription Settings</h3>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" name="newsletterEnabled" checked={formData.newsletterEnabled !== false} onChange={handleChange} />
                Enable Footer Newsletter Subscription Form
              </label>
            </div>

            <div className="form-group">
              <label>Subscription Success Message</label>
              <input type="text" name="newsletterSuccessMessage" value={formData.newsletterSuccessMessage || ""} onChange={handleChange} placeholder="Thank you for subscribing to our newsletter!" />
            </div>
          </div>
        )}

        <div className="footer-mgr-bottom-actions">
          <button type="submit" className="btn-admin-primary" disabled={saving}>
            {saving ? "Saving Changes..." : "💾 Save Footer Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FooterManager;
