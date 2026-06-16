import React from "react";
import { Link } from "react-router-dom";
import { getSubdomain, getSubdomainUrl } from "../utils/subdomain.jsx";

const NotFoundPage = () => {
  const subdomain = getSubdomain();
  const isSubdomainActive = !!subdomain;

  const handleGoHome = (e) => {
    if (isSubdomainActive) {
      // Go to subdomain home
      window.location.href = "/";
    } else {
      // Go to main site home
      window.location.href = getSubdomainUrl(null, "/");
    }
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#0d1117",
      color: "#ffffff",
      fontFamily: "'Outfit', 'Inter', sans-serif",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{
        fontSize: "120px",
        fontWeight: "800",
        margin: "0 0 10px 0",
        background: "linear-gradient(45deg, #e74c3c, #f39c12)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
      }}>404</h1>
      
      <h2 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "15px" }}>
        Page Not Found
      </h2>
      
      <p style={{ color: "#8b949e", fontSize: "16px", maxWidth: "480px", marginBottom: "30px", lineHeight: "1.6" }}>
        {isSubdomainActive 
          ? `The page you are looking for does not exist on this conference subdomain. You can go back to the conference homepage.`
          : `We can't find the page you're looking for. It might have been moved or doesn't exist.`}
      </p>

      <div style={{ display: "flex", gap: "15px" }}>
        <button 
          onClick={handleGoHome}
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--conf-primary, #e74c3c)",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(231, 76, 60, 0.2)"
          }}
          onMouseOver={(e) => e.target.style.opacity = "0.9"}
          onMouseOut={(e) => e.target.style.opacity = "1"}
        >
          {isSubdomainActive ? "Conference Home" : "Main Website Home"}
        </button>

        {isSubdomainActive && (
          <a
            href={getSubdomainUrl(null, "/")}
            style={{
              padding: "12px 24px",
              backgroundColor: "transparent",
              color: "#8b949e",
              border: "1px solid #30363d",
              borderRadius: "6px",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.target.style.color = "#ffffff"}
            onMouseOut={(e) => e.target.style.color = "#8b949e"}
          >
            Visit Main Portal
          </a>
        )}
      </div>
    </div>
  );
};

export default NotFoundPage;
