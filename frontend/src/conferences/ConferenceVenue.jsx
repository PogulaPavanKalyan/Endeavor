import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceVenue.css";

const ConferenceVenue = () => {
  const { conference } = useOutletContext();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (conference?.id) {
      api.get(`/api/venue?conferenceId=${conference.id}`)
        .then(data => {
          if (data && (data.id || data.name || data.address || data.city)) {
            setVenue(data);
          } else if (conference.venue) {
            setVenue({
              name: conference.venue,
              city: conference.venue,
              address: conference.venue,
              description: `Join us for ${conference.title || 'the conference'} hosted in ${conference.venue}.`
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch venue details", err);
          if (conference.venue) {
            setVenue({
              name: conference.venue,
              city: conference.venue,
              address: conference.venue,
              description: `Join us for ${conference.title || 'the conference'} hosted in ${conference.venue}.`
            });
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [conference?.id, conference?.venue, conference?.title]);

  const activeVenue = venue || (conference?.venue ? {
    name: conference.venue,
    city: conference.venue,
    address: conference.venue,
    description: `Join us for ${conference?.title || 'the conference'} hosted in ${conference.venue}.`
  } : null);

  return (
    <section className="conf-subpage-section">
      <SEOHead
        title={`Congress Venue & Accommodation | ${conference?.title || "Conference"}`}
        description={`Explore venue location, hotel accommodation, and travel details for ${conference?.title || "our conference"}.`}
        keywords={`venue, hotel, accommodation, travel guide, ${conference?.title || ""}`}
        ogTitle={`Congress Venue & Location | ${conference?.title || "Conference"}`}
        ogDescription={`Venue information and travel guide for ${conference?.title || "our conference"}.`}
      />
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">Congress Venue & Location</h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}>Loading venue details...</div>
        ) : !activeVenue ? (
          <div className="venue-grid" style={{ gridTemplateColumns: "1fr", textAlign: "center", padding: "60px 0" }}>
            <h3 className="venue-title">Location Details Pending</h3>
            <p className="venue-detail" style={{ marginTop: "10px", color: "#64748b" }}>
              Detailed venue information for {conference?.title} will be announced soon.
            </p>
          </div>
        ) : (
          <div className="venue-grid">
            <div>
              <h3 className="venue-title">{activeVenue.name || conference?.venue || "Conference Venue"}</h3>
              <p className="venue-detail" style={{ fontSize: "16px", marginTop: "8px", color: "#334155" }}>
                <strong>📍 Address:</strong> {activeVenue.address || activeVenue.name}
                {activeVenue.city && activeVenue.city !== activeVenue.address && `, ${activeVenue.city}`}
                {activeVenue.country && `, ${activeVenue.country}`}
              </p>
              
              {activeVenue.description && (
                <div className="venue-desc" style={{ marginTop: '20px', whiteSpace: 'pre-line', lineHeight: '1.6', color: '#475569' }}>
                  {activeVenue.description}
                </div>
              )}
              
              {activeVenue.photoUrl && (
                <div style={{ marginTop: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img
                    src={activeVenue.photoUrl.startsWith('http') ? activeVenue.photoUrl : `${BASE_URL}${activeVenue.photoUrl}`}
                    alt="Venue"
                    style={{ width: '100%', display: 'block', maxHeight: '350px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {activeVenue.accommodationInfo && (
                <div style={{ marginTop: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>🏨 Accommodation Details</h4>
                  <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{activeVenue.accommodationInfo}</p>
                </div>
              )}

              {activeVenue.travelInfo && (
                <div style={{ marginTop: '20px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '18px', color: '#1e293b', marginBottom: '10px' }}>✈️ Travel Information</h4>
                  <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{activeVenue.travelInfo}</p>
                </div>
              )}
            </div>
            
            <div>
              {activeVenue.mapEmbedUrl ? (
                <div className="venue-map-mock" style={{ padding: 0, overflow: 'hidden', height: '100%', minHeight: '400px', borderRadius: '12px' }}>
                  <iframe 
                    src={activeVenue.mapEmbedUrl} 
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
                <div className="venue-map-mock" style={{ minHeight: '350px' }}>
                  <span className="venue-map-icon" style={{ fontSize: '48px' }}>📍</span>
                  <p className="venue-map-title">{activeVenue.name || conference?.venue || "Conference City"}</p>
                  <p className="venue-map-subtitle">{activeVenue.city || conference?.venue}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConferenceVenue;
