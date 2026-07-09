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

      <div className="tracks-grid">
        {filteredTracks.map(track => (
          <div key={track.id} className="track-card" onClick={() => setSelectedTrack(track)}>
            {track.isFeatured && <div className="track-card-featured-badge">Featured</div>}
            
            <div 
              className="track-card-banner" 
              style={{ backgroundImage: track.trackBannerImage ? `url(${track.trackBannerImage})` : 'linear-gradient(135deg, #1e293b, #334155)' }}
            >
              {track.trackIcon && (
                <div className="track-card-icon">
                  <img src={track.trackIcon} alt={track.name} />
                </div>
              )}
            </div>
            
            <div className="track-card-content">
              <h3 className="track-card-title">{track.name}</h3>
              <div className="track-card-desc">
                {track.shortDescription || track.detailedDescription || "Explore this scientific track to learn more about the latest developments and research presentations."}
              </div>
              
              {track.keywords && (
                <div className="track-card-keywords">
                  {track.keywords.split(',').slice(0, 3).map((kw, i) => (
                    <span key={i} className="track-keyword">{kw.trim()}</span>
                  ))}
                  {track.keywords.split(',').length > 3 && <span className="track-keyword">+{track.keywords.split(',').length - 3}</span>}
                </div>
              )}
              
              <div className="track-card-footer">
                <span className="track-read-more">Read More <span>→</span></span>
              </div>
            </div>
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
