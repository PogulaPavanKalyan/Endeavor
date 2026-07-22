import React from "react";
import { useOutletContext, Link } from "react-router-dom";
import SEOHead from "../components/SEOHead";
import "./ConferenceAbstract.css";

const ConferenceSponsorship = () => {
  const { conference, footerSettings, getSubRoutePath } = useOutletContext();

  const title = footerSettings?.sponsorshipTitle || "Sponsorship Packages";
  const description = footerSettings?.sponsorshipDescription || "Partner with us to elevate your brand presence globally.";
  const content = footerSettings?.sponsorshipContent || "<p>Explore our customizable sponsorship and exhibitor packages designed to give your organization maximum reach across academic and industry delegates.</p>";
  const pdfUrl = footerSettings?.sponsorshipPdf;
  const ctaText = footerSettings?.sponsorshipCtaText || "Become a Sponsor";
  const ctaUrl = footerSettings?.sponsorshipCtaUrl || getSubRoutePath("register");

  return (
    <>
      <SEOHead
        title={footerSettings?.sponsorshipMetaTitle || `${title} | ${conference?.title || "Conference"}`}
        description={footerSettings?.sponsorshipMetaDesc || description}
        keywords={footerSettings?.sponsorshipKeywords || "sponsorship, conference packages, exhibitor"}
        canonicalUrl={footerSettings?.sponsorshipCanonicalUrl}
        ogImage={footerSettings?.sponsorshipOgImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": title,
          "description": description
        }}
      />

      <section className="conf-subpage-section">
        <div className="conf-subpage-container conf-form-card">
          <h2 className="conf-page-title">{title}</h2>

          {description && (
            <p style={{ fontSize: "1.1rem", color: "#475569", marginBottom: "1.5rem", lineHeight: "1.6" }}>
              {description}
            </p>
          )}

          <div className="conf-guidelines-container" style={{ marginBottom: "2rem" }}>
            <div
              className="conf-guidelines-content"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "2rem" }}>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-conf-submit"
                style={{ backgroundColor: "#334155", textDecoration: "none" }}
              >
                📥 Download Sponsorship Brochure (PDF)
              </a>
            )}

            {ctaText && (
              <Link
                to={ctaUrl.startsWith("http") ? ctaUrl : getSubRoutePath(ctaUrl.replace(/^\//, ""))}
                className="btn-conf-submit"
                style={{ textDecoration: "none" }}
              >
                {ctaText} →
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ConferenceSponsorship;
