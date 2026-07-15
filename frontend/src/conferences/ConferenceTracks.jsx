import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useOutletContext } from 'react-router-dom';
import './ConferenceTracks.css';

const ConferenceTracks = () => {
  const { conference } = useOutletContext();
  const conferenceId = conference?.id;
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'featured'
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const data = await api.get(`/api/tracks?conferenceId=${conferenceId}`);
        // Only show enabled tracks
        setTracks(data.filter(t => t.isEnabled).sort((a, b) => a.displayOrder - b.displayOrder));
      } catch (error) {
        console.error("Failed to load scientific tracks:", error);
      } finally {
        setLoading(false);
      }
    };
    if (conferenceId) {
      fetchTracks();
    }
  }, [conferenceId]);

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.keywords?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'featured') {
      return matchesSearch && t.isFeatured;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="tracks-page-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{color: '#64748b', fontSize: '18px'}}>Loading Scientific Tracks...</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return null; // Don't render anything if no tracks exist
  }

  return (
    <div className="tracks-page-container" id="scientific-tracks">
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
            All Tracks
          </button>
          <button 
            className={`track-filter-btn ${filter === 'featured' ? 'active' : ''}`}
            onClick={() => setFilter('featured')}
          >
            Featured Tracks
          </button>
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

      <div className="tracks-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "8px 40px" }}>
        {filteredTracks.map(track => (
          <div 
            key={track.id} 
            onClick={() => setSelectedTrack(track)}
            style={{
              display: "block",
              backgroundColor: "#e2e8f0",
              padding: "12px 16px",
              fontSize: "15px",
              fontWeight: "600",
              color: "#0f172a",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "8px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#cbd5e1";
              e.currentTarget.style.color = "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e8f0";
              e.currentTarget.style.color = "#0f172a";
            }}
          >
            {track.name}
          </div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div style={{textAlign: 'center', padding: '60px 20px', color: '#64748b', fontSize: '16px'}}>
          No tracks found matching your search criteria.
        </div>
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
              <div className="track-modal-desc" dangerouslySetInnerHTML={{ __html: (selectedTrack.detailedDescription || selectedTrack.shortDescription || "No detailed description provided.").replace(/\n/g, '<br/>') }} />
              
              {selectedTrack.keywords && (
                <div>
                  <h4 className="track-modal-section-title">Related Keywords</h4>
                  <div className="track-modal-keywords">
                    {selectedTrack.keywords.split(',').map((kw, i) => (
                      <span key={i} className="track-modal-keyword">{kw.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConferenceTracks;
