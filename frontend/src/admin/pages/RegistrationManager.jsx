import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const RegistrationManager = () => {
  const { activeConferenceId } = useAdmin();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRegistrations();
  }, [activeConferenceId]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // In a real implementation, the backend should filter by conferenceId.
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/registrations${qs}`);
      setRegistrations(data || []);
    } catch (err) {
      setError("Failed to fetch registrations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2>Registrations Database</h2>
      </div>

      {error && <div style={{color: 'red', marginBottom: '15px'}}>{error}</div>}

      <div className="admin-card">
        {loading ? <p>Loading registrations...</p> : (
          <div className="admin-table-container">
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
                      <span style={{color: '#64748b', fontSize: '12px'}}>{reg.email} | {reg.phone}</span>
                    </td>
                    <td>{reg.company}</td>
                    <td>{reg.country}</td>
                    <td>
                      <strong>{reg.packageType}</strong>
                      <br />
                      <span style={{color: '#64748b', fontSize: '12px'}}>Add-on: {reg.addOns}</span>
                    </td>
                    <td>
                      <strong>{reg.currency === "USD" ? "$" : "€"}{reg.totalAmount}</strong>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: reg.paymentStatus === 'CONFIRMED' ? '#dcfce7' : '#fef9c3',
                        color: reg.paymentStatus === 'CONFIRMED' ? '#166534' : '#854d0e'
                      }}>
                        {reg.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '30px'}}>
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationManager;
