import React from "react";
import { useOutletContext, Link } from "react-router-dom";
import { DEFAULT_GUIDELINES } from "../utils/constants";
import "./ConferenceAbstract.css";

const ConferenceGuidelines = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  
  const guidelinesContent = conference?.guidelines || DEFAULT_GUIDELINES;

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container conf-form-card">
        <h2 className="conf-page-title">Submission Guidelines</h2>

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

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to={getSubRoutePath("submit-abstract")} className="btn-conf-submit" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Proceed to Submit Abstract
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ConferenceGuidelines;
