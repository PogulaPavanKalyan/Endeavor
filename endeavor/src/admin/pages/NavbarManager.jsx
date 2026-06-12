import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const NavbarManager = () => {
  const { activeConferenceId } = useAdmin();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingPage, setEditingPage] = useState(null);
  const [editLabel, setEditLabel] = useState("");

  useEffect(() => {
    if (activeConferenceId) {
      fetchPages();
    }
  }, [activeConferenceId]);

  const fetchPages = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get(`/api/admin/pages?conferenceId=${activeConferenceId}`);
      // Sort by displayOrder ascending
      const sorted = (data || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setPages(sorted);
    } catch (err) {
      setError("Failed to fetch conference navigation pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEnable = async (page) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedPage = { ...page, isEnabled: !page.isEnabled };
      await api.put(`/api/admin/pages/${page.id}`, updatedPage);
      setSuccess(`Page "${page.label}" ${!page.isEnabled ? 'enabled' : 'disabled'} successfully!`);
      fetchPages();
    } catch (err) {
      setError("Failed to update page configuration.");
      setLoading(false);
    }
  };

  const handleOpenEdit = (page) => {
    setEditingPage(page);
    setEditLabel(page.label);
  };

  const handleSaveLabel = async () => {
    if (!editLabel.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const updatedPage = { ...editingPage, label: editLabel };
      await api.put(`/api/admin/pages/${editingPage.id}`, updatedPage);
      setSuccess("Page navigation label updated successfully!");
      setEditingPage(null);
      fetchPages();
    } catch (err) {
      setError("Failed to save label.");
      setLoading(false);
    }
  };

  const moveRow = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const list = [...pages];
    // Swap elements
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;

    // Recalculate displayOrder
    const updatedList = list.map((item, i) => ({
      ...item,
      displayOrder: i
    }));

    setPages(updatedList);
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/admin/pages/reorder", updatedList);
      setSuccess("Navigation order saved successfully!");
      fetchPages();
    } catch (err) {
      setError("Failed to save reordered navigation menu.");
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Navbar Page Configurations</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Enable or disable navigation menu tabs, customize labels, and reorder the layout.
          </p>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      {!activeConferenceId ? (
        <div className="admin-card" style={{textAlign: 'center', padding: '40px'}}>
          <p style={{color: '#64748b', margin: 0}}>Please select a conference from the header selector to manage its menu.</p>
        </div>
      ) : (
        <div className="admin-card" style={{padding: '0', overflow: 'hidden'}}>
          {loading && pages.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Loading menu tabs...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead style={{background: '#f8fafc'}}>
                  <tr>
                    <th style={{padding: '16px 24px', width: '80px'}}>Order</th>
                    <th>Technical Key</th>
                    <th>Navigation Label</th>
                    <th>Route Path</th>
                    <th>Status</th>
                    <th style={{padding: '16px 24px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p, index) => (
                    <tr key={p.id} style={{borderBottom: '1px solid #e2e8f0'}}>
                      <td style={{padding: '16px 24px'}}>
                        <div style={{display: 'flex', gap: '4px'}}>
                          <button 
                            disabled={index === 0} 
                            onClick={() => moveRow(index, -1)}
                            style={{padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer'}}
                          >
                            ▲
                          </button>
                          <button 
                            disabled={index === pages.length - 1} 
                            onClick={() => moveRow(index, 1)}
                            style={{padding: '2px 6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: index === pages.length - 1 ? 'not-allowed' : 'pointer'}}
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td style={{fontFamily: 'monospace', color: '#475569', fontSize: '13px'}}>{p.pageKey}</td>
                      <td>
                        {editingPage && editingPage.id === p.id ? (
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input 
                              type="text" 
                              value={editLabel} 
                              onChange={e => setEditLabel(e.target.value)} 
                              style={{padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} 
                            />
                            <button 
                              onClick={handleSaveLabel} 
                              style={{padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'}}
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingPage(null)} 
                              style={{padding: '6px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer'}}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <strong style={{color: '#0f172a', fontSize: '14.5px'}}>{p.label}</strong>
                            <button 
                              onClick={() => handleOpenEdit(p)} 
                              style={{background: 'none', border: 'none', color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: '600'}}
                            >
                              (Rename)
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{fontFamily: 'monospace', color: '#64748b', fontSize: '13px'}}>{p.route}</td>
                      <td>
                        <span style={{
                          background: p.isEnabled ? '#dcfce7' : '#fee2e2',
                          color: p.isEnabled ? '#15803d' : '#b91c1c',
                          padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700'
                        }}>
                          {p.isEnabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </td>
                      <td style={{padding: '16px 24px'}}>
                        <button 
                          className="btn-action-edit" 
                          style={{
                            background: p.isEnabled ? '#fee2e2' : '#dcfce7',
                            color: p.isEnabled ? '#b91c1c' : '#15803d',
                            borderColor: 'transparent'
                          }} 
                          onClick={() => handleToggleEnable(p)}
                        >
                          {p.isEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {pages.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                        No navigation menus found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NavbarManager;
