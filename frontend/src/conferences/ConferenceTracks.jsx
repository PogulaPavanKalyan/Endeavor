import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useOutletContext, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import './ConferenceTracks.css';

const ConferenceTracks = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  const conferenceId = conference?.id;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'featured'
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        let loadedTracks = [];
        if (conferenceId) {
          const data = await api.get(`/api/tracks?conferenceId=${conferenceId}`).catch(() => []);
          if (Array.isArray(data) && data.length > 0) {
            loadedTracks = data
              .filter(t => t.isEnabled !== false && t.enabled !== false)
              .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          }
        }

        // Fallback to conference scientificSessions or default tracks
        if (loadedTracks.length === 0) {
          if (conference?.scientificSessions && conference.scientificSessions.length > 0) {
            loadedTracks = conference.scientificSessions.map((s, idx) => ({
              id: `session-${idx}`,
              name: typeof s === 'string' ? s : (s.title || s.name || `Session Track ${idx + 1}`),
              shortDescription: typeof s === 'string' ? `Deep-dive presentations and research topics on ${s}.` : s.desc,
              isEnabled: true,
              displayOrder: idx
            }));
          } else if (conference?.sessions && conference.sessions.length > 0) {
            loadedTracks = conference.sessions.map((s, idx) => ({
              id: s.id || `session-${idx}`,
              name: s.title || s.name || `Session Track ${idx + 1}`,
              shortDescription: s.desc || s.description || "Research presentations and key discussions.",
              isEnabled: true,
              displayOrder: idx
            }));
          } else {
            loadedTracks = [
              { id: 1, name: "Advanced Methodologies & Computational Techniques", shortDescription: "State-of-the-art computational tools, algorithms, and applied frameworks.", isEnabled: true, displayOrder: 1 },
              { id: 2, name: "Keynote Speeches & Global Panel Discussions", shortDescription: "High-level panel reviews by internationally recognized scientists.", isEnabled: true, displayOrder: 2 },
              { id: 3, name: "Oral & Paper Abstract Presentations", shortDescription: "Selected research submissions and case study reviews.", isEnabled: true, displayOrder: 3 },
              { id: 4, name: "Young Research Forum & Poster Presentations", shortDescription: "Emerging scholars presenting breakthrough scientific posters.", isEnabled: true, displayOrder: 4 },
              { id: 5, name: "Industry Innovations & Emerging Technologies", shortDescription: "Commercial applications, industrial breakthroughs, and patents.", isEnabled: true, displayOrder: 5 }
            ];
          }
        }

        setTracks(loadedTracks);
      } catch (error) {
        console.error("Failed to load scientific tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [conferenceId, conference]);

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'featured') {
      return matchesSearch && t.isFeatured;
    }
    return matchesSearch;
  });

  return (
    <div className="tracks-page-container" id="scientific-tracks">
      <SEOHead
        title={`Scientific Tracks & Sessions | ${conference?.title || "Conference"}`}
        description={`Explore the scientific tracks, sessions, and research topics covered in ${conference?.title || "our conference"}.`}
        keywords={`scientific tracks, sessions, research topics, call for papers, ${conference?.title || ""}`}
        ogTitle={`Scientific Tracks & Sessions | ${conference?.title || "Conference"}`}
        ogDescription={`Explore research tracks and submit abstracts for ${conference?.title || "our conference"}.`}
      />

      <div className="tracks-header">
        <h1>Scientific Tracks & Topics</h1>
        <p>Explore the diverse range of scientific topics, sessions, and cutting-edge research areas covered in this conference.</p>
      </div>

      <div className="tracks-controls">
        <div className="tracks-filters">
          <button 
            className={`track-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Tracks ({tracks.length})
          </button>
          {tracks.some(t => t.isFeatured) && (
            <button 
              className={`track-filter-btn ${filter === 'featured' ? 'active' : ''}`}
              onClick={() => setFilter('featured')}
            >
              Featured Tracks
            </button>
          )}
        </div>
        <div className="tracks-search">
          <span className="tracks-search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search topics or keywords..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
          Loading Scientific Tracks...
        </div>
      ) : (
        <>
          <div className="tracks-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "12px 40px" }}>
            {filteredTracks.map(track => (
              <div 
                key={track.id} 
                onClick={() => setSelectedTrack(track)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#f8fafc",
                  padding: "16px 20px",
                  fontSize: "15px",
                  fontWeight: "600",
                  color: "#0f172a",
                  cursor: "pointer",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                  e.currentTarget.style.borderColor = "#93c5fd";
                  e.currentTarget.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#0f172a";
                }}
              >
                <span>{track.name}</span>
                <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "normal" }}>View Details →</span>
              </div>
            ))}
          </div>

          {filteredTracks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b', fontSize: '16px' }}>
              No tracks found matching your search criteria.
            </div>
          )}

          <div style={{ marginTop: "40px", display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to={getSubRoutePath ? getSubRoutePath("submit-abstract") : "/submit-abstract"} className="btn-conf-submit" style={{ textDecoration: "none" }}>
              Submit Abstract for Track
            </Link>
            <Link to={getSubRoutePath ? getSubRoutePath("register") : "/register"} className="btn-conf-download" style={{ textDecoration: "none" }}>
              Register for Conference
            </Link>
          </div>
        </>
      )}

      {selectedTrack && (
        <div className="track-modal-overlay" onClick={() => setSelectedTrack(null)}>
          <div className="track-modal-content" onClick={e => e.stopPropagation()}>
            <button className="track-modal-close" onClick={() => setSelectedTrack(null)}>&times;</button>
            
            <div 
              className="track-modal-header"
              style={{ backgroundImage: selectedTrack.trackBannerImage ? `url(${selectedTrack.trackBannerImage})` : 'linear-gradient(135deg, #0f172a, #1e293b)' }}
            >
              <div className="track-modal-title-wrapper">
                {selectedTrack.trackIcon && (
                  <div className="track-modal-icon">
                    <img src={selectedTrack.trackIcon} alt="Icon" />
                  </div>
                )}
                <h2 className="track-modal-title">{selectedTrack.name}</h2>
              </div>
            </div>
            
            <div className="track-modal-body">
              <div className="track-modal-desc" dangerouslySetInnerHTML={{ __html: (selectedTrack.detailedDescription || selectedTrack.shortDescription || "We welcome submissions, oral presentations, and discussions for this scientific track.").replace(/\n/g, '<br/>') }} />
              
              {selectedTrack.keywords && (
                <div style={{ marginTop: "20px" }}>
                  <h4 className="track-modal-section-title">Related Keywords</h4>
                  <div className="track-modal-keywords">
                    {selectedTrack.keywords.split(',').map((kw, i) => (
                      <span key={i} className="track-modal-keyword">{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" }}>
                <Link to={getSubRoutePath ? getSubRoutePath("submit-abstract") : "/submit-abstract"} className="btn-conf-submit" style={{ textDecoration: "none", fontSize: "14px", padding: "8px 20px" }}>
                  Submit Abstract
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceTracks;
