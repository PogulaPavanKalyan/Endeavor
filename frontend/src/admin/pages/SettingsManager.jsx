import React, { useState } from 'react';
import { api } from '../../utils/api';

const SettingsManager = () => {
  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 4) {
      setError("New password must be at least 4 characters long.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/admin/change-password", {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setSuccess("Password changed successfully!");
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.message || "Failed to change password. Please verify your old password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>System Settings</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Manage your administrative account configuration and security credentials.
          </p>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px'}}>
        <div className="admin-card">
          <div className="dashboard-section-title" style={{marginBottom: '20px'}}>🔐 Update Security Password</div>
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Current Password <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                required 
                type="password" 
                name="oldPassword"
                value={passwords.oldPassword} 
                onChange={handleChange}
                placeholder="••••••••" 
                style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>New Password <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                required 
                type="password" 
                name="newPassword"
                value={passwords.newPassword} 
                onChange={handleChange}
                placeholder="••••••••" 
                style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
              />
            </div>

            <div>
              <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Confirm New Password <span style={{color: '#ef4444'}}>*</span></label>
              <input 
                required 
                type="password" 
                name="confirmPassword"
                value={passwords.confirmPassword} 
                onChange={handleChange}
                placeholder="••••••••" 
                style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn-admin-primary" 
              style={{alignSelf: 'flex-start', padding: '10px 24px', marginTop: '10px'}}
            >
              {loading ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>

        <div className="admin-card" style={{height: 'fit-content'}}>
          <div className="dashboard-section-title" style={{marginBottom: '12px'}}>ℹ️ Platform Info</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#475569'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'}}>
              <strong>Framework:</strong>
              <span>Spring Boot + React 19</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'}}>
              <strong>Database:</strong>
              <span>MySQL 8.0</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px'}}>
              <strong>Security Protocol:</strong>
              <span>JWT Authentication</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <strong>Password Hash:</strong>
              <span>BCrypt (10 rounds)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
