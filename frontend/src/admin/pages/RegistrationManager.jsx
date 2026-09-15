import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { useAdminDialog } from '../components/AdminDialogContext';
import { api } from '../../utils/api';

const DEFAULT_TIERS = [
  { type: "Student Registration", earlyPrice: 129, midPrice: 159, finalPrice: 189 },
  { type: "Academic Registration", earlyPrice: 99, midPrice: 129, finalPrice: 169 },
  { type: "Business Delegate", earlyPrice: 149, midPrice: 179, finalPrice: 199 }
];

const RegistrationManager = () => {
  const { activeConferenceId, refreshConferences } = useAdmin();
  const { toast } = useAdminDialog();

  const [activeTab, setActiveTab] = useState('pricing'); // 'pricing' or 'registrations'
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);
  const [confDetails, setConfDetails] = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);

  useEffect(() => {
    if (activeConferenceId) {
      fetchRegistrations();
      fetchConferenceDetails();
    }
  }, [activeConferenceId]);

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const qs = activeConferenceId ? `?conferenceId=${activeConferenceId}` : '';
      const data = await api.get(`/api/admin/registrations${qs}`);
      setRegistrations(data || []);
    } catch (err) {
      toast.error('Failed to fetch registrations.');
    } finally {
      setLoadingRegs(false);
    }
  };

  const fetchConferenceDetails = async () => {
    setLoadingPricing(true);
    try {
      const data = await api.get(`/api/conference-details?id=${activeConferenceId}`);
      if (data) {
        setConfDetails(data);
        if (data.pricingTiers && data.pricingTiers.length > 0) {
          setPricingTiers(data.pricingTiers);
        } else {
          setPricingTiers(DEFAULT_TIERS);
        }
      }
    } catch (err) {
      toast.error('Failed to load conference pricing settings.');
    } finally {
      setLoadingPricing(false);
    }
  };

  const handleTierChange = (index, field, value) => {
    const updated = [...pricingTiers];
    updated[index] = {
      ...updated[index],
      [field]: field.includes('Price') ? (parseFloat(value) || 0) : value
    };
    setPricingTiers(updated);
  };

  const handleAddTier = () => {
    setPricingTiers([
      ...pricingTiers,
      { type: 'New Registration Tier', earlyPrice: 99, midPrice: 149, finalPrice: 199 }
    ]);
  };

  const handleRemoveTier = (index) => {
    setPricingTiers(pricingTiers.filter((_, i) => i !== index));
  };

  const handleSavePricing = async (e) => {
    e.preventDefault();
    if (!activeConferenceId || !confDetails) {
      toast.warning('Please select a valid conference.');
      return;
    }

    setSavingPricing(true);
    try {
      const payload = {
        ...confDetails,
        pricingTiers: pricingTiers
      };
      await api.post('/api/admin/conference-details', payload);
      toast.success('✓ Registration pricing tiers saved successfully!');
      if (refreshConferences) refreshConferences();
    } catch (err) {
      toast.error('Failed to save registration pricing tiers.');
    } finally {
      setSavingPricing(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Registration Management & Pricing</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Configure conference registration packages, pricing tiers (Early/Mid/Final bird), and view attendee registrations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '10px 15px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'pricing' ? '#3b82f6' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          ⚙️ Pricing Packages & Tiers
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          style={{
            padding: '10px 15px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'registrations' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'registrations' ? '#3b82f6' : '#64748b',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '15px'
          }}
        >
          🎟️ Attendee Registrations Database ({registrations.length})
        </button>
      </div>

      {/* PRICING TIERS TAB */}
      {activeTab === 'pricing' && (
        <div>
          <form onSubmit={handleSavePricing}>
            <div className="admin-card" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="dashboard-section-title">
                  🏷️ Registration Packages & Tiered Pricing ($ USD)
                </div>
                <button
                  type="button"
                  onClick={handleAddTier}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '6px 14px',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Package Tier
                </button>
              </div>

              {loadingPricing ? (
                <p style={{ color: '#64748b' }}>Loading pricing tiers...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pricingTiers.map((tier, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 50px',
                        gap: '16px',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Package Name
                        </label>
                        <input
                          type="text"
                          required
                          value={tier.type}
                          onChange={(e) => handleTierChange(idx, 'type', e.target.value)}
                          placeholder="e.g. Student Registration"
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Early Bird ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={tier.earlyPrice}
                          onChange={(e) => handleTierChange(idx, 'earlyPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Mid Bird ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={tier.midPrice}
                          onChange={(e) => handleTierChange(idx, 'midPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Final Price ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={tier.finalPrice}
                          onChange={(e) => handleTierChange(idx, 'finalPrice', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '14px',
                            background: '#fff'
                          }}
                        />
                      </div>

                      <div style={{ textAlign: 'center', paddingTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          disabled={pricingTiers.length <= 1}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: pricingTiers.length <= 1 ? '#cbd5e1' : '#ef4444',
                            fontSize: '20px',
                            cursor: pricingTiers.length <= 1 ? 'not-allowed' : 'pointer'
                          }}
                          title="Remove package"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPricing}
              className="btn-admin-primary"
              style={{ padding: '12px 36px', fontSize: '15px' }}
            >
              {savingPricing ? 'Saving Pricing Settings...' : 'Save Registration Pricing Settings'}
            </button>
          </form>
        </div>
      )}

      {/* REGISTRATIONS DATABASE TAB */}
      {activeTab === 'registrations' && (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          {loadingRegs && registrations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading registrations...
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '16px 24px' }}>ID</th>
                    <th>Registrant</th>
                    <th>Company / University</th>
                    <th>Country</th>
                    <th>Ticket Details</th>
                    <th>Price Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '16px 24px', color: '#64748b', fontWeight: '500' }}>
                        #EC-0{reg.id}
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '15px' }}>
                          {reg.title} {reg.fullName}
                        </strong>
                        <br />
                        <span style={{ color: '#64748b', fontSize: '13px' }}>{reg.email}</span>
                        <br />
                        <span style={{ color: '#64748b', fontSize: '13px' }}>{reg.phone}</span>
                      </td>
                      <td style={{ color: '#475569', fontSize: '14px' }}>{reg.company || 'N/A'}</td>
                      <td style={{ color: '#475569', fontSize: '14px' }}>{reg.country || 'N/A'}</td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{reg.packageType}</strong>
                        {reg.addOns && (
                          <div style={{ color: '#64748b', fontSize: '12px' }}>
                            Add-on: {reg.addOns}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a', fontSize: '15px' }}>
                          {reg.currency === "USD" ? "$" : "€"}{reg.totalAmount}
                        </strong>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: reg.paymentStatus === 'CONFIRMED' ? '#dcfce7' : '#fef9c3',
                          color: reg.paymentStatus === 'CONFIRMED' ? '#166534' : '#854d0e'
                        }}>
                          {reg.paymentStatus || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No registrations received yet for this conference.
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

export default RegistrationManager;
