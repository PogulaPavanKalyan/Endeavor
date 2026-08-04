import React, { useEffect } from "react";

const SEOHead = ({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterCard = "summary_large_image",
  robots = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  structuredData
}) => {
  useEffect(() => {
    // 1. Title
    if (title) {
      document.title = title;
    }

    // Helper to insert or update meta tag by name
    const setMetaName = (name, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // Helper to insert or update meta tag by property (OpenGraph)
    const setMetaProp = (property, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    // 2. Standard Meta Tags
    setMetaName("description", description);
    setMetaName("keywords", keywords);
    setMetaName("robots", robots);

    // 3. Canonical Link
    const targetCanonical = canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : "");
    if (targetCanonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.rel = "canonical";
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = targetCanonical;
    }

    // 4. OpenGraph Tags
    setMetaProp("og:site_name", "Intelevo Research");
    setMetaProp("og:title", ogTitle || title);
    setMetaProp("og:description", ogDescription || description);
    setMetaProp("og:image", ogImage || "https://intelevoresearch.com/logo.svg");
    setMetaProp("og:url", ogUrl || targetCanonical);
    setMetaProp("og:type", ogType);

    // 5. Twitter Card Tags
    setMetaName("twitter:card", twitterCard);
    setMetaName("twitter:site", "@IntelevoResearch");
    setMetaName("twitter:title", twitterTitle || title);
    setMetaName("twitter:description", twitterDescription || description);
    setMetaName("twitter:image", twitterImage || ogImage || "https://intelevoresearch.com/logo.svg");

    // 6. JSON-LD Structured Data
    if (structuredData) {
      let scriptLd = document.getElementById("seo-structured-data");
      if (!scriptLd) {
        scriptLd = document.createElement("script");
        scriptLd.id = "seo-structured-data";
        scriptLd.type = "application/ld+json";
        document.head.appendChild(scriptLd);
      }
      scriptLd.text = typeof structuredData === "string" ? structuredData : JSON.stringify(structuredData);
    }
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType,
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard,
    robots,
    structuredData
  ]);

  return null;
};

export default SEOHead;
