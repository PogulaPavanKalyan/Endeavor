import React, { useState } from "react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import { api } from "../utils/api";
import "./Register.css";

const Register = () => {
  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("USD");
  
  // Selection States
  const [selectedPackage, setSelectedPackage] = useState({
    name: "Speaker Registration",
    price: 499,
  });

  const [selectedAddon, setSelectedAddon] = useState({
    name: "None",
    price: 0,
  });

  const [attendeeInfo, setAttendeeInfo] = useState({
    title: "Mr.",
    fullName: "",
    email: "",
    phone: "",
    company: "",
    country: "",
  });

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [regResult, setRegResult] = useState(null);

  // Pricing configuration helper
  const packages = [
    { name: "Speaker Registration", desc: "For academic presenters submitting research papers", price: { USD: 499, EUR: 450 } },
    { name: "Delegate Registration", desc: "For professionals and attendees seeking to network", price: { USD: 399, EUR: 360 } },
    { name: "Student Registration", desc: "For graduate or undergraduate university researchers", price: { USD: 299, EUR: 270 } },
  ];

  const addons = [
    { name: "None", desc: "No accommodation requested", price: { USD: 0, EUR: 0 } },
    { name: "Single Occupancy (3 Nights)", desc: "Private room with complimentary breakfasts", price: { USD: 150, EUR: 135 } },
    { name: "Double Occupancy (3 Nights)", desc: "Shared room with premium amenities", price: { USD: 250, EUR: 225 } },
  ];

  const packagePrice = selectedPackage.price;
  const addonPrice = selectedAddon.price;
  const totalAmount = packagePrice + addonPrice;

  const handleCurrencyChange = (curr) => {
    setCurrency(curr);
    // Recalculate based on currency selection
    const packObj = packages.find((p) => p.name === selectedPackage.name);
    setSelectedPackage({ name: packObj.name, price: packObj.price[curr] });

    const addObj = addons.find((a) => a.name === selectedAddon.name);
    setSelectedAddon({ name: addObj.name, price: addObj.price[curr] });
  };

  const selectPackage = (packName, priceMap) => {
    setSelectedPackage({ name: packName, price: priceMap[currency] });
  };

  const selectAddon = (addonName, priceMap) => {
    setSelectedAddon({ name: addonName, price: priceMap[currency] });
  };

  const handleAttendeeChange = (e) => {
    const { name, value } = e.target;
    setAttendeeInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({ ...prev, [name]: value }));
  };

  const validateDetails = () => {
    const { fullName, email, phone, company, country } = attendeeInfo;
    if (!fullName || !email || !phone || !company || !country) {
      setError("Please fill out all attendee fields before proceeding.");
      return false;
    }
    setError("");
    return true;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Submit basic registration information
      const registrationPayload = {
        currency,
        title: attendeeInfo.title,
        fullName: attendeeInfo.fullName,
        email: attendeeInfo.email,
        phone: attendeeInfo.phone,
        company: attendeeInfo.company,
        country: attendeeInfo.country,
        packageType: selectedPackage.name,
        packagePrice: DoubleVal(packagePrice),
        addOns: selectedAddon.name,
        addOnsPrice: DoubleVal(addonPrice),
        totalAmount: DoubleVal(totalAmount),
        paymentStatus: "PENDING",
      };

      const savedRegistration = await api.post("/api/register", registrationPayload);

      // 2. Perform Payment Confirmation Simulation
      const simulatedTxId = "TX-" + Math.floor(100000 + Math.random() * 900000);
      const confirmationResult = await api.post(
        `/api/register/confirm?registrationId=${savedRegistration.id}&transactionId=${simulatedTxId}`,
        {}
      );

      setRegResult(confirmationResult);
      setStep(5); // Show success ticket
    } catch (err) {
      console.error(err);
      setError("Checkout failed: " + (err.message || "Please check your network connection."));
    } finally {
      setLoading(false);
    }
  };

  const DoubleVal = (num) => parseFloat(num.toFixed(2));

  const currencySymbol = currency === "USD" ? "$" : "€";

  return (
    <>
      <Header />

      <section className="register-hero">
        <div className="hero-overlay"></div>
        <div className="container register-hero-content">
          <span className="badge-premium">SECURE REGISTRATION</span>
          <h1>Conference Registration Desk</h1>
          <p>Complete your booking to secure your attendance and conference delegate pack.</p>
        </div>
      </section>

      <div className="register-page-container container">
        {step < 5 && (
          <div className="step-indicator-bar">
            <div className={`step-dot ${step >= 1 ? "active" : ""}`}>1. Package</div>
            <div className={`step-line ${step >= 2 ? "active" : ""}`}></div>
            <div className={`step-dot ${step >= 2 ? "active" : ""}`}>2. Accommodation</div>
            <div className={`step-line ${step >= 3 ? "active" : ""}`}></div>
            <div className={`step-dot ${step >= 3 ? "active" : ""}`}>3. Attendee Info</div>
            <div className={`step-line ${step >= 4 ? "active" : ""}`}></div>
            <div className={`step-dot ${step >= 4 ? "active" : ""}`}>4. Checkout</div>
          </div>
        )}

        <div className="register-layout">
          {step === 5 ? (
            <div className="success-ticket-container">
              <div className="ticket-header">
                <div className="checkmark-large">✓</div>
                <h2>Registration Confirmed</h2>
                <p>Welcome to Endeavor Conferences 2026</p>
              </div>

              <div className="ticket-body">
                <div className="ticket-row">
                  <div>
                    <strong>Registrant</strong>
                    <p>{regResult?.title} {regResult?.fullName}</p>
                  </div>
                  <div>
                    <strong>Registration ID</strong>
                    <p>#EC-00{regResult?.id}</p>
                  </div>
                </div>

                <div className="ticket-row">
                  <div>
                    <strong>Package</strong>
                    <p>{regResult?.packageType}</p>
                  </div>
                  <div>
                    <strong>Accommodation</strong>
                    <p>{regResult?.addOns}</p>
                  </div>
                </div>

                <div className="ticket-row">
                  <div>
                    <strong>Institution</strong>
                    <p>{regResult?.company}, {regResult?.country}</p>
                  </div>
                  <div>
                    <strong>Email Address</strong>
                    <p>{regResult?.email}</p>
                  </div>
                </div>

                <div className="ticket-divider"></div>

                <div className="ticket-footer">
                  <div>
                    <strong>Transaction Status</strong>
                    <span className="payment-status-badge">{regResult?.paymentStatus}</span>
                  </div>
                  <div>
                    <strong>Reference ID</strong>
                    <p className="tx-id">{regResult?.transactionId}</p>
                  </div>
                  <div>
                    <strong>Paid Total</strong>
                    <p className="paid-total">{currencySymbol}{regResult?.totalAmount}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* MAIN FORM PANEL */}
              <div className="register-main-panel">
                {error && <div className="error-alert">{error}</div>}

                {/* STEP 1: SELECT PACKAGE */}
                {step === 1 && (
                  <div className="wizard-step">
                    <div className="step-header">
                      <h2>Select Your Pass Type</h2>
                      <div className="currency-selector">
                        <button 
                          className={currency === "USD" ? "active" : ""} 
                          onClick={() => handleCurrencyChange("USD")}
                        >
                          USD
                        </button>
                        <button 
                          className={currency === "EUR" ? "active" : ""} 
                          onClick={() => handleCurrencyChange("EUR")}
                        >
                          EUR
                        </button>
                      </div>
                    </div>

                    <div className="packages-grid">
                      {packages.map((pack) => (
                        <div 
                          key={pack.name} 
                          className={`package-option-card ${selectedPackage.name === pack.name ? "selected" : ""}`}
                          onClick={() => selectPackage(pack.name, pack.price)}
                        >
                          <div className="card-top">
                            <h3>{pack.name}</h3>
                            <div className="option-price">
                              {currencySymbol}{pack.price[currency]}
                            </div>
                          </div>
                          <p>{pack.desc}</p>
                          <div className="selection-indicator">Selected</div>
                        </div>
                      ))}
                    </div>

                    <div className="wizard-actions">
                      <div></div>
                      <button className="btn-next" onClick={() => setStep(2)}>
                        Proceed to Lodging &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT ADDONS */}
                {step === 2 && (
                  <div className="wizard-step">
                    <h2>Choose Accommodation</h2>
                    <p className="subtitle">Enjoy special event discounts at the conference venue hotel.</p>

                    <div className="packages-grid">
                      {addons.map((addon) => (
                        <div 
                          key={addon.name} 
                          className={`package-option-card ${selectedAddon.name === addon.name ? "selected" : ""}`}
                          onClick={() => selectAddon(addon.name, addon.price)}
                        >
                          <div className="card-top">
                            <h3>{addon.name}</h3>
                            <div className="option-price">
                              {addon.price[currency] > 0 ? `${currencySymbol}${addon.price[currency]}` : "Free"}
                            </div>
                          </div>
                          <p>{addon.desc}</p>
                          <div className="selection-indicator">Selected</div>
                        </div>
                      ))}
                    </div>

                    <div className="wizard-actions">
                      <button className="btn-back" onClick={() => setStep(1)}>
                        &larr; Back
                      </button>
                      <button className="btn-next" onClick={() => setStep(3)}>
                        Enter Attendee Info &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ATTENDEE INFO */}
                {step === 3 && (
                  <div className="wizard-step">
                    <h2>Attendee Information</h2>
                    <p className="subtitle">Please enter correct contact credentials for badge logging.</p>

                    <div className="attendee-form">
                      <div className="form-row-register">
                        <div className="form-group-reg title-input">
                          <label>Title</label>
                          <select 
                            name="title" 
                            value={attendeeInfo.title} 
                            onChange={handleAttendeeChange}
                          >
                            <option value="Mr.">Mr.</option>
                            <option value="Mrs.">Mrs.</option>
                            <option value="Dr.">Dr.</option>
                            <option value="Prof.">Prof.</option>
                          </select>
                        </div>
                        
                        <div className="form-group-reg name-input">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            name="fullName"
                            placeholder="John Doe"
                            value={attendeeInfo.fullName}
                            onChange={handleAttendeeChange}
                          />
                        </div>
                      </div>

                      <div className="form-row-register">
                        <div className="form-group-reg">
                          <label>Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            placeholder="john.doe@university.edu"
                            value={attendeeInfo.email}
                            onChange={handleAttendeeChange}
                          />
                        </div>
                        <div className="form-group-reg">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            placeholder="+1 (555) 000-0000"
                            value={attendeeInfo.phone}
                            onChange={handleAttendeeChange}
                          />
                        </div>
                      </div>

                      <div className="form-row-register">
                        <div className="form-group-reg">
                          <label>Institution / Company *</label>
                          <input
                            type="text"
                            name="company"
                            placeholder="e.g. Oxford University"
                            value={attendeeInfo.company}
                            onChange={handleAttendeeChange}
                          />
                        </div>
                        <div className="form-group-reg">
                          <label>Country *</label>
                          <input
                            type="text"
                            name="country"
                            placeholder="United Kingdom"
                            value={attendeeInfo.country}
                            onChange={handleAttendeeChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="wizard-actions">
                      <button className="btn-back" onClick={() => setStep(2)}>
                        &larr; Back
                      </button>
                      <button 
                        className="btn-next" 
                        onClick={() => {
                          if (validateDetails()) setStep(4);
                        }}
                      >
                        Proceed to Payment &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CHECKOUT SIMULATION */}
                {step === 4 && (
                  <div className="wizard-step">
                    <h2>Simulated Secure Checkout</h2>
                    <p className="subtitle">Enter simulated test card parameters to complete your transaction logs.</p>

                    <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                      <div className="credit-card-preview">
                        <div className="card-brand">SecurePay Network</div>
                        <div className="card-number-display">
                          {cardDetails.cardNumber || "•••• •••• •••• ••••"}
                        </div>
                        <div className="card-expiry-display">
                          <div>
                            <span>Expires</span>
                            <p>{cardDetails.expiry || "MM/YY"}</p>
                          </div>
                          <div>
                            <span>CVV</span>
                            <p>{cardDetails.cvv || "•••"}</p>
                          </div>
                        </div>
                        <div className="card-holder-display">
                          {cardDetails.cardHolder || "CARDHOLDER NAME"}
                        </div>
                      </div>

                      <div className="form-group-reg">
                        <label>Cardholder Name</label>
                        <input
                          type="text"
                          name="cardHolder"
                          placeholder="JOHN DOE"
                          value={cardDetails.cardHolder}
                          onChange={handleCardChange}
                          required
                        />
                      </div>

                      <div className="form-group-reg">
                        <label>Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          placeholder="4111 2222 3333 4444"
                          maxLength="19"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          required
                        />
                      </div>

                      <div className="form-row-register">
                        <div className="form-group-reg">
                          <label>Expiration Date</label>
                          <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            maxLength="5"
                            value={cardDetails.expiry}
                            onChange={handleCardChange}
                            required
                          />
                        </div>
                        <div className="form-group-reg">
                          <label>Security Code (CVV)</label>
                          <input
                            type="password"
                            name="cvv"
                            placeholder="•••"
                            maxLength="4"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="wizard-actions">
                        <button type="button" className="btn-back" onClick={() => setStep(3)}>
                          &larr; Back
                        </button>
                        <button type="submit" className="btn-pay" disabled={loading}>
                          {loading ? "Processing Payment..." : `Pay ${currencySymbol}${totalAmount}`}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* SUMMARY SIDEBAR PANEL */}
              <div className="register-sidebar">
                <h3>Order Summary</h3>
                <div className="summary-list">
                  <div className="summary-row">
                    <span>Pass Type</span>
                    <strong>{selectedPackage.name}</strong>
                  </div>
                  <div className="summary-row price-sub">
                    <span>Subtotal</span>
                    <span>{currencySymbol}{packagePrice}</span>
                  </div>

                  <div className="summary-row">
                    <span>Accommodation</span>
                    <strong>{selectedAddon.name}</strong>
                  </div>
                  <div className="summary-row price-sub">
                    <span>Lodging Add-on</span>
                    <span>{currencySymbol}{addonPrice}</span>
                  </div>

                  <div className="summary-divider"></div>
                  
                  <div className="summary-total">
                    <span>Total Amount</span>
                    <span>{currencySymbol}{totalAmount}</span>
                  </div>
                </div>
                
                <div className="summary-notice">
                  <span className="lock-icon">🔒</span>
                  <p>All transactions are simulated and securely processed. No actual charges are made.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Register;
