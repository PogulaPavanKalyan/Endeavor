import React from "react";
import { useOutletContext } from "react-router-dom";
import "./ConferenceVenue.css";

const ConferenceVenue = () => {
  const { conference } = useOutletContext();
  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">Congress Venue & Location</h2>
        
        <div className="venue-grid">
          <div>
            <h3 className="venue-title">Conference Host Location</h3>
            <p className="venue-detail">
              <strong>City:</strong> {conference.venue}
            </p>
            <p className="venue-address">
              <strong>Hall Address:</strong> Global Congress Convention Center, main academic wing, {conference.venue}.
            </p>
            <p className="venue-desc">
              Our chosen premium venue has outstanding travel accessibility and features world-class auditorium facilities, high-fidelity media, and catering service areas to provide all attendees with a wonderful academic event environment.
            </p>
          </div>
          <div>
            {/* Google Map Mockup Box */}
            <div className="venue-map-mock">
              <span className="venue-map-icon">📍</span>
              <p className="venue-map-title">Google Maps Location</p>
              <p className="venue-map-subtitle">{conference.venue}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConferenceVenue;
