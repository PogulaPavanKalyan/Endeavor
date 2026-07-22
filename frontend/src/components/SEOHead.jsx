import React, { useEffect } from "react";

const SEOHead = ({ title, description, keywords, canonicalUrl, ogImage, structuredData }) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // 2. Update Meta Description
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    // 3. Update Meta Keywords
    if (keywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement("meta");
        metaKw.name = "keywords";
        document.head.appendChild(metaKw);
      }
      metaKw.content = keywords;
    }

    // 4. Update Canonical URL
    if (canonicalUrl) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement("link");
        linkCanonical.rel = "canonical";
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.href = canonicalUrl;
    }

    // 5. Open Graph Meta Tags
    if (title) {
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.content = title;
    }

    if (description) {
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.content = description;
    }

    if (ogImage) {
      let ogImg = document.querySelector('meta[property="og:image"]');
      if (!ogImg) {
        ogImg = document.createElement("meta");
        ogImg.setAttribute("property", "og:image");
        document.head.appendChild(ogImg);
      }
      ogImg.content = ogImage;
    }

    // 6. Structured Data (JSON-LD)
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
  }, [title, description, keywords, canonicalUrl, ogImage, structuredData]);

  return null;
};

export default SEOHead;
