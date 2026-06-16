import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const LogsManager = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get("/api/admin/logs");
      if (Array.isArray(data)) {
        // Sort logs newest first
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setLogs(sorted);
      }
    } catch (err) {
      setError("Failed to fetch administrative logs: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      (log.username && log.username.toLowerCase().includes(search)) ||
      (log.action && log.action.toLowerCase().includes(search)) ||
      (log.details && log.details.toLowerCase().includes(search)) ||
      (log.ipAddress && log.ipAddress.includes(search))
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Audit & Activity Logs</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Track all administrative actions, data edits, and configuration changes across the platform.
          </p>
        </div>
        <button 
          onClick={fetchLogs} 
          className="btn-admin-primary" 
          style={{ padding: '8px 16px', fontSize: '13.5px', height: 'fit-content' }}
        >
          🔄 Refresh Logs
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500' }}>{error}</div>}

      <div className="admin-card" style={{ padding: '20px 0' }}>
        <div style={{ padding: '0 24px 16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <input 
              type="text" 
              placeholder="Search logs (user, action, details, IP)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', 
                padding: '9px 12px 9px 36px', 
                borderRadius: '8px', 
                border: '1px solid #cbd5e1', 
                fontSize: '13.5px',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}>🔍</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '13.5px' }}>
            Showing <strong>{filteredLogs.length}</strong> logs
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '35px', height: '35px', border: '3px solid #f3f3f3', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px auto' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Loading platform logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
            <p style={{ fontSize: '15px' }}>No activity logs found matching the filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '12px 24px' }}>Timestamp</th>
                  <th style={{ padding: '12px 24px' }}>User</th>
                  <th style={{ padding: '12px 24px' }}>Action</th>
                  <th style={{ padding: '12px 24px' }}>Details / Changes</th>
                  <th style={{ padding: '12px 24px' }}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9', hover: { background: '#f8fafc' } }}>
                    <td style={{ padding: '12px 24px', color: '#475569', whiteSpace: 'nowrap' }}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td style={{ padding: '12px 24px', fontWeight: '500', color: '#0f172a' }}>
                      👤 {log.username}
                    </td>
                    <td style={{ padding: '12px 24px' }}>
                      <span style={{
                        background: log.action.includes('DELETE') ? '#fee2e2' : log.action.includes('CREATE') ? '#dcfce7' : '#fef9c3',
                        color: log.action.includes('DELETE') ? '#991b1b' : log.action.includes('CREATE') ? '#166534' : '#854d0e',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 24px', color: '#334155', maxWidth: '400px', wordWrap: 'break-word' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '12px 24px', color: '#64748b', fontFamily: 'monospace' }}>
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsManager;
