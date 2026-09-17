import React, { useState, useEffect } from "react";
import { useOutletContext, useLocation } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import SEOHead from "../components/SEOHead";
import "./ConferenceAgenda.css";
import "./ConferenceProgram.css";

const ConferenceProgram = () => {
  const { conference } = useOutletContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryCategoryId = queryParams.get("categoryId");

  // Agenda Days State (Primary Source of Scientific Program)
  const [agendaDays, setAgendaDays] = useState([]);
  const [activeAgendaDayId, setActiveAgendaDayId] = useState(null);
  const [selectedAgendaDetail, setSelectedAgendaDetail] = useState(null);

  // Fallback Program Categories / Items State
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(queryCategoryId || null);
  const [items, setItems] = useState([]);
  const [categoryName, setCategoryName] = useState("Scientific Program Schedule");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgramAndAgenda = async () => {
      if (!conference?.id) return;
      setLoading(true);
      try {
        // 1. Fetch Agenda Days (Full Conference Agenda Timetable)
        const agendaData = await api.get(`/api/agenda/days?conferenceId=${conference.id}`).catch(() => []);
        if (Array.isArray(agendaData) && agendaData.length > 0) {
          const sortedDays = agendaData.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setAgendaDays(sortedDays);
          if (sortedDays.length > 0) {
            setActiveAgendaDayId(sortedDays[0].id);
          }
        }

        // 2. Fetch Program Categories & Items as secondary / legacy fallback
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
          // 3. Fallback to general sessions
          const sessionsData = await api.get(`/api/sessions?conferenceId=${conference.id}`).catch(() => []);
          if (Array.isArray(sessionsData)) setSessions(sessionsData);
        }
      } catch (err) {
        console.error("Failed to load scientific program & agenda details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramAndAgenda();
  }, [conference?.id, queryCategoryId]);

  const formatDateRangeAndLocation = () => {
    if (!conference?.startDate || !conference?.endDate) {
      return { formattedDate: conference?.date || "", venue: conference?.venue || "" };
    }
    try {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const startParts = conference.startDate.split('-');
      const endParts = conference.endDate.split('-');

      if (startParts.length === 3 && endParts.length === 3) {
        const startYear = startParts[0];
        const startMonth = months[parseInt(startParts[1]) - 1];
        const startDay = parseInt(startParts[2]);

        const endYear = endParts[0];
        const endMonth = months[parseInt(endParts[1]) - 1];
        const endDay = parseInt(endParts[2]);

        let formattedDate = "";
        if (startYear === endYear) {
          if (startMonth === endMonth) {
            if (startDay === endDay) {
              formattedDate = `${startMonth} ${startDay}, ${startYear}`;
            } else {
              formattedDate = `${startMonth} ${startDay}–${endDay}, ${startYear}`;
            }
          } else {
            formattedDate = `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`;
          }
        } else {
          formattedDate = `${startMonth} ${startDay}, ${startYear} – ${endMonth} ${endDay}, ${endYear}`;
        }

        return {
          formattedDate,
          venue: conference.venue
        };
      }
    } catch (e) {
      console.error("Error formatting date range:", e);
    }
    return { formattedDate: conference?.date || "", venue: conference?.venue || "" };
  };

  const { formattedDate, venue } = formatDateRangeAndLocation();

  const getDayDateString = (dayNumber) => {
    if (!conference?.startDate) return "";
    try {
      const start = new Date(conference.startDate);
      start.setDate(start.getDate() + (dayNumber - 1));
      return start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
        year: "numeric"
      });
    } catch (e) {
      return "";
    }
  };

  const getDayTabTitle = (d) => {
    if (!conference?.startDate) return d.dayTitle || `DAY ${d.dayNumber}`;
    try {
      const start = new Date(conference.startDate);
      start.setDate(start.getDate() + (d.dayNumber - 1));
      const monthStr = start.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
      const dayStr = start.toLocaleDateString("en-US", { day: "2-digit" });
      return `${d.dayTitle || `DAY ${d.dayNumber}`} - ${monthStr} ${dayStr}`;
    } catch (e) {
      return d.dayTitle || `DAY ${d.dayNumber}`;
    }
  };

  const getSessionTypeBadgeStyle = (type) => {
    switch (type) {
      case "Keynote":
      case "Keynote Address":
      case "Keynote Session":
        return { bg: "#fef08a", color: "#854d0e" };
      case "Break":
      case "Lunch":
      case "Tea Break":
        return { bg: "#f1f5f9", color: "#475569" };
      case "Technical Session":
      case "Oral Presentation":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "Poster Session":
        return { bg: "#fce7f3", color: "#9d174d" };
      case "Workshop":
        return { bg: "#dcfce3", color: "#166534" };
      case "Panel Discussion":
        return { bg: "#fae8ff", color: "#86198f" };
      case "Opening Ceremony":
        return { bg: "#fed7aa", color: "#9a3412" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

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

  const hasAgendaData = agendaDays && agendaDays.length > 0 && agendaDays.some(d => d.sessions && d.sessions.length > 0);

  return (
    <section className="conf-subpage-section">
      <SEOHead
        title={`Scientific Program & Agenda | ${conference?.title || "Conference"}`}
        description={`View the scientific program, presentation sessions, oral schedules, timetable, and speaker agenda for ${conference?.title || "our conference"}.`}
        keywords={`scientific program, agenda, timetable, oral schedule, sessions, keynote, ${conference?.title || ""}`}
        ogTitle={`Scientific Program & Agenda | ${conference?.title || "Conference"}`}
        ogDescription={`Complete scientific timetable, schedule, and sessions for ${conference?.title || "our conference"}.`}
      />

      <div className="conf-subpage-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <span className="sponsors-tag-pill" style={{ display: "inline-block", padding: "4px 14px", background: "var(--conf-primary, #2563eb)", color: "#fff", borderRadius: "20px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
            Scientific Timetable
          </span>
          <h2 className="conf-page-title" style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
            Scientific Program & Timetable
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", maxWidth: "680px", margin: "0 auto 24px auto" }}>
            Explore scheduled keynotes, oral presentations, breaks, and workshops. Click any presentation row to view detailed abstract and presenter information.
          </p>

          {/* Download & Print Action Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginTop: "10px" }}>
            {conference?.agendaPdfPath && (
              <a
                href={`${BASE_URL}${conference.agendaPdfPath}`}
                target="_blank"
                rel="noreferrer"
                className="btn-download-agenda-premium"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
              >
                📄 Download Program PDF
              </a>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-print-program-premium"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              🖨️ Print Program
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b", fontSize: "16px" }}>
            Loading scientific schedule & agenda...
          </div>
        ) : hasAgendaData ? (
          /* ========================================================================= */
          /* 1. PRIMARY VIEW: FULL DAY-BY-DAY AGENDA TIMETABLE                          */
          /* ========================================================================= */
          <React.Fragment>
            {/* Day Switcher Tabs */}
            <div className="classic-agenda-tabs max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-2 scrollbar-hide">
              {agendaDays.map((d) => (
                <button
                  type="button"
                  key={d.id}
                  className={`classic-tab-btn ${activeAgendaDayId === d.id ? "active" : ""}`}
                  onClick={() => setActiveAgendaDayId(d.id)}
                >
                  {getDayTabTitle(d)}
                </button>
              ))}
            </div>

            {(() => {
              const activeD = agendaDays.find(d => d.id === activeAgendaDayId) || agendaDays[0];
              const activeSessionsList = activeD ? activeD.sessions || [] : [];

              // Group by hall
              const groupedByHall = {};
              activeSessionsList.filter(s => s.status !== "INACTIVE").forEach(s => {
                const h = s.hall || "Main Conference Hall";
                if (!groupedByHall[h]) groupedByHall[h] = [];
                groupedByHall[h].push(s);
              });

              return (
                <div className="classic-agenda-layout max-md:flex max-md:flex-col" style={{ marginBottom: "50px" }}>
                  {/* Left Timeline Anchor */}
                  <div className="classic-timeline-sidebar no-print max-md:w-full max-md:flex max-md:flex-row max-md:items-center max-md:justify-between max-md:mb-6 max-md:border-none">
                    <div className="classic-timeline-day">
                      {activeD?.dayTitle || `DAY ${activeD?.dayNumber}`} AGENDA<br />
                      <span style={{ fontWeight: 'normal', fontSize: '13px', color: '#64748b' }}>
                        {getDayDateString(activeD?.dayNumber)}
                      </span>
                    </div>
                    <div className="classic-timeline-time-block">
                      <div className="classic-time-label">08:00</div>
                      <div className="classic-timeline-line">
                        <div className="classic-timeline-arrow"></div>
                      </div>
                      <div className="classic-time-label">18:00</div>
                    </div>
                  </div>

                  {/* Main Container */}
                  <div className="classic-agenda-container">
                    <div className="classic-agenda-header-box">
                      <h2 className="classic-conf-title">{conference.title || "Conference Title"}</h2>
                      {conference.shortName && (
                        <h3 className="classic-conf-subtitle">({conference.shortName})</h3>
                      )}
                      <div className="classic-conf-date-loc">
                        {formattedDate}{venue ? ` | ${venue}` : ""}
                      </div>
                    </div>

                    {Object.keys(groupedByHall).length === 0 ? (
                      <p style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                        No active sessions scheduled for this day yet.
                      </p>
                    ) : (
                      Object.keys(groupedByHall).map(hall => {
                        const hallSessions = groupedByHall[hall].sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

                        return (
                          <div key={hall} className="classic-hall-group">
                            <div className="classic-hall-header">Scientific Program</div>
                            <div className="classic-hall-header">{activeD?.dayTitle || `Day ${activeD?.dayNumber}`} - {getDayDateString(activeD?.dayNumber)}</div>
                            <div className="classic-hall-header">{hall}</div>

                            <table className="classic-agenda-table max-md:block">
                              <tbody className="max-md:block">
                                {hallSessions.map(slot => {
                                  const isMerged = !slot.speakerName || 
                                    slot.sessionType?.toLowerCase().includes('break') || 
                                    slot.sessionType?.toLowerCase().includes('registration') || 
                                    slot.sessionType?.toLowerCase().includes('opening');

                                  if (isMerged) {
                                    const isPurple = slot.sessionType?.toLowerCase().includes('break') || slot.sessionType?.toLowerCase().includes('keynote');
                                    return (
                                      <tr key={slot.id} className="classic-merged-row">
                                        <td colSpan="3" className={`classic-merged-cell ${isPurple ? 'text-purple' : 'text-green'} max-md:block max-md:text-center max-md:p-4 max-md:border max-md:border-gray-100 max-md:rounded-lg max-md:mb-4`}>
                                          {slot.sessionTitle} {slot.startTime ? `(${slot.startTime} - ${slot.endTime})` : ''}
                                        </td>
                                      </tr>
                                    );
                                  }

                                  return (
                                    <tr
                                      key={slot.id}
                                      className="classic-data-row max-md:block max-md:mb-4 max-md:border max-md:border-gray-200 max-md:rounded-lg max-md:bg-white max-md:shadow-sm"
                                      onClick={() => setSelectedAgendaDetail(slot)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <td className="classic-presenter-cell max-md:block max-md:p-4">
                                        <div className="classic-presenter-name">{slot.speakerName}</div>
                                        <div className="classic-presenter-org">
                                          {slot.organization}{slot.country ? `, ${slot.country}` : ""}
                                        </div>
                                      </td>
                                      <td className="classic-time-cell max-md:block max-md:text-left max-md:px-4 max-md:font-bold">
                                        {slot.startTime} - {slot.endTime}
                                      </td>
                                      <td className="classic-title-cell max-md:block max-md:text-left max-md:p-4">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                          <span>{slot.sessionTitle}</span>
                                          {slot.sessionType && (
                                            <span style={{
                                              fontSize: '11px',
                                              padding: '2px 8px',
                                              borderRadius: '10px',
                                              fontWeight: '600',
                                              background: getSessionTypeBadgeStyle(slot.sessionType).bg,
                                              color: getSessionTypeBadgeStyle(slot.sessionType).color
                                            }}>
                                              {slot.sessionType}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}
          </React.Fragment>
        ) : categories.length > 0 ? (
          /* ========================================================================= */
          /* 2. SECONDARY VIEW: PROGRAM CATEGORIES / ITEMS                             */
          /* ========================================================================= */
          <div>
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
                        border: isActive ? "1px solid var(--conf-primary, #2563eb)" : "1px solid #cbd5e1",
                        background: isActive ? "var(--conf-primary, #2563eb)" : "#ffffff",
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

            <div className="program-plain-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {items.length > 0 ? (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="program-plain-session"
                    style={{
                      background: "#ffffff",
                      padding: "20px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                      border: "1px solid #e2e8f0",
                      borderLeftWidth: "4px",
                      borderLeftColor: "var(--conf-primary, #2563eb)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                      <p className="program-plain-time" style={{ margin: 0, fontWeight: "700", color: "var(--conf-primary, #2563eb)", fontSize: "15px" }}>
                        {item.date && <span>📅 {item.date} | </span>}
                        ⏰ {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
                      </p>
                      {item.venue && (
                        <span style={{ fontSize: "13px", background: "var(--conf-bg-accent, #eff6ff)", color: "var(--conf-primary, #2563eb)", padding: "4px 10px", borderRadius: "6px", fontWeight: "600" }}>
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
          </div>
        ) : (
          /* ========================================================================= */
          /* 3. FALLBACK VIEW: GENERAL SESSIONS OR EMPTY STATE                         */
          /* ========================================================================= */
          <div className="program-plain-container" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {sessions.map((session) => (
              <div key={session.id} className="program-plain-session" style={{ padding: "16px", background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", borderLeftWidth: "4px", borderLeftColor: "var(--conf-primary, #2563eb)" }}>
                <p className="program-plain-time" style={{ color: "var(--conf-primary, #2563eb)", fontWeight: "700", margin: "0 0 6px 0" }}>
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
                <h3 style={{ fontSize: "20px", color: "#334155", marginBottom: "12px" }}>Scientific Program Schedule to be Announced</h3>
                <p style={{ color: "#64748b", maxWidth: "500px", margin: "0 auto" }}>
                  The presentation timetable, oral presentation slots, and day-by-day scientific agenda are currently being curated. Please check back soon for complete updates.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Session Abstract & Presenter Details Modal */}
      {selectedAgendaDetail && (
        <div className="conf-modal-overlay" onClick={() => setSelectedAgendaDetail(null)}>
          <div className="conf-modal-premium" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden' }}>
            <button className="conf-modal-close" onClick={() => setSelectedAgendaDetail(null)}>×</button>

            <div className="agenda-modal-header-premium">
              <span className="type-badge" style={{
                background: getSessionTypeBadgeStyle(selectedAgendaDetail.sessionType).bg,
                color: getSessionTypeBadgeStyle(selectedAgendaDetail.sessionType).color,
                marginBottom: '12px',
                display: 'inline-block'
              }}>
                {selectedAgendaDetail.sessionType || "Presentation"}
              </span>
              <h2 className="agenda-modal-main-title">
                {selectedAgendaDetail.sessionTitle}
              </h2>
            </div>

            <div className="agenda-modal-body-premium">
              <div className="agenda-modal-meta-grid">
                <div className="agenda-meta-item">
                  <div className="agenda-meta-label">🕒 Time</div>
                  <div className="agenda-meta-value">{selectedAgendaDetail.startTime} - {selectedAgendaDetail.endTime}</div>
                </div>
                <div className="agenda-meta-item">
                  <div className="agenda-meta-label">📍 Venue</div>
                  <div className="agenda-meta-value">{selectedAgendaDetail.hall || 'Main Hall'}</div>
                </div>
                {selectedAgendaDetail.track && (
                  <div className="agenda-meta-item">
                    <div className="agenda-meta-label">📑 Track</div>
                    <div className="agenda-meta-value">{selectedAgendaDetail.track}</div>
                  </div>
                )}
                {selectedAgendaDetail.chairperson && (
                  <div className="agenda-meta-item">
                    <div className="agenda-meta-label">👤 Session Chair</div>
                    <div className="agenda-meta-value">{selectedAgendaDetail.chairperson}</div>
                  </div>
                )}
              </div>

              {selectedAgendaDetail.speakerName && (
                <div className="agenda-presenter-card">
                  <div className="agenda-presenter-avatar-placeholder">
                    {selectedAgendaDetail.speakerName.charAt(0)}
                  </div>
                  <div>
                    <div className="agenda-meta-label" style={{ marginBottom: '2px' }}>Presenter</div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '800' }}>
                      {selectedAgendaDetail.speakerName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                      {selectedAgendaDetail.organization}{selectedAgendaDetail.country ? `, ${selectedAgendaDetail.country}` : ''}
                    </div>
                  </div>
                </div>
              )}

              {selectedAgendaDetail.description && (
                <div className="agenda-modal-description">
                  <h3 style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700', marginBottom: '8px' }}>Session Overview</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedAgendaDetail.description}</p>
                </div>
              )}

              {selectedAgendaDetail.abstractText && (
                <div className="agenda-modal-description">
                  <h3 style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700', marginBottom: '8px' }}>Abstract</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedAgendaDetail.abstractText}</p>
                </div>
              )}

              {selectedAgendaDetail.biography && (
                <div className="agenda-modal-description" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', marginTop: '15px' }}>
                  <h3 style={{ fontSize: '15px', color: '#0f172a', fontWeight: '700', marginBottom: '8px' }}>Speaker Biography</h3>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedAgendaDetail.biography}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ConferenceProgram;
