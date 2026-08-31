import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { getSubdomain } from "../utils/subdomain";
import "./ConferenceAdminLogin.css";

const ConferenceAdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { username, password });
      if (response && response.token) {
        const currentSubdomain = getSubdomain();
        
        if (response.role === "CONFERENCE_ADMIN" && !currentSubdomain) {
            setError("Conference Administrators must log in through their specific conference website.");
            setLoading(false);
            return;
        }

        localStorage.setItem("token", response.token);
        if (response.role) localStorage.setItem("adminRole", response.role);
        if (response.conferenceId) localStorage.setItem("adminConferenceId", response.conferenceId);
        if (response.forcePasswordChange) localStorage.setItem("forcePasswordChange", "true");
        navigate({
          pathname: "/admin/dashboard",
          search: window.location.search
        });
      } else {
        setError("Invalid response payload from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid administrative credentials. Access Denied.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="conf-login-page">
      <div className="conf-login-container">
        <div className="conf-login-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img src="/logo.svg" alt="Intelevo Research" style={{ height: "52px", width: "auto", borderRadius: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.15)", display: "block", margin: "0 auto" }} />
          </div>
          <h2>Intelevo Research</h2>
          <div style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2.5px", color: "#2563eb", textTransform: "uppercase", marginBottom: "8px" }}>Intelligence Evolved</div>
          <p>Sign in to manage your conference workspace</p>
        </div>

        {error && <div className="conf-login-error">{error}</div>}

        <form onSubmit={handleLogin} className="conf-form">
          <div className="conf-form-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter administrator username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="conf-form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="conf-btn-submit">
            {loading ? "Authenticating..." : "Access Workspace"}
          </button>
        </form>

        <div className="conf-login-footer">
          <a href="/">&larr; Return to Homepage</a>
        </div>
      </div>
    </div>
  );
};

export default ConferenceAdminLogin;
