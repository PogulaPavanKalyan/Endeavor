import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { api } from "../utils/api";
import "./ConferenceRegisterLegacy.css"; // The scoped bootstrap + old_style.css

const DEFAULT_PRICING_TIERS = [
  { type: "Student Registration", earlyPrice: 129, midPrice: 159, finalPrice: 189 },
  { type: "Academic Registration", earlyPrice: 99, midPrice: 129, finalPrice: 169 },
  { type: "Business Delegate", earlyPrice: 149, midPrice: 179, finalPrice: 199 }
];

// Helper to parse date string into local date at midnight to prevent timezone-offset off-by-one errors
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
};

const ConferenceRegister = () => {
  const { conference } = useOutletContext();
  
  const [currency, setCurrency] = useState("USD");
  
  // Selection States
  const [selectedTier, setSelectedTier] = useState(null); // { type, phase: 'Early Bird' | 'Mid-On' | 'Final', price }
  const [selectedAddOns, setSelectedAddOns] = useState({
    singleOccupancy: false,
    doubleOccupancy: false,
    accompanyPerson: false
  });

  const [attendeeInfo, setAttendeeInfo] = useState({
    title: "Mr",
    fullName: "",
    company: "",
    country: "Choose...",
    email: "",
    phone: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const addOnPrices = {
    singleOccupancy: 100,
    doubleOccupancy: 150,
    accompanyPerson: 80
  };

  // Map country dropdown
  const countries = [
    "Choose...", "United States", "United Kingdom", "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", 
    "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Colombia", "Denmark", "Egypt", "Finland", 
    "France", "Germany", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Malaysia", 
    "Mexico", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Philippines", "Poland", "Portugal", 
    "Russian Federation", "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden", 
    "Switzerland", "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "Vietnam"
  ];

  // Helper to convert base USD price based on currency selection
  const getConvertedPrice = (price) => {
    if (!price) return 0;
    if (currency === "EUR") return Math.round(price * 0.92);
    if (currency === "GBP") return Math.round(price * 0.78);
    return price;
  };

  const getAddOnTotal = () => {
    let sum = 0;
    if (selectedAddOns.singleOccupancy) sum += addOnPrices.singleOccupancy;
    if (selectedAddOns.doubleOccupancy) sum += addOnPrices.doubleOccupancy;
    if (selectedAddOns.accompanyPerson) sum += addOnPrices.accompanyPerson;
    return getConvertedPrice(sum);
  };

  const getTotalAmount = () => {
    const ticketPrice = selectedTier ? getConvertedPrice(selectedTier.price) : 0;
    return ticketPrice + getAddOnTotal();
  };

  // Determine pricing tiers: Pull from backend or fallback to defaults
  const baseTiers = conference.pricingTiers && conference.pricingTiers.length > 0
    ? conference.pricingTiers
    : DEFAULT_PRICING_TIERS;

  // Calculate registration phase deadlines from start date
  const getDeadlineDate = (baseDateStr, daysBefore) => {
    if (!baseDateStr) return "TBD";
    const date = parseLocalDate(baseDateStr);
    date.setDate(date.getDate() - daysBefore);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const earlyDate = conference.startDate ? getDeadlineDate(conference.startDate, 45) : "05 Aug 2022";
  const midDate = conference.startDate ? getDeadlineDate(conference.startDate, 20) : "25 Aug 2022";
  const finalDate = conference.startDate ? getDeadlineDate(conference.startDate, 5) : "06 Sep 2022";

  // Determine which phase is active based on today's date compared to deadlines
  const getActivePhase = () => {
    if (!conference.startDate) return "Early Bird";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = parseLocalDate(conference.startDate);

    const earlyDeadline = new Date(start);
    earlyDeadline.setDate(earlyDeadline.getDate() - 45);
    earlyDeadline.setHours(0, 0, 0, 0);

    const midDeadline = new Date(start);
    midDeadline.setDate(midDeadline.getDate() - 20);
    midDeadline.setHours(0, 0, 0, 0);

    const finalDeadline = new Date(start);
    finalDeadline.setDate(finalDeadline.getDate() - 5);
    finalDeadline.setHours(0, 0, 0, 0);

    if (today <= earlyDeadline) {
      return "Early Bird";
    } else if (today <= midDeadline) {
      return "Mid-On";
    } else {
      return "Final";
    }
  };

  const activePhase = getActivePhase();

  // Set default selection based on active phase when conference ID changes
  useEffect(() => {
    const tiers = conference.pricingTiers && conference.pricingTiers.length > 0
      ? conference.pricingTiers
      : DEFAULT_PRICING_TIERS;

    if (tiers.length > 0) {
      const defaultTier = tiers.find(t => t.type.toLowerCase().includes("academic")) || tiers[0];
      const phase = getActivePhase();
      const price = phase === "Early Bird" ? defaultTier.earlyPrice : (phase === "Mid-On" ? defaultTier.midPrice : defaultTier.finalPrice);
      setSelectedTier({
        type: defaultTier.type,
        phase: phase,
        price: price
      });
    }
  }, [conference.id]);

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setAttendeeInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Clicking on a row selects that registration type for the active date-based phase
  const handleRowSelect = (type) => {
    const tier = baseTiers.find(t => t.type === type) || baseTiers[0];
    const price = activePhase === "Early Bird" ? tier.earlyPrice : (activePhase === "Mid-On" ? tier.midPrice : tier.finalPrice);
    setSelectedTier({ type, phase: activePhase, price });
  };

  const isCellSelected = (type, phase) => {
    return selectedTier && selectedTier.type === type && selectedTier.phase === phase;
  };

  const validateDetails = () => {
    const { fullName, email, phone, company, country } = attendeeInfo;
    if (!fullName || !email || !phone || !company || country === "Choose...") {
      setError("Please fill out all required fields.");
      return false;
    }
    if (!selectedTier) {
      setError("Please select a registration package.");
      return false;
    }
    if (!termsAccepted) {
      setError("Please accept the terms & conditions.");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDetails()) return;
    
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const ticketPrice = getConvertedPrice(selectedTier.price);
      const addOnPrice = getAddOnTotal();
      const totalAmount = ticketPrice + addOnPrice;

      const activeAddOnsList = [];
      if (selectedAddOns.singleOccupancy) activeAddOnsList.push("Single Occupancy Accommodation");
      if (selectedAddOns.doubleOccupancy) activeAddOnsList.push("Double Occupancy Accommodation");
      if (selectedAddOns.accompanyPerson) activeAddOnsList.push("Accompany Person");
      const addOnsStr = activeAddOnsList.length > 0 ? activeAddOnsList.join(", ") : "None";

      const registrationPayload = {
        currency,
        title: attendeeInfo.title,
        fullName: attendeeInfo.fullName,
        email: attendeeInfo.email,
        phone: attendeeInfo.phone,
        company: attendeeInfo.company,
        country: attendeeInfo.country,
        packageType: `${selectedTier.type} (${selectedTier.phase})`,
        packagePrice: parseFloat(ticketPrice.toFixed(2)),
        addOns: addOnsStr,
        addOnsPrice: parseFloat(addOnPrice.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        paymentStatus: "CONFIRMED",
        conferenceId: conference.id
      };

      const savedRegistration = await api.post("/api/register", registrationPayload);

      const simulatedTxId = "TX-" + Math.floor(100000 + Math.random() * 900000);
      await api.post(
        `/api/register/confirm?registrationId=${savedRegistration.id}&transactionId=${simulatedTxId}`,
        {}
      );

      setSuccessMsg(`Registration successful! Your reference ID is ${simulatedTxId}.`);
      
      // Reset Form
      setAttendeeInfo({
        title: "Mr",
        fullName: "",
        email: "",
        phone: "",
        company: "",
        country: "Choose...",
      });
      setSelectedTier(null);
      setSelectedAddOns({
        singleOccupancy: false,
        doubleOccupancy: false,
        accompanyPerson: false
      });
      setTermsAccepted(false);
      
    } catch (err) {
      console.error(err);
      setError("Registration failed: " + (err.message || "Please check your backend connection."));
    } finally {
      setLoading(false);
    }
  };

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";

  return (
    <div className="legacy-registration-scope" style={{ textAlign: 'left' }}>
      <section className="ts-speakers speaker-classic" style={{ paddingTop: '60px', paddingBottom: '60px', backgroundColor: '#fff' }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 offset-lg-1">
              <h2 className="section-title text-center">Registration</h2>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} id="contact" style={{ maxWidth: '1140px', margin: '0 auto' }}>
            
            {error && <div className="alert alert-danger" style={{marginTop: '20px'}}>{error}</div>}
            {successMsg && <div className="alert alert-success" style={{marginTop: '20px'}}>{successMsg}</div>}

            {/* Dynamic Date & Phase Status Banner */}
            <div className="alert alert-info" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px',
              padding: '16px 24px',
              marginBottom: '30px',
              color: '#0369a1',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <span style={{ marginRight: '8px' }}>📅</span>
                <strong>Today's Date:</strong> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: activePhase === 'Early Bird' ? '#16a34a' : activePhase === 'Mid-On' ? '#2563eb' : '#dc2626',
                  borderRadius: '50%',
                  display: 'inline-block',
                  boxShadow: `0 0 8px ${activePhase === 'Early Bird' ? '#16a34a' : activePhase === 'Mid-On' ? '#2563eb' : '#dc2626'}`
                }}></span>
                <strong>Active Phase:</strong> 
                <span style={{ 
                  backgroundColor: activePhase === 'Early Bird' ? '#dcfce7' : activePhase === 'Mid-On' ? '#dbeafe' : '#fee2e2',
                  color: activePhase === 'Early Bird' ? '#16a34a' : activePhase === 'Mid-On' ? '#2563eb' : '#dc2626',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '12px',
                  letterSpacing: '0.5px'
                }}>{activePhase.toUpperCase()} REGISTRATION</span>
              </div>
            </div>

            <div className="row">
              <h4 className="header-ter">Information</h4>
            </div>
            
            <div className="row">
              <div className="form-group col-md-3">
                <label>Choose Currency *</label>
              </div>
              <div className="form-group col-md-3">
                <label style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="currency_type" 
                    value="USD" 
                    checked={currency === "USD"} 
                    onChange={handleCurrencyChange} 
                    required 
                  />
                  &nbsp;USD ($)
                </label>
              </div>
              <div className="form-group col-md-3">
                <label style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="currency_type" 
                    value="EUR" 
                    checked={currency === "EUR"} 
                    onChange={handleCurrencyChange} 
                    required 
                  />
                  &nbsp;EUR (€)
                </label>
              </div>
              <div className="form-group col-md-3">
                <label style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="currency_type" 
                    value="GBP" 
                    checked={currency === "GBP"} 
                    onChange={handleCurrencyChange} 
                    required 
                  />
                  &nbsp;GBP (£)
                </label>
              </div>
            </div>
            
            <div className="row">
              <div className="form-group col-md-4">
                <label>Title *</label>
                <select 
                  name="title" 
                  className="form-control custom-select" 
                  value={attendeeInfo.title}
                  onChange={handleAttendeeChange}
                  required
                >
                  <option value="Mr">Mr.</option>
                  <option value="Miss">Miss</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Dr">Dr.</option>
                  <option value="Assist Prof">Assist Prof</option>
                  <option value="Assoc Prof">Assoc Prof</option>
                  <option value="Prof">Prof</option>
                </select>
              </div>
              <div className="form-group col-md-4">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="fullName" 
                  value={attendeeInfo.fullName}
                  onChange={handleAttendeeChange}
                  required 
                />
              </div>
              <div className="form-group col-md-4">
                <label>Company/University *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  name="company" 
                  value={attendeeInfo.company}
                  onChange={handleAttendeeChange}
                  required 
                />
              </div>
            </div>

            <div className="row">
              <div className="form-group col-md-4">
                <label>Country *</label>
                <select 
                  name="country" 
                  className="form-control custom-select" 
                  value={attendeeInfo.country}
                  onChange={handleAttendeeChange}
                  required
                >
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group col-md-4">
                <label>Email *</label>
                <input 
                  type="email" 
                  className="form-control" 
                  name="email" 
                  value={attendeeInfo.email}
                  onChange={handleAttendeeChange}
                  required 
                />
              </div>
              <div className="form-group col-md-4">
                <label>Mobile No *</label>
                <input 
                  type="number" 
                  className="form-control" 
                  name="phone" 
                  value={attendeeInfo.phone}
                  onChange={handleAttendeeChange}
                  required 
                />
              </div>
            </div>

            {/* Premium Registration Table Design */}
            <div id="customer-data" style={{ marginTop: '30px' }}>
              <div className="row">
                <div className="col-md-12">
                  <table className="table table-bordered" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#ffffff', textAlign: 'center' }}>
                        <th style={{ padding: '15px', fontWeight: 'bold', width: '35%', fontSize: '15px' }}>Registration Type</th>
                        <th style={{ padding: '15px', fontWeight: 'bold', fontSize: '15px', opacity: activePhase === 'Early Bird' ? 1 : 0.5 }}>Early Bird Registration</th>
                        <th style={{ padding: '15px', fontWeight: 'bold', fontSize: '15px', opacity: activePhase === 'Mid-On' ? 1 : 0.5 }}>Mid-On Registration</th>
                        <th style={{ padding: '15px', fontWeight: 'bold', fontSize: '15px', opacity: activePhase === 'Final' ? 1 : 0.5 }}>Final Registration</th>
                      </tr>
                      <tr style={{ background: '#f8fafc', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>
                        <td style={{ padding: '10px' }}></td>
                        <td style={{ padding: '10px', color: '#16a34a', opacity: activePhase === 'Early Bird' ? 1 : 0.5 }}>
                          <div>{earlyDate}</div>
                          <div style={{ fontSize: '11px', marginTop: '3px' }}>(ON OR BEFORE)</div>
                          {activePhase === 'Early Bird' ? (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#dcfce7', color: '#16a34a', borderRadius: '4px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>ACTIVE</span>
                          ) : (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '4px', display: 'inline-block', marginTop: '6px', textDecoration: 'line-through' }}>EXPIRED</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', color: '#2563eb', opacity: activePhase === 'Mid-On' ? 1 : 0.5 }}>
                          <div>{midDate}</div>
                          <div style={{ fontSize: '11px', marginTop: '3px' }}>(ON OR BEFORE)</div>
                          {activePhase === 'Mid-On' ? (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#dbeafe', color: '#2563eb', borderRadius: '4px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>ACTIVE</span>
                          ) : activePhase === 'Early Bird' ? (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>UPCOMING</span>
                          ) : (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#f1f5f9', color: '#94a3b8', borderRadius: '4px', display: 'inline-block', marginTop: '6px', textDecoration: 'line-through' }}>EXPIRED</span>
                          )}
                        </td>
                        <td style={{ padding: '10px', color: '#dc2626', opacity: activePhase === 'Final' ? 1 : 0.5 }}>
                          <div>{finalDate}</div>
                          <div style={{ fontSize: '11px', marginTop: '3px' }}>(ON OR BEFORE)</div>
                          {activePhase === 'Final' ? (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', display: 'inline-block', marginTop: '6px', fontWeight: 'bold' }}>ACTIVE</span>
                          ) : (
                            <span style={{ fontSize: '10px', padding: '3px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>UPCOMING</span>
                          )}
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {baseTiers.map((tier, idx) => (
                        <tr key={idx} style={{ textAlign: 'center' }}>
                          <td style={{ padding: '15px', textAlign: 'left', fontWeight: '700', color: '#1e293b', background: '#f8fafc' }}>
                            {tier.type}
                          </td>
                          {/* Early bird price cell */}
                          <td 
                            onClick={() => handleRowSelect(tier.type)}
                            style={{
                              padding: '15px',
                              cursor: 'pointer',
                              fontWeight: isCellSelected(tier.type, 'Early Bird') ? 'bold' : 'normal',
                              backgroundColor: isCellSelected(tier.type, 'Early Bird') ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                              border: isCellSelected(tier.type, 'Early Bird') ? '2.5px solid #ef4444' : '1px solid #dee2e6',
                              color: isCellSelected(tier.type, 'Early Bird') ? '#ef4444' : '#334155',
                              transition: 'all 0.15s ease',
                              opacity: activePhase === 'Early Bird' ? 1 : 0.5
                            }}
                          >
                            {currencySymbol} {getConvertedPrice(tier.earlyPrice)}
                          </td>
                          {/* Mid-on price cell */}
                          <td 
                            onClick={() => handleRowSelect(tier.type)}
                            style={{
                              padding: '15px',
                              cursor: 'pointer',
                              fontWeight: isCellSelected(tier.type, 'Mid-On') ? 'bold' : 'normal',
                              backgroundColor: isCellSelected(tier.type, 'Mid-On') ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                              border: isCellSelected(tier.type, 'Mid-On') ? '2.5px solid #ef4444' : '1px solid #dee2e6',
                              color: isCellSelected(tier.type, 'Mid-On') ? '#ef4444' : '#334155',
                              transition: 'all 0.15s ease',
                              opacity: activePhase === 'Mid-On' ? 1 : 0.5
                            }}
                          >
                            {currencySymbol} {getConvertedPrice(tier.midPrice)}
                          </td>
                          {/* Final price cell */}
                          <td 
                            onClick={() => handleRowSelect(tier.type)}
                            style={{
                              padding: '15px',
                              cursor: 'pointer',
                              fontWeight: isCellSelected(tier.type, 'Final') ? 'bold' : 'normal',
                              backgroundColor: isCellSelected(tier.type, 'Final') ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                              border: isCellSelected(tier.type, 'Final') ? '2.5px solid #ef4444' : '1px solid #dee2e6',
                              color: isCellSelected(tier.type, 'Final') ? '#ef4444' : '#334155',
                              transition: 'all 0.15s ease',
                              opacity: activePhase === 'Final' ? 1 : 0.5
                            }}
                          >
                            {currencySymbol} {getConvertedPrice(tier.finalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add On's Section */}
              <div className="row" style={{ marginTop: '25px' }}>
                <div className="col-md-12">
                  <table className="table table-bordered" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                        <th colSpan="4" style={{ padding: '15px', fontWeight: 'bold', fontSize: '15px' }}>Add On's</th>
                      </tr>
                      <tr style={{ background: '#f8fafc', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                        <td style={{ padding: '12px', width: '35%' }}>Accomdation</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>Single Occupancy</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>Double Occupancy</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>Accompany Person</td>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ textAlign: 'center' }}>
                        <td style={{ padding: '15px', textAlign: 'left', color: '#64748b', fontStyle: 'italic' }}>
                          Select optional accommodation
                        </td>
                        <td style={{ padding: '15px' }}>
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '0' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedAddOns.singleOccupancy}
                              onChange={(e) => setSelectedAddOns({ ...selectedAddOns, singleOccupancy: e.target.checked })}
                            />
                            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                              {currencySymbol} {getConvertedPrice(addOnPrices.singleOccupancy)}
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '0' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedAddOns.doubleOccupancy}
                              onChange={(e) => setSelectedAddOns({ ...selectedAddOns, doubleOccupancy: e.target.checked })}
                            />
                            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                              {currencySymbol} {getConvertedPrice(addOnPrices.doubleOccupancy)}
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', margin: '0' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedAddOns.accompanyPerson}
                              onChange={(e) => setSelectedAddOns({ ...selectedAddOns, accompanyPerson: e.target.checked })}
                            />
                            <span style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>
                              {currencySymbol} {getConvertedPrice(addOnPrices.accompanyPerson)}
                            </span>
                          </label>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount block */}
              <div className="row" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                <div className="col-md-5" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px' }}>
                  <strong style={{ fontSize: '18px', color: '#334155' }}>Total Amount</strong>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.04)',
                    padding: '8px 25px',
                    borderRadius: '6px',
                    border: '1.5px solid #ef4444',
                    minWidth: '120px',
                    textAlign: 'center'
                  }}>
                    {currencySymbol} {getTotalAmount()}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="row" style={{ marginTop: '30px', marginBottom: '20px' }}>
              <div className="col-md-12 text-center">
                <label style={{ fontWeight: 'normal', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required 
                  /> 
                  &nbsp; I've read and accept the <a href="#terms" style={{ color: '#ef813d' }}>terms &amp; conditions</a>
                </label>
              </div>
            </div>

            <div className="form-group text-center">
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>For PayPal payments, 2% processing charges may apply.</p>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: '#ef813d', borderColor: '#ef813d', padding: '10px 30px', fontSize: '16px' }}>
                {loading ? "Processing..." : "Proceed To Pay"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ConferenceRegister;
