import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceProgram.css";

const ConferenceProgram = () => {
  const { conference } = useOutletContext();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionsData, tracksData] = await Promise.all([
          api.get(`/api/sessions?conferenceId=${conference.id}`),
          api.get(`/api/tracks?conferenceId=${conference.id}`)
        ]);
        if (Array.isArray(sessionsData)) setSessions(sessionsData);
        if (Array.isArray(tracksData)) setTracks(tracksData.filter(t => t.isEnabled));
      } catch (err) {
        console.error("Failed to load program data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [conference?.id]);

  const activeSessions = sessions.length > 0 ? sessions : [
    { id: 1, name: "Registration and Welcome Coffee", timeRange: "08:30 AM - 09:30 AM", speakerName: "Host Committee", affiliation: "Local Organization", description: "Collect attendee credentials, folders and program catalogs." },
    { id: 2, name: "Opening Remarks & Keynote Plenary Speech", timeRange: "09:30 AM - 10:45 AM", speakerName: "Dr. Andrea Miller", affiliation: "University of Valencia", description: "Global food supply chains stability and agricultural adaptations." },
    { id: 3, name: "Scientific Track Session 1: Advanced Research", timeRange: "11:00 AM - 01:00 PM", speakerName: "Oral Presenters", affiliation: "Panel Discussants", description: "Presentations of accepted abstract research papers." }
  ];

  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">Scientific Program Schedule</h2>
        
        {loading ? (
          <p>Loading schedule...</p>
        ) : (
          <div className="program-plain-container">
            <h3 className="program-plain-heading">Keynote Session:</h3>
            {activeSessions.map((session, idx) => (
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
          </div>
        )}

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
      </div>
    </section>
  );
};

export default ConferenceProgram;
