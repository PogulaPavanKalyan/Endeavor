import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { api } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceProgram.css";

const ConferenceProgram = () => {
  const { conference } = useOutletContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryId = queryParams.get("categoryId");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("Scientific Program");
  
  // Legacy states for fallback if no categoryId is present
  const [sessions, setSessions] = useState([]);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (categoryId) {
          // New dynamic program feature
          const itemsData = await api.get(`/api/program-items?categoryId=${categoryId}`);
          if (Array.isArray(itemsData)) setItems(itemsData);
          
          // Also fetch categories to get the category name for the title
          const catData = await api.get(`/api/program-categories?conferenceId=${conference.id}`);
          if (Array.isArray(catData)) {
            const currentCat = catData.find(c => c.id.toString() === categoryId);
            if (currentCat) setCategoryName(currentCat.categoryName);
          }
        } else {
          // Legacy generic behavior if they just land on /program
          const [sessionsData, tracksData] = await Promise.all([
            api.get(`/api/sessions?conferenceId=${conference.id}`),
            api.get(`/api/tracks?conferenceId=${conference.id}`)
          ]);
          if (Array.isArray(sessionsData)) setSessions(sessionsData);
          if (Array.isArray(tracksData)) setTracks(tracksData.filter(t => t.isEnabled));
          setCategoryName("Scientific Program Schedule");
        }
      } catch (err) {
        console.error("Failed to load program data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conference?.id, categoryId]);

  return (
    <section className="conf-subpage-section">
      <SEOHead
        title={`${categoryName || "Scientific Program"} | ${conference?.title || "Conference"}`}
        description={`View the scientific program, session schedules, presentation tracks, and agenda for ${conference?.title || "our conference"}.`}
        keywords={`program, agenda, scientific schedule, presentation tracks, sessions, ${conference?.title || ""}`}
        ogTitle={`${categoryName || "Scientific Program"} | ${conference?.title || "Conference"}`}
        ogDescription={`Complete scientific schedule and sessions for ${conference?.title || "our conference"}.`}
      />
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">{categoryName}</h2>
        
        {loading ? (
          <p>Loading schedule...</p>
        ) : categoryId ? (
          // Render new dynamic ProgramItems
          <div className="program-plain-container" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {items.length > 0 ? items.map((item) => (
              <div key={item.id} className="program-plain-session" style={{borderLeft: '4px solid var(--conf-primary)', paddingLeft: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px'}}>
                  <p className="program-plain-time" style={{margin: 0, fontWeight: '700', color: 'var(--conf-primary)'}}>
                    {item.date && <span>{item.date} | </span>} 
                    {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}
                  </p>
                  {item.venue && <span style={{fontSize: '13px', background: 'var(--conf-bg-accent)', color: 'var(--conf-primary)', padding: '2px 8px', borderRadius: '4px'}}>📍 {item.venue}</span>}
                </div>
                <h3 className="program-plain-title" style={{margin: '0 0 8px 0', fontSize: '18px'}}>{item.title}</h3>
                
                {item.speakers && (
                  <p className="program-plain-speaker" style={{margin: '0 0 4px 0', fontSize: '15px'}}>
                    <strong style={{color: '#475569'}}>Speaker(s):</strong> {item.speakers}
                  </p>
                )}
                
                {item.chairPerson && (
                  <p className="program-plain-speaker" style={{margin: '0 0 4px 0', fontSize: '14px', color: '#64748b'}}>
                    <strong>Chair:</strong> {item.chairPerson}
                  </p>
                )}

                {item.description && (
                  <p style={{fontSize: '14px', color: '#475569', marginTop: '8px', lineHeight: '1.5'}}>
                    {item.description}
                  </p>
                )}
              </div>
            )) : (
              <p>No active items scheduled for this program.</p>
            )}
          </div>
        ) : (
          // Render legacy view
          <>
            <div className="program-plain-container">
              {sessions.map((session) => (
                <div key={session.id} className="program-plain-session">
                  <p className="program-plain-time">EST {session.timeRange}</p>
                  <p className="program-plain-title">Title: {session.name}</p>
                  {session.speakerName && (
                    <p className="program-plain-speaker">
                      {session.speakerName}{session.affiliation ? `, ${session.affiliation}` : ''}
                    </p>
                  )}
                </div>
              ))}
              {sessions.length === 0 && <p>General sessions will be announced soon.</p>}
            </div>

            <div id="tracks" className="program-tracks-section">
              <h3 className="program-tracks-title">Research Tracks</h3>
              <ul className="program-tracks-list">
                {tracks.length > 0 ? tracks.map((t, idx) => (
                  <li key={idx} className="program-tracks-item">
                    <strong>{t.name}</strong>
                  </li>
                )) : (
                  <li className="program-tracks-item">Scientific Tracks will be published soon.</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ConferenceProgram;
