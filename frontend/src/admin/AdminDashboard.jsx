import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, BASE_URL } from "../utils/api";
import "./AdminDashboard.css";
import HeroManagement from "./HeroManagement";
import StatisticsManagement from "./StatisticsManagement";
import TrustBadgeManagement from "./TrustBadgeManagement";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // Data States
  const [metrics, setMetrics] = useState({
    registrations: 0,
    abstracts: 0,
    contacts: 0,
    brochures: 0,
    speakers: 0,
    sessions: 0,
  });

  const [registrations, setRegistrations] = useState([]);
  const [abstracts, setAbstracts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [brochures, setBrochures] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [confDetails, setConfDetails] = useState({
    id: "",
    tittle: "",
    startDate: "",
    endDate: "",
    venue: "",
    contactEmail: "",
    contactPhone: "",
    countdownEndDate: "",
    domainLink: "",
  });

  // Modal / Drawer Form States
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [speakerForm, setSpeakerForm] = useState({
    name: "",
    designation: "",
    affiliation: "",
    country: "",
    bio: "",
    type: "KEYNOTE_SPEAKER",
  });
  const [speakerPhotoFile, setSpeakerPhotoFile] = useState(null);

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    name: "",
    description: "",
    type: "KEYNOTE_SESSION",
    timeRange: "",
    speakerName: "",
    affiliation: "",
  });

  const [confPhotoFile, setConfPhotoFile] = useState(null);

  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(null);
  const [sponsorForm, setSponsorForm] = useState({
    sponsorName: "",
    description: "",
  });
  const [sponsorPhotoFile, setSponsorPhotoFile] = useState(null);

  // Check JWT authorization on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
    } else {
      loadOverviewMetrics();
    }
  }, [navigate]);

  // Load Tab-specific data
  useEffect(() => {
    if (activeTab === "overview") loadOverviewMetrics();
    else if (activeTab === "registrations") fetchRegistrations();
    else if (activeTab === "abstracts") fetchAbstracts();
    else if (activeTab === "contacts") fetchContacts();
    else if (activeTab === "brochures") fetchBrochures();
    else if (activeTab === "speakers") fetchSpeakers();
    else if (activeTab === "sessions") fetchSessions();
    else if (activeTab === "sponsors") fetchSponsors();
    else if (activeTab === "settings") fetchConfDetails();
  }, [activeTab]);

  const loadOverviewMetrics = async () => {
    setLoading(true);
    try {
      const regList = await api.get("/api/admin/registrations");
      const absList = await api.get("/api/admin/abstracts");
      const conList = await api.get("/api/admin/contacts");
      const broList = await api.get("/api/admin/brochures");
      const spkList = await api.get("/api/speakers");
      const sesList = await api.get("/api/sessions");

      setMetrics({
        registrations: regList?.length || 0,
        abstracts: absList?.length || 0,
        contacts: conList?.length || 0,
        brochures: broList?.length || 0,
        speakers: spkList?.length || 0,
        sessions: sesList?.length || 0,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to fetch dashboard metrics. Session may have expired.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const getFilenameFromPath = (path) => {
    if (!path) return "";
    return path.replace(/^.*[\\/]/, "");
  };

  // API Call helper functions
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/registrations");
      setRegistrations(data || []);
    } catch (e) { setError("Failed to fetch registrations."); }
    finally { setLoading(false); }
  };

  const fetchAbstracts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/abstracts");
      setAbstracts(data || []);
    } catch (e) { setError("Failed to fetch abstracts."); }
    finally { setLoading(false); }
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/contacts");
      setContacts(data || []);
    } catch (e) { setError("Failed to fetch contact submissions."); }
    finally { setLoading(false); }
  };

  const fetchBrochures = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/brochures");
      setBrochures(data || []);
    } catch (e) { setError("Failed to fetch brochure requests."); }
    finally { setLoading(false); }
  };

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/speakers");
      setSpeakers(data || []);
    } catch (e) { setError("Failed to fetch speakers."); }
    finally { setLoading(false); }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/sessions");
      setSessions(data || []);
    } catch (e) { setError("Failed to fetch sessions."); }
    finally { setLoading(false); }
  };

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/admin/sponsors");
      setSponsors(data || []);
    } catch (e) { setError("Failed to fetch sponsors."); }
    finally { setLoading(false); }
  };

  const fetchConfDetails = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/conference-details");
      if (data) {
        setConfDetails({
          id: data.id || "",
          tittle: data.tittle || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          venue: data.venue || "",
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || "",
          countdownEndDate: data.countdownEndDate || "",
          domainLink: data.domainLink || "",
        });
      }
    } catch (e) { setError("Failed to fetch conference configuration."); }
    finally { setLoading(false); }
  };

  // Speakers CRUD Handlers
  const handleSpeakerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let savedSpeaker;
      if (editingSpeaker) {
        // Update speaker details
        savedSpeaker = await api.put(`/api/admin/speakers/${editingSpeaker.id}`, speakerForm);
      } else {
        // Create speaker
        savedSpeaker = await api.post("/api/admin/speakers", speakerForm);
      }

      // If photo was chosen, upload photo
      if (speakerPhotoFile && savedSpeaker.id) {
        const formData = new FormData();
        formData.append("file", speakerPhotoFile);
        await api.postMultipart(`/api/admin/speakers/${savedSpeaker.id}/photo`, formData);
      }

      setSuccessMsg(editingSpeaker ? "Speaker profile updated!" : "Speaker profile created!");
      setShowSpeakerModal(false);
      setEditingSpeaker(null);
      setSpeakerForm({ name: "", designation: "", affiliation: "", country: "", bio: "", type: "KEYNOTE_SPEAKER" });
      setSpeakerPhotoFile(null);
      fetchSpeakers();
    } catch (err) {
      console.error(err);
      setError("Failed to save speaker profiles.");
    } finally {
      setLoading(false);
    }
  };

  const openEditSpeaker = (speaker) => {
    setEditingSpeaker(speaker);
    setSpeakerForm({
      name: speaker.name || "",
      designation: speaker.designation || "",
      affiliation: speaker.affiliation || "",
      country: speaker.country || "",
      bio: speaker.bio || "",
      type: speaker.type || "KEYNOTE_SPEAKER",
    });
    setShowSpeakerModal(true);
  };

  const deleteSpeaker = async (id) => {
    if (!window.confirm("Are you sure you want to delete this speaker?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/speakers/${id}`);
      setSuccessMsg("Speaker deleted!");
      fetchSpeakers();
    } catch (err) {
      setError("Failed to delete speaker.");
    } finally {
      setLoading(false);
    }
  };

  // Sessions CRUD Handlers
  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingSession) {
        await api.put(`/api/admin/sessions/${editingSession.id}`, sessionForm);
      } else {
        await api.post("/api/admin/sessions", sessionForm);
      }
      setSuccessMsg(editingSession ? "Session details updated!" : "Session details created!");
      setShowSessionModal(false);
      setEditingSession(null);
      setSessionForm({ name: "", description: "", type: "KEYNOTE_SESSION", timeRange: "", speakerName: "", affiliation: "" });
      fetchSessions();
    } catch (err) {
      setError("Failed to save session schedule.");
    } finally {
      setLoading(false);
    }
  };

  const openEditSession = (session) => {
    setEditingSession(session);
    setSessionForm({
      name: session.name || "",
      description: session.description || "",
      type: session.type || "KEYNOTE_SESSION",
      timeRange: session.timeRange || "",
      speakerName: session.speakerName || "",
      affiliation: session.affiliation || "",
    });
    setShowSessionModal(true);
  };

  const deleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/sessions/${id}`);
      setSuccessMsg("Session deleted!");
      fetchSessions();
    } catch (err) {
      setError("Failed to delete session.");
    } finally {
      setLoading(false);
    }
  };

  // Sponsors CRUD Handlers
  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      let savedSponsor;
      if (editingSponsor) {
        savedSponsor = await api.put(`/api/admin/sponsors/${editingSponsor.id}`, sponsorForm);
      } else {
        savedSponsor = await api.post("/api/admin/sponsors", sponsorForm);
      }

      if (sponsorPhotoFile && savedSponsor.id) {
        const formData = new FormData();
        formData.append("file", sponsorPhotoFile);
        await api.postMultipart(`/api/admin/sponsors/${savedSponsor.id}/image`, formData);
      }

      setSuccessMsg(editingSponsor ? "Sponsor updated!" : "Sponsor created!");
      setShowSponsorModal(false);
      setEditingSponsor(null);
      setSponsorForm({ sponsorName: "", description: "" });
      setSponsorPhotoFile(null);
      fetchSponsors();
    } catch (err) {
      console.error(err);
      setError("Failed to save sponsor details.");
    } finally {
      setLoading(false);
    }
  };

  const openEditSponsor = (sponsor) => {
    setEditingSponsor(sponsor);
    setSponsorForm({
      sponsorName: sponsor.sponsorName || "",
      description: sponsor.description || "",
    });
    setShowSponsorModal(true);
  };

  const deleteSponsor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) return;
    setLoading(true);
    try {
      await api.delete(`/api/admin/sponsors/${id}`);
      setSuccessMsg("Sponsor deleted!");
      fetchSponsors();
    } catch (err) {
      setError("Failed to delete sponsor.");
    } finally {
      setLoading(false);
    }
  };

  // Settings / Conference Update Handlers
  const handleConfDetailsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const savedConf = await api.post("/api/admin/conference-details", confDetails);
      
      if (confPhotoFile && savedConf.id) {
        const formData = new FormData();
        formData.append("file", confPhotoFile);
        await api.postMultipart(`/api/admin/conference-details/${savedConf.id}/photo`, formData);
      }
      setSuccessMsg("Conference settings successfully saved!");
      fetchConfDetails();
    } catch (err) {
      setError("Failed to save settings details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Endeavor" className="sidebar-logo" />
          <span>Admin Portal</span>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            📊 Overview
          </button>
          <button className={activeTab === "registrations" ? "active" : ""} onClick={() => setActiveTab("registrations")}>
            🎟️ Registrations
          </button>
          <button className={activeTab === "abstracts" ? "active" : ""} onClick={() => setActiveTab("abstracts")}>
            📄 Abstract Papers
          </button>
          <button className={activeTab === "speakers" ? "active" : ""} onClick={() => setActiveTab("speakers")}>
            🎙️ Speakers Manager
          </button>
          <button className={activeTab === "sessions" ? "active" : ""} onClick={() => setActiveTab("sessions")}>
            ⏰ Agenda & Sessions
          </button>
          <button className={activeTab === "sponsors" ? "active" : ""} onClick={() => setActiveTab("sponsors")}>
            🤝 Sponsors Manager
          </button>
          <button className={activeTab === "contacts" ? "active" : ""} onClick={() => setActiveTab("contacts")}>
            ✉️ Inquiries & Messages
          </button>
          <button className={activeTab === "brochures" ? "active" : ""} onClick={() => setActiveTab("brochures")}>
            📁 Brochure Logs
          </button>
          <button className={activeTab === "hero" ? "active" : ""} onClick={() => setActiveTab("hero")}>
            🖼️ Hero Banners
          </button>
          <button className={activeTab === "statistics" ? "active" : ""} onClick={() => setActiveTab("statistics")}>
            📊 Site Statistics
          </button>
          <button className={activeTab === "trust-badges" ? "active" : ""} onClick={() => setActiveTab("trust-badges")}>
            🏅 Trust Badges
          </button>
          <button className={activeTab === "settings" ? "active" : ""} onClick={() => setActiveTab("settings")}>
            ⚙️ Main Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout">Logout &rarr;</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="main-header">
          <h1>Conference Management Panel</h1>
          <div className="header-meta">
            <span>Welcome, Administrator</span>
          </div>
        </header>

        {successMsg && <div className="success-bar-alert">{successMsg}</div>}
        {error && <div className="error-bar-alert">{error}</div>}

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="dashboard-view">
            <h2>System Overview</h2>
            <div className="metrics-grid">
              <div className="metric-card" onClick={() => setActiveTab("registrations")}>
                <h3>Total Registrations</h3>
                <p>{metrics.registrations}</p>
                <span>Pass bookings logged</span>
              </div>
              <div className="metric-card" onClick={() => setActiveTab("abstracts")}>
                <h3>Submitted Abstracts</h3>
                <p>{metrics.abstracts}</p>
                <span>PDF / Word documents</span>
              </div>
              <div className="metric-card" onClick={() => setActiveTab("speakers")}>
                <h3>Speakers Managed</h3>
                <p>{metrics.speakers}</p>
                <span>Keynote & Presenters</span>
              </div>
              <div className="metric-card" onClick={() => setActiveTab("contacts")}>
                <h3>User Inquiries</h3>
                <p>{metrics.contacts}</p>
                <span>Contact mail items</span>
              </div>
            </div>
          </div>
        )}

        {/* REGISTRATIONS TABLE */}
        {activeTab === "registrations" && (
          <div className="dashboard-view">
            <h2>Registrations Database</h2>
            {loading ? <p>Loading registrations...</p> : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Registrant</th>
                      <th>Company</th>
                      <th>Country</th>
                      <th>Ticket Details</th>
                      <th>Price Details</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>#EC-0{reg.id}</td>
                        <td>
                          <strong>{reg.title} {reg.fullName}</strong>
                          <br />
                          <span className="subtext">{reg.email} | {reg.phone}</span>
                        </td>
                        <td>{reg.company}</td>
                        <td>{reg.country}</td>
                        <td>
                          <strong>{reg.packageType}</strong>
                          <br />
                          <span className="subtext">Add-on: {reg.addOns}</span>
                        </td>
                        <td>
                          <strong>{reg.currency === "USD" ? "$" : "€"}{reg.totalAmount}</strong>
                        </td>
                        <td>
                          <span className={`status-tag ${reg.paymentStatus?.toLowerCase()}`}>
                            {reg.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ABSTRACTS TABLE */}
        {activeTab === "abstracts" && (
          <div className="dashboard-view">
            <h2>Submitted Abstracts</h2>
            {loading ? <p>Loading abstracts...</p> : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Presenter</th>
                      <th>Company</th>
                      <th>Track & Session</th>
                      <th>Submission File</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abstracts.map((abs) => (
                      <tr key={abs.id}>
                        <td>#ABS-0{abs.id}</td>
                        <td>
                          <strong>{abs.fullName}</strong>
                          <br />
                          <span className="subtext">{abs.email} | {abs.phone} | {abs.designation}</span>
                        </td>
                        <td>{abs.company}, {abs.country}</td>
                        <td>
                          <strong>{abs.presentationType}</strong>
                          <br />
                          <span className="subtext">Session: {abs.sessionName}</span>
                        </td>
                        <td>
                          {abs.filePath ? (
                            <a 
                              href={abs.filePath} 
                              download={getFilenameFromPath(abs.filePath)}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-download-file"
                            >
                              📥 Download file
                            </a>
                          ) : "No file"}
                        </td>
                        <td>
                          <span className="status-tag submitted">SUBMITTED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SPEAKERS CRUD PANEL */}
        {activeTab === "speakers" && (
          <div className="dashboard-view">
            <div className="view-header">
              <h2>Keynote & Advisory Speakers</h2>
              <button className="btn-add-primary" onClick={() => {
                setEditingSpeaker(null);
                setSpeakerForm({ name: "", designation: "", affiliation: "", country: "", bio: "", type: "KEYNOTE_SPEAKER" });
                setSpeakerPhotoFile(null);
                setShowSpeakerModal(true);
              }}>
                + Add New Speaker
              </button>
            </div>

            {loading ? <p>Loading speakers...</p> : (
              <div className="speakers-crud-grid">
                {speakers.map((spk) => (
                  <div key={spk.id} className="spk-crud-card">
                    <div className="spk-card-photo">
                      <img 
                        src={spk.photo?.fileName ? `${BASE_URL}/uploads/speakers/${spk.photo.fileName}` : "https://randomuser.me/api/portraits/men/32.jpg"} 
                        alt={spk.name}
                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/32.jpg"; }} 
                      />
                    </div>
                    <div className="spk-card-info">
                      <h4>{spk.name}</h4>
                      <p>{spk.designation}</p>
                      <p className="affiliation">{spk.affiliation}, {spk.country}</p>
                      <span className="spk-type-badge">{spk.type}</span>
                    </div>
                    <div className="spk-card-actions">
                      <button className="btn-table-edit" onClick={() => openEditSpeaker(spk)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => deleteSpeaker(spk.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SPEAKER DRAWER / MODAL */}
            {showSpeakerModal && (
              <div className="drawer-overlay" onClick={() => setShowSpeakerModal(false)}>
                <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
                  <h3>{editingSpeaker ? "Edit Speaker Profile" : "Add New Speaker"}</h3>
                  <form onSubmit={handleSpeakerSubmit} className="drawer-form">
                    <div className="form-group-reg">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        value={speakerForm.name} 
                        onChange={(e) => setSpeakerForm({...speakerForm, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Designation *</label>
                      <input 
                        type="text" 
                        value={speakerForm.designation} 
                        onChange={(e) => setSpeakerForm({...speakerForm, designation: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Affiliation / University *</label>
                      <input 
                        type="text" 
                        value={speakerForm.affiliation} 
                        onChange={(e) => setSpeakerForm({...speakerForm, affiliation: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Country *</label>
                      <input 
                        type="text" 
                        value={speakerForm.country} 
                        onChange={(e) => setSpeakerForm({...speakerForm, country: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Speaker Bio *</label>
                      <textarea 
                        value={speakerForm.bio} 
                        onChange={(e) => setSpeakerForm({...speakerForm, bio: e.target.value})} 
                        rows="4"
                        required 
                      ></textarea>
                    </div>
                    <div className="form-group-reg">
                      <label>Speaker Category *</label>
                      <select 
                        value={speakerForm.type} 
                        onChange={(e) => setSpeakerForm({...speakerForm, type: e.target.value})}
                      >
                        <option value="KEYNOTE_SPEAKER">Keynote Speaker</option>
                        <option value="ADVISORY_BOARD">Advisory Board Member</option>
                        <option value="SPEAKER">General Speaker</option>
                      </select>
                    </div>
                    <div className="form-group-reg">
                      <label>Speaker Photo File (.jpg/.png)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSpeakerPhotoFile(e.target.files[0])} 
                      />
                    </div>

                    <div className="drawer-actions">
                      <button type="button" className="btn-back" onClick={() => setShowSpeakerModal(false)}>Cancel</button>
                      <button type="submit" className="btn-next">Save Profile</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AGENDA CRUD PANEL */}
        {activeTab === "sessions" && (
          <div className="dashboard-view">
            <div className="view-header">
              <h2>Agenda Sessions Schedule</h2>
              <button className="btn-add-primary" onClick={() => {
                setEditingSession(null);
                setSessionForm({ name: "", description: "", type: "KEYNOTE_SESSION", timeRange: "", speakerName: "", affiliation: "" });
                setShowSessionModal(true);
              }}>
                + Add Session Slot
              </button>
            </div>

            {loading ? <p>Loading sessions...</p> : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time Slot</th>
                      <th>Session Topic</th>
                      <th>Speaker Assign</th>
                      <th>Affiliation</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((ses) => (
                      <tr key={ses.id}>
                        <td><strong>{ses.timeRange}</strong></td>
                        <td>
                          <strong>{ses.name}</strong>
                          <p className="subtext">{ses.description}</p>
                        </td>
                        <td>{ses.speakerName}</td>
                        <td>{ses.affiliation}</td>
                        <td>
                          <span className="session-type-pill">{ses.type}</span>
                        </td>
                        <td>
                          <button className="btn-table-edit" onClick={() => openEditSession(ses)}>Edit</button>
                          <button className="btn-table-delete" onClick={() => deleteSession(ses.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* SESSIONS FORM MODAL */}
            {showSessionModal && (
              <div className="drawer-overlay" onClick={() => setShowSessionModal(false)}>
                <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
                  <h3>{editingSession ? "Edit Session Details" : "Add Schedule Slot"}</h3>
                  <form onSubmit={handleSessionSubmit} className="drawer-form">
                    <div className="form-group-reg">
                      <label>Session Title *</label>
                      <input 
                        type="text" 
                        value={sessionForm.name} 
                        onChange={(e) => setSessionForm({...sessionForm, name: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Time Slot Range *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 09:00 AM - 09:45 AM"
                        value={sessionForm.timeRange} 
                        onChange={(e) => setSessionForm({...sessionForm, timeRange: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Assigned Speaker Name</label>
                      <input 
                        type="text" 
                        value={sessionForm.speakerName} 
                        onChange={(e) => setSessionForm({...sessionForm, speakerName: e.target.value})} 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Speaker Affiliation</label>
                      <input 
                        type="text" 
                        value={sessionForm.affiliation} 
                        onChange={(e) => setSessionForm({...sessionForm, affiliation: e.target.value})} 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Brief Description</label>
                      <textarea 
                        value={sessionForm.description} 
                        onChange={(e) => setSessionForm({...sessionForm, description: e.target.value})} 
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="form-group-reg">
                      <label>Session Class</label>
                      <select 
                        value={sessionForm.type} 
                        onChange={(e) => setSessionForm({...sessionForm, type: e.target.value})}
                      >
                        <option value="KEYNOTE_SESSION">Keynote Speech</option>
                        <option value="ORAL_PRESENTATION">Oral Presentation</option>
                        <option value="POSTER_SESSION">Poster Presentation</option>
                        <option value="COFFEE_BREAK">Coffee / Lunch break</option>
                      </select>
                    </div>

                    <div className="drawer-actions">
                      <button type="button" className="btn-back" onClick={() => setShowSessionModal(false)}>Cancel</button>
                      <button type="submit" className="btn-next">Save Session</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SPONSORS CRUD PANEL */}
        {activeTab === "sponsors" && (
          <div className="dashboard-view">
            <div className="view-header">
              <h2>Sponsors & Partners</h2>
              <button className="btn-add-primary" onClick={() => {
                setEditingSponsor(null);
                setSponsorForm({ sponsorName: "", description: "" });
                setSponsorPhotoFile(null);
                setShowSponsorModal(true);
              }}>
                + Add New Sponsor
              </button>
            </div>

            {loading ? <p>Loading sponsors...</p> : (
              <div className="speakers-crud-grid">
                {sponsors.map((spon) => (
                  <div key={spon.id} className="spk-crud-card">
                    <div className="spk-card-photo" style={{ backgroundColor: "#ffffff", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img 
                        src={spon.image?.fileName ? `/uploads/sponsors/${spon.image.fileName}` : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"} 
                        alt={spon.sponsorName}
                        style={{ objectFit: "contain", maxHeight: "100%", maxWidth: "100%" }}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80"; }} 
                      />
                    </div>
                    <div className="spk-card-info" style={{ textAlign: "center" }}>
                      <h4>{spon.sponsorName}</h4>
                      <p style={{ display: "-webkit-box", WebkitLineClamp: "3", WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "13px", height: "54px" }}>
                        {spon.description}
                      </p>
                    </div>
                    <div className="spk-card-actions">
                      <button className="btn-table-edit" onClick={() => openEditSponsor(spon)}>Edit</button>
                      <button className="btn-table-delete" onClick={() => deleteSponsor(spon.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SPONSOR MODAL */}
            {showSponsorModal && (
              <div className="drawer-overlay" onClick={() => setShowSponsorModal(false)}>
                <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
                  <h3>{editingSponsor ? "Edit Sponsor Profile" : "Add New Sponsor"}</h3>
                  <form onSubmit={handleSponsorSubmit} className="drawer-form">
                    <div className="form-group-reg">
                      <label>Sponsor Name *</label>
                      <input 
                        type="text" 
                        value={sponsorForm.sponsorName} 
                        onChange={(e) => setSponsorForm({...sponsorForm, sponsorName: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="form-group-reg">
                      <label>Description *</label>
                      <textarea 
                        value={sponsorForm.description} 
                        onChange={(e) => setSponsorForm({...sponsorForm, description: e.target.value})} 
                        rows="5"
                        required 
                      ></textarea>
                    </div>
                    <div className="form-group-reg">
                      <label>Sponsor Logo File (.jpg/.png)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setSponsorPhotoFile(e.target.files[0])} 
                      />
                    </div>

                    <div className="drawer-actions">
                      <button type="button" className="btn-back" onClick={() => setShowSponsorModal(false)}>Cancel</button>
                      <button type="submit" className="btn-next">Save Sponsor</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INQUIRIES & CONTACTS LIST */}
        {activeTab === "contacts" && (
          <div className="dashboard-view">
            <h2>Contact Log Archive</h2>
            {loading ? <p>Loading inquiry logs...</p> : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Sender</th>
                      <th>Subject</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((con) => (
                      <tr key={con.id}>
                        <td>#MSG-0{con.id}</td>
                        <td>
                          <strong>{con.fullName}</strong>
                          <br />
                          <span className="subtext">{con.email} | {con.phone}</span>
                        </td>
                        <td><strong>{con.subject}</strong></td>
                        <td><p className="message-content">{con.message}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BROCHURE DOWNLOAD REQUESTS LOG */}
        {activeTab === "brochures" && (
          <div className="dashboard-view">
            <h2>Brochures Request Log</h2>
            {loading ? <p>Loading request entries...</p> : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Requester Name</th>
                      <th>Contact Credentials</th>
                      <th>Institution / Country</th>
                      <th>Specific Query</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brochures.map((bro) => (
                      <tr key={bro.id}>
                        <td>#BRQ-0{bro.id}</td>
                        <td><strong>{bro.fullName}</strong></td>
                        <td>{bro.email} <br /> {bro.phone}</td>
                        <td>{bro.company}, {bro.country}</td>
                        <td><p className="message-content">{bro.query || "No queries"}</p></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS EDITOR */}
        {activeTab === "settings" && (
          <div className="dashboard-view">
            <h2>Conference Main Settings</h2>
            <form onSubmit={handleConfDetailsSubmit} className="settings-form">
              <div className="form-grid">
                <div className="form-group-reg">
                  <label>Conference Title *</label>
                  <input 
                    type="text" 
                    value={confDetails.tittle} 
                    onChange={(e) => setConfDetails({...confDetails, tittle: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Start Date *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sep 24, 2026"
                    value={confDetails.startDate} 
                    onChange={(e) => setConfDetails({...confDetails, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>End Date *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sep 26, 2026"
                    value={confDetails.endDate} 
                    onChange={(e) => setConfDetails({...confDetails, endDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Venue Location *</label>
                  <input 
                    type="text" 
                    value={confDetails.venue} 
                    onChange={(e) => setConfDetails({...confDetails, venue: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Inquiry Contact Email *</label>
                  <input 
                    type="email" 
                    value={confDetails.contactEmail} 
                    onChange={(e) => setConfDetails({...confDetails, contactEmail: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Inquiry Contact Phone *</label>
                  <input 
                    type="text" 
                    value={confDetails.contactPhone} 
                    onChange={(e) => setConfDetails({...confDetails, contactPhone: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Countdown Date (YYYY-MM-DD) *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2026-09-24"
                    value={confDetails.countdownEndDate} 
                    onChange={(e) => setConfDetails({...confDetails, countdownEndDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group-reg">
                  <label>Reference Domain Link</label>
                  <input 
                    type="text" 
                    placeholder="e.g. https://domain.com"
                    value={confDetails.domainLink} 
                    onChange={(e) => setConfDetails({...confDetails, domainLink: e.target.value})} 
                  />
                </div>
              </div>

              <div className="form-group-reg" style={{ marginTop: "20px" }}>
                <label>Update Cover Banner Photo</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setConfPhotoFile(e.target.files[0])} 
                />
              </div>

              <button type="submit" disabled={loading} className="btn-save-settings">
                Save Settings Configuration
              </button>
            </form>
          </div>
        )}

        {/* HERO BANNER MANAGEMENT */}
        {activeTab === "hero" && <HeroManagement />}

        {/* STATISTICS MANAGEMENT */}
        {activeTab === "statistics" && <StatisticsManagement />}

        {/* TRUST BADGES MANAGEMENT */}
        {activeTab === "trust-badges" && <TrustBadgeManagement />}

      </main>
    </div>
  );
};

export default AdminDashboard;
