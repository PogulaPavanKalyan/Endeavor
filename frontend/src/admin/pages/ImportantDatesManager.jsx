import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api } from '../../utils/api';

const ImportantDatesManager = () => {
  const { activeConferenceId } = useAdmin();
  const { confirmDialog, toast } = useAdminDialog();

  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingDate, setEditingDate] = useState(null);

  const [formData, setFormData] = useState({
    eventTitle: '',
    eventDate: '',
    eventDescription: '',
    isHighlighted: false,
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    if (activeConferenceId) {
      fetchDates();
    }
  }, [activeConferenceId]);

  const fetchDates = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/admin/conference-details/${activeConferenceId}/important-dates`);
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setDates(sorted);
    } catch (err) {
      toast.error('Failed to load important dates.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    setEditingDate(item);
    if (item) {
      setFormData({
        eventTitle: item.eventTitle || '',
        eventDate: item.eventDate || '',
        eventDescription: item.eventDescription || '',
        isHighlighted: !!item.isHighlighted,
        isActive: item.isActive !== false,
        displayOrder: item.displayOrder || 0
      });
    } else {
      setFormData({
        eventTitle: '',
        eventDate: new Date().toISOString().split('T')[0],
        eventDescription: '',
        isHighlighted: false,
        isActive: true,
        displayOrder: dates.length + 1
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      toast.warning('Please select a conference.');
      return;
    }

    try {
      if (editingDate) {
        await api.put(`/api/admin/important-dates/${editingDate.id}`, formData);
        toast.success('✓ Important date updated successfully!');
      } else {
        await api.post(`/api/admin/conference-details/${activeConferenceId}/important-dates`, formData);
        toast.success('✓ Important date added successfully!');
      }
      setShowModal(false);
      fetchDates();
    } catch (err) {
      toast.error('Failed to save important date.');
    }
  };

  const handleDelete = async (id) => {
    if (!(await confirmDialog('Are you sure you want to delete this date?', 'Delete Important Date'))) return;
    try {
      await api.delete(`/api/admin/important-dates/${id}`);
      toast.success('✓ Date deleted successfully!');
      fetchDates();
    } catch (err) {
      toast.error('Failed to delete date.');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const updated = { ...item, isActive: !item.isActive };
      await api.put(`/api/admin/important-dates/${item.id}`, updated);
      toast.success(`✓ Date ${updated.isActive ? 'activated' : 'deactivated'}.`);
      setDates(prev => prev.map(d => d.id === item.id ? updated : d));
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const handleMove = async (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= dates.length) return;
    const newDates = [...dates];
    const temp = newDates[index];
    newDates[index] = newDates[targetIdx];
    newDates[targetIdx] = temp;

    const ids = newDates.map(d => d.id);
    setDates(newDates);
    try {
      await api.put(`/api/admin/conference-details/${activeConferenceId}/important-dates/reorder`, ids);
    } catch (err) {
      fetchDates();
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Important Dates & Deadlines</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage abstract deadlines, early-bird registration dates, notification milestones, and calendar events.
          </p>
        </div>
        <button className="btn-admin-primary" onClick={() => handleOpenModal()}>
          + Add Milestone Date
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && dates.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading important dates...
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ padding: '16px 24px', width: '80px' }}>Order</th>
                  <th>Milestone / Event</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dates.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '2px 6px' }}
                        >
                          ▲
                        </button>
                        <button
                          disabled={idx === dates.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: idx === dates.length - 1 ? 'not-allowed' : 'pointer', padding: '2px 6px' }}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#0f172a', fontSize: '15px' }}>{item.eventTitle}</strong>
                      {item.isHighlighted && (
                        <span style={{ marginLeft: '8px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                          Featured
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>
                      {item.eventDate}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '13px', maxWidth: '300px' }}>
                      {item.eventDescription || '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(item)}
                        style={{
                          background: item.isActive !== false ? '#dcfce7' : '#f1f5f9',
                          color: item.isActive !== false ? '#15803d' : '#64748b',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {item.isActive !== false ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button className="btn-action-edit" onClick={() => handleOpenModal(item)}>
                        Edit
                      </button>
                      <button className="btn-action-delete" onClick={() => handleDelete(item.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {dates.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No important dates configured yet. Click "+ Add Milestone Date" above to add your first deadline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '500px', maxWidth: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
                {editingDate ? 'Edit Important Date' : 'Add Milestone Date'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#94a3b8', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                  Milestone / Event Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Abstract Submission Deadline"
                  value={formData.eventTitle}
                  onChange={e => setFormData({ ...formData, eventTitle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                  Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  required
                  type="date"
                  value={formData.eventDate}
                  onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Optional details or instructions..."
                  value={formData.eventDescription}
                  onChange={e => setFormData({ ...formData, eventDescription: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isHighlighted}
                    onChange={e => setFormData({ ...formData, isHighlighted: e.target.checked })}
                  />
                  Featured / Highlighted
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active & Visible
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 20px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  style={{ padding: '8px 24px' }}
                >
                  {editingDate ? 'Save Changes' : 'Create Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantDatesManager;
