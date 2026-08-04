import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { getSubdomain } from "../utils/subdomain";
import "./AdminLogin.css";

const AdminLogin = () => {
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
    <div className="login-page">
      <div className="login-overlay"></div>
      <div className="login-card">
        <div className="login-header">
          <img src="/logo.svg" alt="Intelevo Research" className="login-logo" style={{ height: "54px", marginBottom: "12px" }} />
          <h2 style={{ margin: "0 0 4px 0", fontSize: "1.6rem", fontWeight: "700" }}>Intelevo Research</h2>
          <div style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "2px", color: "#60A5FA", textTransform: "uppercase", marginBottom: "12px" }}>Intelligence Evolved</div>
          <p>Sign in to administrative console.</p>
        </div>

        {error && <div className="login-error-alert">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-field-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter administrator username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login-submit">
            {loading ? "Authenticating..." : "Access Dashboard"}
          </button>
        </form>

        <div className="login-footer">
          <a href="/">&larr; Return to Homepage</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
