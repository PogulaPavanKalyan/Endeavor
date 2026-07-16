import React from "react";
import { useOutletContext } from "react-router-dom";
import "./ConferenceAbstract.css"; // Reusing the clean card styling

const PolicyLayout = ({ title, children }) => {
  const { conference } = useOutletContext();
  return (
    <section className="conf-subpage-section">
      <div className="conf-subpage-container conf-form-card">
        <h2 className="conf-page-title">{title}</h2>
        <div className="conf-guidelines-container">
          <div className="conf-guidelines-content">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export const ConferencePrivacy = () => {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and share information about you when you participate in our conferences.</p>
      <h3>Information We Collect</h3>
      <p>We may collect personal data such as your name, email address, phone number, and professional affiliations when you register or submit an abstract.</p>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To process registrations and submissions.</li>
        <li>To communicate with you regarding schedule updates and conference materials.</li>
        <li>To improve our services and user experience.</li>
      </ul>
      <p>We do not sell your personal data to third parties.</p>
    </PolicyLayout>
  );
};

export const ConferenceTerms = () => {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>By registering for or attending our conference, you agree to be bound by the following terms and conditions.</p>
      <h3>Registration & Payment</h3>
      <p>All registrations must be completed through our official portal. Payments are securely processed, and refunds are strictly subject to our cancellation policy.</p>
      <h3>Code of Conduct</h3>
      <p>We are dedicated to providing a harassment-free conference experience for everyone. We expect all participants to behave professionally and respectfully at all times.</p>
      <h3>Changes to the Event</h3>
      <p>The organizers reserve the right to modify the conference schedule, speakers, or venue without prior notice due to unforeseen circumstances.</p>
    </PolicyLayout>
  );
};

export const ConferenceCookies = () => {
  return (
    <PolicyLayout title="Cookie Policy">
      <p>This website uses cookies to enhance your browsing experience and provide personalized services.</p>
      <h3>What Are Cookies?</h3>
      <p>Cookies are small text files that are stored on your device when you visit a website. They help the site remember your actions and preferences (such as login, language, and other display preferences) over a period of time.</p>
      <h3>How We Use Cookies</h3>
      <ul>
        <li><strong>Essential Cookies:</strong> Required for the website to function properly.</li>
        <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
        <li><strong>Functional Cookies:</strong> Allow the website to remember choices you make to provide better functionality.</li>
      </ul>
      <p>You can control and/or delete cookies as you wish through your browser settings.</p>
    </PolicyLayout>
  );
};
