import React, { useState, useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceSpeakers.css";

const ConferenceSpeakers = () => {
  const { conference } = useOutletContext();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId") || "";
  const [speakers, setSpeakers] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);

  useEffect(() => {
    const fetchSpeakersAndCategory = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (conference && conference.id) queryParams.append("conferenceId", conference.id);
        
        let fetchedSpeakers = [];
        const data = await api.get(`/api/speakers?${queryParams.toString()}`);
        if (Array.isArray(data)) {
          fetchedSpeakers = data;
        }

        // Filter by category if categoryId is provided
        if (categoryId) {
          fetchedSpeakers = fetchedSpeakers.filter(s => s.categoryId && s.categoryId.toString() === categoryId);
          // Also fetch categories to get the name
          const catData = await api.get(`/api/speaker-categories?conferenceId=${conference.id}`);
          if (Array.isArray(catData)) {
            const currentCat = catData.find(c => c.id.toString() === categoryId);
            if (currentCat) setCategoryName(currentCat.categoryName);
          }
        }

        setSpeakers(fetchedSpeakers);
      } catch (err) {
        console.error("Failed to load speakers:", err);
      } finally {
        setLoading(false);
      }
    };
    if (conference?.id) {
      fetchSpeakersAndCategory();
    }
  }, [categoryId, conference?.id]);

  // Fallback speakers if database is empty
  const mockSpeakers = [
    { id: 1, name: "Dr. Andrea Miller", designation: "Professor of Food Microbiology", affiliation: "University of Valencia", country: "Spain", type: "keynote", photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2" },
    { id: 2, name: "Dr. Kenji Sato", designation: "Senior Nanotechnology Researcher", affiliation: "Tokyo Institute of Technology", country: "Japan", type: "keynote", photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" },
    { id: 3, name: "Prof. Sarah Higgins", designation: "Director of Nutritional Biochemistry", affiliation: "Oxford University", country: "UK", type: "oral", photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956" }
  ];

  const activeSpeakers = speakers.length > 0 ? speakers : mockSpeakers;

  return (
    <section className="conf-subpage-section">
      <SEOHead
        title={`${categoryName ? categoryName : "Scientific Committee & Speakers"} | ${conference?.title || "Conference"}`}
        description={`Explore the distinguished keynote speakers, advisory committee, and paper presenters for ${conference?.title || "our conference"}.`}
        keywords={`speakers, keynote, committee, advisory board, ${conference?.title || ""}`}
        ogTitle={`${categoryName ? categoryName : "Speakers & Committee"} | ${conference?.title || "Conference"}`}
        ogDescription={`Discover featured keynote speakers for ${conference?.title || "our conference"}.`}
      />
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">
          {categoryName ? categoryName : "Scientific Committee & Speakers"}
        </h2>
        {loading ? (
          <p>Loading speakers...</p>
        ) : (
          <div className="speakers-grid">
            {activeSpeakers.map((spk, idx) => (
              <div key={spk.id} className={`speaker-card ${idx % 2 === 0 ? 'color-orange' : 'color-pink'}`}>
                <div className="speaker-img-container">
                  <img 
                    src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : (spk.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e")} 
                    alt={spk.name} 
                    className="speaker-img"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e";
                    }}
                  />
                  <div className="speaker-overlay" onClick={() => setSelectedSpeaker(spk)} style={{cursor: 'pointer'}}>
                    <div className="plus-icon"></div>
                  </div>
                </div>
                <div className="speaker-info">
                  <h3 className="speaker-name">{spk.name}</h3>
                  <p className="speaker-designation-affiliation">
                    {spk.designation}{spk.affiliation ? `, ${spk.affiliation}` : ''}{spk.country ? ` - ${spk.country}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Speaker Details Modal */}
      {selectedSpeaker && (
        <div className="conf-modal-overlay" onClick={() => setSelectedSpeaker(null)}>
          <div className="conf-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="conf-modal-close" onClick={() => setSelectedSpeaker(null)}>×</button>
            <div className="conf-modal-content-grid">
              <div className="conf-modal-img-wrap">
                <img 
                  src={selectedSpeaker.photo?.fileName ? `${BASE_URL}/uploads/speakers/${selectedSpeaker.photo.fileName}` : (selectedSpeaker.photoUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e")} 
                  alt={selectedSpeaker.name}
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"; }}
                />
              </div>
              <div className="conf-modal-text-wrap">
                <h2>{selectedSpeaker.name}</h2>
                <p className="modal-role">
                  {(selectedSpeaker.type || "").toLowerCase().includes("advisory") 
                    ? "Advisory Board Member" 
                    : "Featured Speaker"}
                </p>
                <p className="modal-designation"><strong>{selectedSpeaker.designation}</strong></p>
                <p className="modal-affiliation">{selectedSpeaker.affiliation}{selectedSpeaker.country ? `, ${selectedSpeaker.country}` : ''}</p>
                <div className="modal-divider"></div>
                <div className="modal-bio">
                  <h3>Biography</h3>
                  <p>{selectedSpeaker.bio || "Biography details are pending publication."}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConferenceSpeakers;
