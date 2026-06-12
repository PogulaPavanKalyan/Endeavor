import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const ContactManager = () => {
  const { activeConferenceId } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [activeConferenceId]);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/contacts${qs}`);
      setMessages(data || []);
    } catch (err) {
      setError("Failed to fetch contact inquiries.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.delete(`/api/admin/contacts/${id}`);
      setSuccess("Message deleted successfully.");
      if (selectedMsg && selectedMsg.id === id) {
        setSelectedMsg(null);
      }
      fetchMessages();
    } catch (err) {
      setError("Failed to delete message.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Contact Requests</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Monitor and respond to inquiry messages submitted through the contact forms.
          </p>
        </div>
        <div>
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="admin-form-input"
            style={{width: '260px', margin: 0}}
          />
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
        {loading && messages.length === 0 ? (
          <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading messages...</div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{background: '#f8fafc'}}>
                <tr>
                  <th style={{padding: '16px 24px'}}>Sender Details</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th style={{padding: '16px 24px'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map(msg => (
                  <tr key={msg.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                    <td style={{padding: '16px 24px'}}>
                      <strong style={{color: '#0f172a', fontSize: '15px'}}>{msg.fullName}</strong>
                      <br />
                      <span style={{color: '#64748b', fontSize: '12px'}}>{msg.email} | {msg.phone}</span>
                    </td>
                    <td style={{color: '#334155', fontWeight: '600'}}>{msg.subject}</td>
                    <td style={{color: '#64748b', fontSize: '13px', maxStyle: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {msg.message}
                    </td>
                    <td style={{padding: '16px 24px'}}>
                      <button 
                        className="btn-action-edit" 
                        style={{background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0'}}
                        onClick={() => setSelectedMsg(msg)}
                      >
                        View Full
                      </button>
                      <button className="btn-action-delete" onClick={() => handleDelete(msg.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredMessages.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                      No contact requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMsg && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '550px', maxWidth: '90%', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0, fontSize: '18px', color: '#0f172a'}}>Message Details</h3>
              <button onClick={() => setSelectedMsg(null)} style={{background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div>
                <strong style={{fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px'}}>From</strong>
                <span style={{fontSize: '15px', fontWeight: '600', color: '#0f172a'}}>{selectedMsg.fullName}</span>
                <br />
                <span style={{fontSize: '13px', color: '#475569'}}>{selectedMsg.email} | {selectedMsg.phone}</span>
              </div>

              <div>
                <strong style={{fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px'}}>Subject</strong>
                <span style={{fontSize: '14px', fontWeight: '600', color: '#1e293b'}}>{selectedMsg.subject}</span>
              </div>

              <div>
                <strong style={{fontSize: '11px', textTransform: 'uppercase', color: '#64748b', display: 'block', marginBottom: '4px'}}>Message</strong>
                <div style={{
                  background: '#f8fafc', padding: '16px', borderRadius: '8px', 
                  fontSize: '14px', color: '#334155', lineHeight: '1.6', 
                  whiteSpace: 'pre-wrap', maxHeight: '250px', overflowY: 'auto', border: '1px solid #e2e8f0'
                }}>
                  {selectedMsg.message}
                </div>
              </div>
            </div>

            <div style={{padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
              <button 
                type="button" 
                onClick={() => setSelectedMsg(null)} 
                style={{padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer'}}
              >
                Close
              </button>
              <a 
                href={`mailto:${selectedMsg.email}?subject=Re: ${encodeURIComponent(selectedMsg.subject)}`}
                style={{
                  padding: '8px 20px', background: '#3b82f6', color: '#fff', 
                  border: 'none', borderRadius: '8px', fontWeight: '600', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
              >
                Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactManager;
