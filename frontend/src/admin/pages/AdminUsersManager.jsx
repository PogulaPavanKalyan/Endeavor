import React, { useState, useEffect } from 'react';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api } from '../../utils/api';
import { useAdmin } from '../AdminContext';

const AdminUsersManager = () => {
  const { confirmDialog, alertDialog } = useAdminDialog();

  const { conferences, adminRole } = useAdmin();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'CONFERENCE_ADMIN',
    conferenceId: '',
    forcePasswordChange: true
  });

  useEffect(() => {
    if (adminRole === 'SUPER_ADMIN') {
      fetchAdmins();
    }
  }, [adminRole]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/admin/admins');
      setAdmins(data || []);
    } catch (err) {
      setError('Failed to load administrators.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (admin = null) => {
    setError('');
    setSuccess('');
    if (admin) {
      setFormData({
        id: admin.id,
        name: admin.name || '',
        email: admin.email || '',
        username: admin.username || '',
        password: '', // Leave blank when editing unless changing
        role: admin.role || 'CONFERENCE_ADMIN',
        conferenceId: admin.conferenceId || '',
        forcePasswordChange: admin.forcePasswordChange || false
      });
    } else {
      setFormData({
        id: null,
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'CONFERENCE_ADMIN',
        conferenceId: conferences.length > 0 ? conferences[0].id : '',
        forcePasswordChange: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.role === 'CONFERENCE_ADMIN' && !formData.conferenceId) {
      setError('Conference Admin must be assigned to a conference.');
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      if (payload.role === 'SUPER_ADMIN') {
        payload.conferenceId = null;
      } else if (payload.conferenceId) {
        payload.conferenceId = parseInt(payload.conferenceId, 10);
      }

      if (payload.id) {
        await api.put(`/api/admin/update-admin/${payload.id}`, payload);
        setSuccess('Administrator updated successfully.');
      } else {
        await api.post('/api/admin/create-admin', payload);
        setSuccess('Administrator created successfully.');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      setError(err.response?.data || err.message || 'Failed to save administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (username.toLowerCase() === 'pavan') {
      await alertDialog("Cannot delete the master Super Admin account.");
      return;
    }
    if (!(await confirmDialog(`Are you sure you want to delete administrator "${username}"?`))) return;
    
    setLoading(true);
    try {
      await api.delete(`/api/admin/delete-admin/${id}`);
      setSuccess('Administrator deleted.');
      fetchAdmins();
    } catch (err) {
      setError('Failed to delete administrator.');
    } finally {
      setLoading(false);
    }
  };

  if (adminRole !== 'SUPER_ADMIN') {
    return <div className="admin-page"><h2>Access Denied</h2><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Administrators</h2>
          <p>Manage Super Admins and Conference Admins for the platform.</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={() => handleOpenModal()}>
          + Add Administrator
        </button>
      </div>

      {error && <div className="admin-alert admin-alert-error">⚠ {error}</div>}
      {success && <div className="admin-alert admin-alert-success">✓ {success}</div>}

      <div className="admin-table-container" style={{marginTop: '20px'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Conference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.name || '-'}</td>
                <td><strong>{admin.username}</strong></td>
                <td>{admin.email || '-'}</td>
                <td>
                  <span className={`status-badge ${admin.role === 'SUPER_ADMIN' ? 'status-published' : 'status-draft'}`}>
                    {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Conference Admin'}
                  </span>
                </td>
                <td>
                  {admin.role === 'CONFERENCE_ADMIN' ? (
                    conferences.find(c => c.id == admin.conferenceId)?.tittle || `ID: ${admin.conferenceId}`
                  ) : (
                    <span style={{color: '#9ca3af', fontStyle: 'italic'}}>All Conferences (Root)</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-admin btn-admin-sm" onClick={() => handleOpenModal(admin)}>✏️</button>
                    {admin.username.toLowerCase() !== 'pavan' && (
                      <button className="btn-admin btn-admin-sm btn-admin-danger" onClick={() => handleDelete(admin.id, admin.username)}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {admins.length === 0 && !loading && (
              <tr>
                <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No administrators found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{maxWidth: '500px'}}>
            <div className="admin-modal-header">
              <h3>{formData.id ? 'Edit Administrator' : 'Add New Administrator'}</h3>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSave} className="admin-modal-body" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div style={{display: 'flex', gap: '16px'}}>
                <div style={{flex: 1}}>
                  <label className="admin-form-label">Full Name</label>
                  <input type="text" className="admin-form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div style={{flex: 1}}>
                  <label className="admin-form-label">Email</label>
                  <input type="email" className="admin-form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <div style={{flex: 1}}>
                  <label className="admin-form-label">Username</label>
                  <input type="text" className="admin-form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                </div>
                <div style={{flex: 1}}>
                  <label className="admin-form-label">{formData.id ? 'New Password (Optional)' : 'Password'}</label>
                  <input type={formData.id ? "text" : "password"} className="admin-form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!formData.id} placeholder={formData.id ? "Leave blank to keep same" : ""} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '16px'}}>
                <div style={{flex: 1}}>
                  <label className="admin-form-label">Role</label>
                  <select className="admin-form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="CONFERENCE_ADMIN">Conference Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  {formData.role === 'CONFERENCE_ADMIN' && (
                    <>
                      <label className="admin-form-label">Assign Conference</label>
                      <select className="admin-form-input" value={formData.conferenceId} onChange={e => setFormData({...formData, conferenceId: e.target.value})} required>
                        <option value="">-- Select Conference --</option>
                        {conferences.filter(c => !c.isDeleted).map(c => (
                          <option key={c.id} value={c.id}>{c.tittle}</option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {formData.id && (
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px'}}>
                  <input type="checkbox" id="forcePass" checked={formData.forcePasswordChange} onChange={e => setFormData({...formData, forcePasswordChange: e.target.checked})} />
                  <label htmlFor="forcePass" style={{fontSize: '14px', color: 'var(--admin-text-secondary)', cursor: 'pointer'}}>
                    Force Password Change on Next Login
                  </label>
                </div>
              )}

              <div className="admin-modal-footer" style={{marginTop: '10px'}}>
                <button type="button" className="btn-admin" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={loading}>
                  {loading ? 'Saving...' : (formData.id ? 'Update Admin' : 'Create Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersManager;
