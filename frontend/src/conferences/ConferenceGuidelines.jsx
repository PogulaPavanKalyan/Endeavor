import React from "react";
import { useOutletContext, Link } from "react-router-dom";
import { DEFAULT_GUIDELINES } from "../utils/constants";
import SEOHead from "../components/SEOHead";
import "./ConferenceAbstract.css";

const ConferenceGuidelines = () => {
  const { conference, footerSettings, getSubRoutePath } = useOutletContext();
  
  const title = footerSettings?.guidelinesTitle || "Submission Guidelines";
  const guidelinesContent = footerSettings?.guidelinesContent || conference?.guidelines || DEFAULT_GUIDELINES;
  const pdfUrl = footerSettings?.guidelinesPdf;

  return (
    <>
      <SEOHead
        title={footerSettings?.guidelinesMetaTitle || `${title} | ${conference?.title || "Conference"}`}
        description={footerSettings?.guidelinesMetaDesc || "Author guidelines and paper submission rules."}
        keywords={footerSettings?.guidelinesKeywords || "author guidelines, paper submission, abstract rules"}
        canonicalUrl={footerSettings?.guidelinesCanonicalUrl}
        ogImage={footerSettings?.guidelinesOgImage}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": title
        }}
      />

      <section className="conf-subpage-section">
        <div className="conf-subpage-container conf-form-card">
          <h2 className="conf-page-title">{title}</h2>

          {guidelinesContent ? (
            <div className="conf-guidelines-container">
              <div 
                className="conf-guidelines-content" 
                dangerouslySetInnerHTML={{ __html: guidelinesContent }}
              />
            </div>
          ) : (
            <div className="conf-guidelines-container">
              <p>No guidelines have been published for this conference yet.</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginTop: "20px" }}>
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-conf-submit"
                style={{ backgroundColor: "#334155", textDecoration: 'none', display: 'inline-block' }}
              >
                📥 Download Author Guidelines / Template (PDF)
              </a>
            )}

            <Link to={getSubRoutePath("submit-abstract")} className="btn-conf-submit" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Proceed to Submit Abstract
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ConferenceGuidelines;
