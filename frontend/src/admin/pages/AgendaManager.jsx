import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api, BASE_URL } from '../../utils/api';

const AgendaManager = () => {
  const { activeConferenceId } = useAdmin();
  const [days, setDays] = useState([]);
  const [activeDayId, setActiveDayId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [conferenceDetails, setConferenceDetails] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Day Modal
  const [showDayModal, setShowDayModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [dayFormData, setDayFormData] = useState({
    dayNumber: 1,
    dayTitle: ""
  });

  // Session Modal
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionFormData, setSessionFormData] = useState({
    startTime: "",
    endTime: "",
    sessionTitle: "",
    sessionType: "Technical Session",
    speakerName: "",
    organization: "",
    country: "",
    hall: "",
    track: "",
    chairperson: "",
    description: "",
    abstractText: "",
    biography: "",
    status: "ACTIVE"
  });

  // CSV Bulk Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);

  // Presets
  const sessionTypePresets = [
    "Registration",
    "Opening Ceremony",
    "Keynote Address",
    "Technical Session",
    "Workshop",
    "Poster Session",
    "Panel Discussion",
    "Tea Break",
    "Lunch",
    "Closing Ceremony"
  ];

  const statusPresets = ["ACTIVE", "INACTIVE", "CANCELLED"];

  useEffect(() => {
    if (activeConferenceId) {
      fetchDays();
      fetchConferenceDetails();
    } else {
      setDays([]);
      setActiveDayId(null);
      setConferenceDetails(null);
    }
  }, [activeConferenceId]);

  const fetchConferenceDetails = async () => {
    try {
      const details = await api.get(`/api/conference-details?id=${activeConferenceId}`);
      setConferenceDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDays = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/admin/agenda/days?conferenceId=${activeConferenceId}`);
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setDays(sorted);
      if (sorted.length > 0 && !activeDayId) {
        setActiveDayId(sorted[0].id);
      }
    } catch (err) {
      setError("Failed to fetch agenda days.");
    } finally {
      setLoading(false);
    }
  };

  // Day Form
  const handleOpenDayModal = (day = null) => {
    setEditingDay(day);
    if (day) {
      setDayFormData({
        dayNumber: day.dayNumber,
        dayTitle: day.dayTitle || ""
      });
    } else {
      setDayFormData({
        dayNumber: days.length + 1,
        dayTitle: `Day ${days.length + 1}`
      });
    }
    setShowDayModal(true);
  };

  const handleSubmitDay = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...dayFormData,
        conferenceId: parseInt(activeConferenceId),
        displayOrder: editingDay ? editingDay.displayOrder : days.length
      };
      if (editingDay) {
        await api.put(`/api/admin/agenda/days/${editingDay.id}`, payload);
        setSuccess("Day updated successfully.");
      } else {
        const created = await api.post("/api/admin/agenda/days", payload);
        setActiveDayId(created.id);
        setSuccess("Day added successfully.");
      }
      setShowDayModal(false);
      fetchDays();
    } catch (err) {
      setError("Failed to save day.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDay = async (id) => {
    if (!window.confirm("Are you sure you want to delete this day and all its sessions?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/agenda/days/${id}`);
      setSuccess("Day deleted.");
      setActiveDayId(null);
      fetchDays();
    } catch (err) {
      setError("Failed to delete day.");
    } finally {
      setLoading(false);
    }
  };

  // Session Form
  const activeDay = days.find(d => d.id === activeDayId);
  const sessions = activeDay ? activeDay.sessions || [] : [];

  const handleOpenSessionModal = (session = null) => {
    setEditingSession(session);
    if (session) {
      setSessionFormData({
        startTime: session.startTime || "",
        endTime: session.endTime || "",
        sessionTitle: session.sessionTitle || "",
        sessionType: session.sessionType || "Technical Session",
        speakerName: session.speakerName || "",
        organization: session.organization || "",
        country: session.country || "",
        hall: session.hall || "",
        track: session.track || "",
        chairperson: session.chairperson || "",
        description: session.description || "",
        abstractText: session.abstractText || "",
        biography: session.biography || "",
        status: session.status || "ACTIVE"
      });
    } else {
      setSessionFormData({
        startTime: "",
        endTime: "",
        sessionTitle: "",
        sessionType: "Technical Session",
        speakerName: "",
        organization: "",
        country: "",
        hall: "",
        track: "",
        chairperson: "",
        description: "",
        abstractText: "",
        biography: "",
        status: "ACTIVE"
      });
    }
    setShowSessionModal(true);
  };

  const handleSubmitSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const timeRange = `${sessionFormData.startTime} - ${sessionFormData.endTime}`;
      const payload = {
        ...sessionFormData,
        timeRange,
        displayOrder: editingSession ? editingSession.displayOrder : sessions.length
      };

      if (editingSession) {
        await api.put(`/api/admin/agenda/sessions/${editingSession.id}`, payload);
        setSuccess("Session updated successfully!");
      } else {
        await api.post(`/api/admin/agenda/days/${activeDayId}/sessions`, payload);
        setSuccess("Session added successfully!");
      }
      setShowSessionModal(false);
      fetchDays();
    } catch (err) {
      setError("Failed to save session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/agenda/sessions/${id}`);
      setSuccess("Session deleted.");
      fetchDays();
    } catch (err) {
      setError("Failed to delete session.");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateSession = async (id) => {
    setLoading(true);
    try {
      await api.post(`/api/admin/agenda/sessions/${id}/duplicate`);
      setSuccess("Session duplicated successfully!");
      fetchDays();
    } catch (err) {
      setError("Failed to duplicate session.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSession = async (index, direction) => {
    const list = [...sessions];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    try {
      const ids = list.map(s => s.id);
      await api.put("/api/admin/agenda/sessions/reorder", ids);
      setSuccess("Session order saved.");
      fetchDays();
    } catch (err) {
      setError("Failed to save session order.");
    }
  };

  // Agenda PDF Upload
  const handlePdfUpload = async (e) => {
    e.preventDefault();
    if (!pdfFile) return;
    setLoading(true);
    try {
      const fileData = new FormData();
      fileData.append("file", pdfFile);
      const updated = await api.postMultipart(`/api/admin/conference-details/${activeConferenceId}/agenda-pdf`, fileData);
      setConferenceDetails(updated);
      setSuccess("Agenda PDF uploaded successfully!");
      setPdfFile(null);
    } catch (err) {
      setError("Failed to upload agenda PDF.");
    } finally {
      setLoading(false);
    }
  };

  // CSV Parser & Bulk Importer
  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
      
      const parsedRows = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple regex-based CSV splitter to handle quoted commas
        const cols = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
        const rowObj = {};
        headers.forEach((header, index) => {
          let val = cols[index] ? cols[index].trim() : "";
          val = val.replace(/^"|"$/g, ''); // remove outer quotes
          rowObj[header] = val;
        });
        parsedRows.push(rowObj);
      }
      setCsvPreview(parsedRows);
    };
    reader.readAsText(file);
  };

  const handleUploadCsvSubmit = async () => {
    if (csvPreview.length === 0 || !activeDayId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const sessionsPayload = csvPreview.map((row, index) => {
        const startTime = row.startTime || "";
        const endTime = row.endTime || "";
        return {
          startTime,
          endTime,
          timeRange: `${startTime} - ${endTime}`,
          sessionTitle: row.sessionTitle || "Untitled Session",
          sessionType: row.sessionType || "Technical Session",
          speakerName: row.speakerName || "",
          organization: row.organization || "",
          country: row.country || "",
          hall: row.hall || "",
          track: row.track || "",
          chairperson: row.chairperson || "",
          description: row.description || "",
          abstractText: row.abstractText || "",
          biography: row.biography || "",
          status: row.status || "ACTIVE",
          displayOrder: index
        };
      });

      await api.post(`/api/admin/agenda/days/${activeDayId}/sessions/batch`, sessionsPayload);
      setSuccess(`Successfully imported ${sessionsPayload.length} sessions!`);
      setCsvFile(null);
      setCsvPreview([]);
      fetchDays();
    } catch (err) {
      setError("Failed to bulk import sessions from CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Scientific Agenda Timelines</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Create multi-day schedules, assign tracks, halls, session chairs, and import CSV listings.
          </p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button className="btn-admin-primary" onClick={() => handleOpenDayModal()}>
            + Add Agenda Day
          </button>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px'}}>{success}</div>}

      {/* Agenda PDF upload component */}
      {activeConferenceId && (
        <div className="admin-card" style={{marginBottom: '20px'}}>
          <h3 style={{margin: '0 0 12px 0', fontSize: '15px'}}>Agenda PDF Attachment</h3>
          <form onSubmit={handlePdfUpload} style={{display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center'}}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={e => setPdfFile(e.target.files[0])} 
              style={{fontSize: '14px'}}
            />
            <button type="submit" disabled={!pdfFile || loading} className="btn-admin-primary">
              Upload PDF
            </button>
            {conferenceDetails?.agendaPdfPath && (
              <span style={{fontSize: '13px', color: '#16a34a', fontWeight: '600'}}>
                ✓ PDF Attached: <a href={`${BASE_URL}${conferenceDetails.agendaPdfPath}`} target="_blank" rel="noreferrer" style={{color: '#2563eb', textDecoration: 'underline'}}>View PDF</a>
              </span>
            )}
          </form>
        </div>
      )}

      {/* Multi-day schedule builder */}
      {days.length === 0 ? (
        <div className="admin-card" style={{textAlign: 'center', padding: '40px'}}>
          <div style={{fontSize: '32px', marginBottom: '10px'}}>📅</div>
          <h3>No Agenda Days Configured</h3>
          <p style={{color: '#64748b', fontSize: '14px', marginBottom: '20px'}}>Create Day 1, Day 2, or Day 3 to start placing time-slot sessions.</p>
          <button className="btn-admin-primary" onClick={() => handleOpenDayModal()}>
            Create Day 1
          </button>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px'}}>
          {/* Days sidebar list */}
          <div className="admin-card" style={{padding: '16px'}}>
            <h3 style={{margin: '0 0 12px 0', fontSize: '13px', textTransform: 'uppercase', color: '#64748b'}}>Program Days</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              {days.map(d => (
                <div key={d.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: activeDayId === d.id ? '#eff6ff' : '#f8fafc',
                  border: activeDayId === d.id ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }} onClick={() => setActiveDayId(d.id)}>
                  <div>
                    <div style={{fontWeight: '700', fontSize: '13px', color: activeDayId === d.id ? '#1e40af' : '#1e293b'}}>Day {d.dayNumber}</div>
                    <div style={{fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '120px'}}>{d.dayTitle}</div>
                  </div>
                  <div style={{display: 'flex', gap: '4px'}}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenDayModal(d); }} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px'}}>✏️</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteDay(d.id); }} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px'}}>❌</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day sessions scheduling portal */}
          <div className="admin-card" style={{padding: '20px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px', flexWrap: 'wrap', gap: '10px'}}>
              <div>
                <h3 style={{margin: 0}}>{activeDay ? `Day ${activeDay.dayNumber}: ${activeDay.dayTitle || 'Schedule'}` : 'Timelines'}</h3>
                <span style={{fontSize: '12px', color: '#64748b'}}>Total program sessions: {sessions.length}</span>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button className="btn-admin" onClick={() => handleOpenSessionModal()}>
                  + Add Single Session
                </button>
                <label className="btn-admin-primary" style={{cursor: 'pointer', display: 'inline-block'}}>
                  📥 CSV Bulk Import
                  <input type="file" accept=".csv" onChange={handleCsvChange} style={{display: 'none'}} />
                </label>
              </div>
            </div>

            {/* CSV Import Preview Panel */}
            {csvPreview.length > 0 && (
              <div style={{background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #3b82f6', marginBottom: '20px'}}>
                <h4 style={{margin: '0 0 10px 0'}}>CSV Parsing Preview ({csvPreview.length} sessions)</h4>
                <div style={{maxHeight: '150px', overflowY: 'auto', fontSize: '12px', background: '#fff', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', marginBottom: '10px'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse'}}>
                    <thead>
                      <tr style={{textAlign: 'left', borderBottom: '1px solid #cbd5e1'}}>
                        <th>Start</th>
                        <th>End</th>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Speaker</th>
                        <th>Affiliation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvPreview.map((row, rIdx) => (
                        <tr key={rIdx} style={{borderBottom: '1px solid #f1f5f9'}}>
                          <td>{row.startTime}</td>
                          <td>{row.endTime}</td>
                          <td>{row.sessionTitle}</td>
                          <td>{row.sessionType}</td>
                          <td>{row.speakerName}</td>
                          <td>{row.organization}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button type="button" className="btn-admin-primary" onClick={handleUploadCsvSubmit}>
                    Confirm & Bulk Upload
                  </button>
                  <button type="button" className="btn-admin" onClick={() => { setCsvFile(null); setCsvPreview([]); }} style={{background: '#fff', border: '1px solid #cbd5e1'}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="admin-table-container">
              <table className="admin-table">
                <thead style={{background: '#f8fafc'}}>
                  <tr>
                    <th>Time (Start-End)</th>
                    <th>Session Title</th>
                    <th>Type</th>
                    <th>Presenter & Affiliation</th>
                    <th>Hall / Room</th>
                    <th>Track</th>
                    <th>Reorder</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s, idx) => (
                    <tr key={s.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{fontWeight: '700', color: '#2563eb', fontSize: '13px'}}>
                        <div>{s.startTime || 'N/A'}</div>
                        <div style={{color: '#64748b', fontSize: '11px'}}>{s.endTime ? `to ${s.endTime}` : ''}</div>
                      </td>
                      <td>
                        <div style={{fontWeight: '600', color: '#0f172a'}}>{s.sessionTitle}</div>
                        {s.chairperson && (
                          <div style={{fontSize: '11px', color: '#b45309'}}>Chair: {s.chairperson}</div>
                        )}
                      </td>
                      <td>
                        <span style={{
                          background: '#eff6ff', color: '#1e40af', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600'
                        }}>
                          {s.sessionType}
                        </span>
                      </td>
                      <td style={{fontSize: '13px'}}>
                        <div style={{fontWeight: '600'}}>{s.speakerName || 'N/A'}</div>
                        <div style={{color: '#64748b', fontSize: '11px'}}>{s.organization}</div>
                      </td>
                      <td>
                        <span style={{background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600'}}>
                          {s.hall || 'Main Hall'}
                        </span>
                      </td>
                      <td style={{fontSize: '12px', color: '#64748b'}}>{s.track || 'General'}</td>
                      <td>
                        <div style={{display: 'flex', gap: '4px'}}>
                          <button type="button" className="btn-admin-sm" disabled={idx === 0} onClick={() => handleMoveSession(idx, -1)} style={{padding: '2px 6px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▲</button>
                          <button type="button" className="btn-admin-sm" disabled={idx === sessions.length - 1} onClick={() => handleMoveSession(idx, 1)} style={{padding: '2px 6px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer'}}>▼</button>
                        </div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <button className="btn-action-edit" onClick={() => handleDuplicateSession(s.id)} style={{background: '#dcfce7', color: '#166534', marginRight: '5px'}}>Duplicate</button>
                        <button className="btn-action-edit" onClick={() => handleOpenSessionModal(s)}>Edit</button>
                        <button className="btn-action-delete" onClick={() => handleDeleteSession(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                        No scheduled sessions placed for this day. Click Add Session or import CSV to build program timelines!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Day Form Modal */}
      {showDayModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{background: '#fff', borderRadius: '16px', width: '450px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'}}>
            <div style={{padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '16px'}}>{editingDay ? "Edit Day Details" : "Add Conference Day"}</h3>
              <button onClick={() => setShowDayModal(false)} style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>&times;</button>
            </div>
            <form onSubmit={handleSubmitDay} style={{padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Day Number *</label>
                <input required type="number" value={dayFormData.dayNumber} onChange={e => setDayFormData({...dayFormData, dayNumber: parseInt(e.target.value) || ''})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Day Subtitle *</label>
                <input required type="text" placeholder="e.g. Day 1 - Keynote Presentations" value={dayFormData.dayTitle} onChange={e => setDayFormData({...dayFormData, dayTitle: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
              </div>
              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px'}}>
                <button type="button" onClick={() => setShowDayModal(false)} style={{padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
                <button type="submit" disabled={loading} style={{padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>Save Day</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Form Modal */}
      {showSessionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{background: '#fff', borderRadius: '16px', width: '700px', maxWidth: '95%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'}}>
            <div style={{padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '16px'}}>{editingSession ? "Edit Session Details" : "Add Time-Slot Session"}</h3>
              <button onClick={() => setShowSessionModal(false)} style={{background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '20px 24px', overflowY: 'auto', flex: 1}}>
              <form id="sessionForm" onSubmit={handleSubmitSession} style={{display: 'flex', flexDirection: 'column', gap: '14px'}}>
                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Start Time *</label>
                    <input required type="text" placeholder="e.g. 09:00" value={sessionFormData.startTime} onChange={e => setSessionFormData({...sessionFormData, startTime: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>End Time *</label>
                    <input required type="text" placeholder="e.g. 09:30" value={sessionFormData.endTime} onChange={e => setSessionFormData({...sessionFormData, endTime: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Session Type *</label>
                    <select value={sessionFormData.sessionType} onChange={e => setSessionFormData({...sessionFormData, sessionType: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff'}}>
                      {sessionTypePresets.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Session Status</label>
                    <select value={sessionFormData.status} onChange={e => setSessionFormData({...sessionFormData, status: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff'}}>
                      {statusPresets.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Session Title *</label>
                  <input required type="text" placeholder="Keynote Lecture: Advanced Molecular Biotechnology" value={sessionFormData.sessionTitle} onChange={e => setSessionFormData({...sessionFormData, sessionTitle: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Speaker / Presenter Name</label>
                    <input type="text" placeholder="Prof. John Smith" value={sessionFormData.speakerName} onChange={e => setSessionFormData({...sessionFormData, speakerName: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Speaker Affiliation / Organization</label>
                    <input type="text" placeholder="Oxford University" value={sessionFormData.organization} onChange={e => setSessionFormData({...sessionFormData, organization: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Speaker Country</label>
                    <input type="text" placeholder="United Kingdom" value={sessionFormData.country} onChange={e => setSessionFormData({...sessionFormData, country: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Session Chairperson</label>
                    <input type="text" placeholder="Prof. Hans-Dieter Belitz" value={sessionFormData.chairperson} onChange={e => setSessionFormData({...sessionFormData, chairperson: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                </div>

                <div style={{display: 'flex', gap: '15px'}}>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Hall / Room</label>
                    <input type="text" placeholder="Main Hall" value={sessionFormData.hall} onChange={e => setSessionFormData({...sessionFormData, hall: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                  <div style={{flex: 1}}>
                    <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Track Name</label>
                    <input type="text" placeholder="Track 1: Advanced Food Biotechnology" value={sessionFormData.track} onChange={e => setSessionFormData({...sessionFormData, track: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1'}} />
                  </div>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Short Description</label>
                  <textarea rows="2" placeholder="Brief outline of the program slot..." value={sessionFormData.description} onChange={e => setSessionFormData({...sessionFormData, description: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical'}}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Presentation Abstract</label>
                  <textarea rows="3" placeholder="Scientific presentation abstract..." value={sessionFormData.abstractText} onChange={e => setSessionFormData({...sessionFormData, abstractText: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical'}}></textarea>
                </div>

                <div>
                  <label style={{display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600'}}>Speaker Biography</label>
                  <textarea rows="3" placeholder="Presenter biography profile details..." value={sessionFormData.biography} onChange={e => setSessionFormData({...sessionFormData, biography: e.target.value})} style={{width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical'}}></textarea>
                </div>
              </form>
            </div>

            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
              <button type="button" onClick={() => setShowSessionModal(false)} style={{padding: '8px 16px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer'}}>Cancel</button>
              <button type="submit" form="sessionForm" disabled={loading} style={{padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                {loading ? "Saving..." : "Save Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaManager;
