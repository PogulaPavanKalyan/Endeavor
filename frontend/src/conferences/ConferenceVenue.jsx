import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceVenue.css";

const ConferenceVenue = () => {
  const { conference } = useOutletContext();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conference?.id) {
      api.get(`/api/venue?conferenceId=${conference.id}`)
        .then(data => {
          if (data && data.id) {
            setVenue(data);
          }
        })
        .catch(err => console.error("Failed to fetch venue details", err))
        .finally(() => setLoading(false));
    }
  }, [conference?.id]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "100px", color: "#64748b" }}>Loading venue details...</div>;
  }

  // Fallback to basic conference.venue if no detailed venue exists
  if (!venue) {
    return (
      <section className="conf-subpage-section">
        <div className="conf-subpage-container">
          <h2 className="conf-page-title">Congress Venue & Location</h2>
          <div className="venue-grid" style={{ gridTemplateColumns: "1fr", textAlign: "center", padding: "60px 0" }}>
            <h3 className="venue-title">Location Details Pending</h3>
            <p className="venue-detail" style={{ marginTop: "10px", color: "#64748b" }}>
              Detailed venue information for {conference?.title} will be announced soon.
            </p>
            {conference?.venue && (
              <p className="venue-detail" style={{ marginTop: "10px" }}>
                <strong>Host City:</strong> {conference.venue}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">Congress Venue & Location</h2>
        
        <div className="venue-grid">
          <div>
            <h3 className="venue-title">{venue.name || "Conference Venue"}</h3>
            <p className="venue-detail">
              <strong>Address:</strong> {venue.address}
              {venue.city && `, ${venue.city}`}
              {venue.country && `, ${venue.country}`}
            </p>
            
            {venue.description && (
              <div className="venue-desc" style={{ marginTop: '20px', whiteSpace: 'pre-line' }}>
                {venue.description}
              </div>
            )}
            
            {venue.photoUrl && (
              <div style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={venue.photoUrl} alt="Venue" style={{ width: '100%', display: 'block' }} />
              </div>
            )}

            {venue.accommodationInfo && (
              <div style={{ marginTop: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>🏨 Accommodation Details</h4>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{venue.accommodationInfo}</p>
              </div>
            )}

            {venue.travelInfo && (
              <div style={{ marginTop: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>✈️ Travel Information</h4>
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{venue.travelInfo}</p>
              </div>
            )}
          </div>
          
          <div>
            {venue.mapEmbedUrl ? (
              <div className="venue-map-mock" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: '400px' }}>
                <iframe 
                  src={venue.mapEmbedUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, minHeight: '400px' }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Venue Location"
                ></iframe>
              </div>
            ) : (
              <div className="venue-map-mock">
                <span className="venue-map-icon">📍</span>
                <p className="venue-map-title">Location Map Pending</p>
                <p className="venue-map-subtitle">{venue.city || conference?.venue}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConferenceVenue;
