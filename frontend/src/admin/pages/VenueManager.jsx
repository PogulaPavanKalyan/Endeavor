import React, { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { api } from '../../utils/api';

const VenueManager = () => {
  const { activeConferenceId } = useAdmin();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "", address: "", city: "", country: "",
    mapEmbedUrl: "", description: "", photoUrl: "",
    accommodationInfo: "", travelInfo: ""
  });

  useEffect(() => {
    if (activeConferenceId) {
      fetchVenue();
    }
  }, [activeConferenceId]);

  const fetchVenue = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const data = await api.get(`/api/admin/venue?conferenceId=${activeConferenceId}`);
      if (data) {
        setVenue(data);
        setFormData({
          name: data.name || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          mapEmbedUrl: data.mapEmbedUrl || "",
          description: data.description || "",
          photoUrl: data.photoUrl || "",
          accommodationInfo: data.accommodationInfo || "",
          travelInfo: data.travelInfo || ""
        });
      } else {
        setVenue(null);
        clearForm();
      }
    } catch (err) {
      // 404 is expected if no venue is configured yet
      setVenue(null);
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      name: "", address: "", city: "", country: "",
      mapEmbedUrl: "", description: "", photoUrl: "",
      accommodationInfo: "", travelInfo: ""
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeConferenceId) {
      setError("Please select a conference first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        ...formData,
        conferenceId: parseInt(activeConferenceId)
      };
      if (venue && venue.id) {
        payload.id = venue.id;
      }
      const saved = await api.post("/api/admin/venue", payload);
      setVenue(saved);
      setSuccess("Venue details saved successfully!");
    } catch (err) {
      setError("Failed to save venue details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2>Venue & Accommodation Manager</h2>
          <p style={{color: '#64748b', fontSize: '14px', marginTop: '4px'}}>
            Configure venue address, maps, travel guides and accommodation instructions for attendees.
          </p>
        </div>
      </div>

      {error && <div style={{background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{error}</div>}
      {success && <div style={{background: '#dcfce7', color: '#15803d', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500'}}>{success}</div>}

      {!activeConferenceId ? (
        <div className="admin-card" style={{textAlign: 'center', padding: '40px'}}>
          <p style={{color: '#64748b', margin: 0}}>Please select a conference from the header selector to manage its venue.</p>
        </div>
      ) : loading ? (
        <div className="admin-card" style={{textAlign: 'center', padding: '40px'}}>
          <p style={{color: '#64748b', margin: 0}}>Loading venue configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px'}}>
            <div className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div className="dashboard-section-title">📍 Location Information</div>
              
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Venue / Building Name <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="text" name="name" placeholder="e.g. Hilton Conference Center" value={formData.name} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Street Address <span style={{color: '#ef4444'}}>*</span></label>
                <input required type="text" name="address" placeholder="e.g. 100 University Ave" value={formData.address} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
              </div>

              <div style={{display: 'flex', gap: '20px'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>City <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" name="city" placeholder="London" value={formData.city} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Country <span style={{color: '#ef4444'}}>*</span></label>
                  <input required type="text" name="country" placeholder="United Kingdom" value={formData.country} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                </div>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Google Map Embed URL</label>
                <input type="text" name="mapEmbedUrl" placeholder="https://www.google.com/maps/embed?pb=..." value={formData.mapEmbedUrl} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
                <span style={{fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block'}}>Paste the `src` attribute value from the Google Maps iframe share code.</span>
              </div>
            </div>

            <div className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              <div className="dashboard-section-title">🖼️ Media & Details</div>
              
              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Venue Photo URL</label>
                <input type="text" name="photoUrl" placeholder="https://example.com/venue.jpg" value={formData.photoUrl} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155'}}>Venue Description</label>
                <textarea rows="6" name="description" placeholder="Provide background about the location..." value={formData.description} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
              </div>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
            <div className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div className="dashboard-section-title">🏨 Accommodation Details</div>
              <label style={{fontSize: '11px', color: '#64748b', textTransform: 'uppercase'}}>Details on partner hotels, lodging discount codes, etc.</label>
              <textarea rows="6" name="accommodationInfo" placeholder="e.g. Delegates receive a 10% discount at the Hilton with code CONF2027..." value={formData.accommodationInfo} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
            </div>

            <div className="admin-card" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              <div className="dashboard-section-title">✈️ Travel & Transportation Guides</div>
              <label style={{fontSize: '11px', color: '#64748b', textTransform: 'uppercase'}}>Instructions on closest airports, trains, bus routes or parking.</label>
              <textarea rows="6" name="travelInfo" placeholder="e.g. The venue is a 20-minute taxi drive from Heathrow Airport (LHR)..." value={formData.travelInfo} onChange={handleChange} style={{width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', resize: 'vertical'}}></textarea>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="btn-admin-primary" 
            style={{padding: '12px 30px', alignSelf: 'flex-start', fontSize: '15px'}}
          >
            {saving ? "Saving Details..." : "Save Venue configuration"}
          </button>
        </form>
      )}
    </div>
  );
};

export default VenueManager;
