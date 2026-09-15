import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceProgram.css";

const ConferenceProgram = () => {
  const { conference, getSubRoutePath } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const queryCategoryId = queryParams.get("categoryId");

  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(queryCategoryId || null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("Scientific Program Schedule");
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchProgramStructure = async () => {
      if (!conference?.id) return;
      setLoading(true);
      try {
        const catData = await api.get(`/api/program-categories?conferenceId=${conference.id}`).catch(() => []);
        if (Array.isArray(catData) && catData.length > 0) {
          const sortedCats = catData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setCategories(sortedCats);

          let targetCatId = queryCategoryId;
          if (!targetCatId || !sortedCats.some(c => c.id.toString() === targetCatId.toString())) {
            targetCatId = sortedCats[0].id.toString();
          }
          setActiveCategoryId(targetCatId);

          const currentCat = sortedCats.find(c => c.id.toString() === targetCatId.toString());
          if (currentCat) setCategoryName(currentCat.categoryName);

          const itemsData = await api.get(`/api/program-items?categoryId=${targetCatId}`).catch(() => []);
          if (Array.isArray(itemsData)) setItems(itemsData);
        } else {
          // Fallback to general sessions
          const sessionsData = await api.get(`/api/sessions?conferenceId=${conference.id}`).catch(() => []);
          if (Array.isArray(sessionsData)) setSessions(sessionsData);
          setCategoryName("Scientific Program Schedule");
        }
      } catch (err) {
        console.error("Failed to load scientific program details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramStructure();
  }, [conference?.id, queryCategoryId]);

  const handleSelectCategory = async (cat) => {
    setActiveCategoryId(cat.id.toString());
    setCategoryName(cat.categoryName);
    setLoading(true);
    try {
      const itemsData = await api.get(`/api/program-items?categoryId=${cat.id}`);
      if (Array.isArray(itemsData)) setItems(itemsData);
    } catch (err) {
      console.error("Failed to load category items:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="conf-subpage-section">
      <SEOHead
        title={`${categoryName || "Scientific Program"} | ${conference?.title || "Conference"}`}
        description={`View the scientific program, presentation sessions, oral schedules, and timetable for ${conference?.title || "our conference"}.`}
        keywords={`program, agenda, scientific schedule, presentation schedule, sessions, ${conference?.title || ""}`}
        ogTitle={`${categoryName || "Scientific Program"} | ${conference?.title || "Conference"}`}
        ogDescription={`Complete scientific schedule and sessions for ${conference?.title || "our conference"}.`}
      />
      <div className="conf-subpage-container">
        <h2 className="conf-page-title">{categoryName}</h2>

        {/* Category Tabs if multiple categories exist */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
            {categories.map((cat) => {
              const isActive = activeCategoryId === cat.id.toString();
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: isActive ? "1px solid var(--conf-primary)" : "1px solid #cbd5e1",
                    background: isActive ? "var(--conf-primary)" : "#ffffff",
                    color: isActive ? "#ffffff" : "#334155",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                >
                  {cat.categoryName}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            Loading scientific schedule...
          </div>
        ) : categories.length > 0 ? (
          /* Render Dynamic Program Items */
          <div className="program-plain-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="program-plain-session"
                  style={{
                    borderLeft: "4px solid var(--conf-primary)",
                    paddingLeft: "18px",
                    background: "#ffffff",
                    padding: "20px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                    border: "1px solid #e2e8f0",
                    borderLeftWidth: "4px",
                    borderLeftColor: "var(--conf-primary)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                    <p className="program-plain-time" style={{ margin: 0, fontWeight: "700", color: "var(--conf-primary)", fontSize: "15px" }}>
                      {item.date && <span>📅 {item.date} | </span>}
                      ⏰ {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                    </p>
                    {item.venue && (
                      <span style={{ fontSize: "13px", background: "var(--conf-bg-accent, #fef2f2)", color: "var(--conf-primary, #e11d48)", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
                        📍 {item.venue}
                      </span>
                    )}
                  </div>
                  <h3 className="program-plain-title" style={{ margin: "6px 0 10px 0", fontSize: "19px", color: "#0f172a", fontWeight: "700" }}>
                    {item.title}
                  </h3>

                  {item.speakers && (
                    <p className="program-plain-speaker" style={{ margin: "0 0 6px 0", fontSize: "15px" }}>
                      <strong style={{ color: "#334155" }}>🎤 Speaker(s):</strong> {item.speakers}
                    </p>
                  )}

                  {item.chairPerson && (
                    <p className="program-plain-speaker" style={{ margin: "0 0 6px 0", fontSize: "14px", color: "#64748b" }}>
                      <strong>🪑 Session Chair:</strong> {item.chairPerson}
                    </p>
                  )}

                  {item.description && (
                    <p style={{ fontSize: "14px", color: "#475569", marginTop: "10px", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                      {item.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "8px" }}>No sessions scheduled under this category yet</h3>
                <p style={{ color: "#64748b", margin: 0 }}>The scientific program schedule is currently being finalized. Please check back soon.</p>
              </div>
            )}
          </div>
        ) : (
          /* Render General Sessions */
          <div className="program-plain-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sessions.map((session) => (
              <div key={session.id} className="program-plain-session" style={{ borderLeft: "4px solid var(--conf-primary)", padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeftWidth: "4px", borderLeftColor: "var(--conf-primary)" }}>
                <p className="program-plain-time" style={{ color: "var(--conf-primary)", fontWeight: "700", margin: "0 0 6px 0" }}>
                  ⏰ {session.timeRange || "Scheduled Session"}
                </p>
                <h3 className="program-plain-title" style={{ margin: "0 0 8px 0", fontSize: "17px", color: "#0f172a" }}>
                  {session.name}
                </h3>
                {session.speakerName && (
                  <p className="program-plain-speaker" style={{ margin: 0, color: "#475569" }}>
                    🎤 {session.speakerName}{session.affiliation ? `, ${session.affiliation}` : ""}
                  </p>
                )}
                {session.description && (
                  <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>{session.description}</p>
                )}
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                <h3 style={{ fontSize: "18px", color: "#334155", marginBottom: "8px" }}>Scientific Program Schedule to be Announced</h3>
                <p style={{ color: "#64748b", margin: 0 }}>The presentation timetable and oral slots are currently being curated.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConferenceProgram;
