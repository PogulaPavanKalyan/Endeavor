import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
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
        localStorage.setItem("token", response.token);
        navigate("/admin/dashboard");
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
          <img src="/logo.png" alt="Endeavor Conferences" className="login-logo" />
          <h2>Admin Console</h2>
          <p>Sign in to configure speakers, schedules, and view submissions.</p>
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
