/**
 * Detects if a subdomain is active and returns its config identifier.
 * Returns null if the user is on the main domain.
 */
export const getSubdomain = () => {
  const hostname = window.location.hostname;

  // 1. Check for query parameter override (e.g. ?subdomain=foodscience)
  const searchParams = new URLSearchParams(window.location.search);
  const qSubdomain = searchParams.get("subdomain");
  if (qSubdomain) {
    return qSubdomain;
  }

  // 2. Localhost subdomain check (e.g., foodscience.localhost)
  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    const parts = hostname.split(".");
    if (parts.length > 1 && parts[parts.length - 1] === "localhost") {
      return parts[0];
    }
    return null;
  }

  // 3. Production domain configuration
  const prodBaseDomain = import.meta.env.VITE_BASE_DOMAIN || "mydomain.com";
  
  if (hostname.endsWith(prodBaseDomain)) {
    const sub = hostname.replace(`.${prodBaseDomain}`, "");
    if (sub === prodBaseDomain || sub === "www" || sub === "") {
      return null;
    }
    return sub;
  }

  return null;
};

/**
 * Returns the full absolute URL for a specific subdomain or the main site.
 */
export const getSubdomainUrl = (subdomain, path = "") => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // In Localhost / Development
  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    const isHostnameBased = hostname.split(".").length > 1;
    
    if (subdomain) {
      if (isHostnameBased) {
        return `${protocol}//${subdomain}.localhost${port}${cleanPath}`;
      } else {
        return `${protocol}//localhost${port}${cleanPath}?subdomain=${subdomain}`;
      }
    } else {
      return `${protocol}//localhost${port}${cleanPath}`;
    }
  }

  // In Production
  const prodBaseDomain = import.meta.env.VITE_BASE_DOMAIN || "mydomain.com";
  if (subdomain) {
    return `${protocol}//${subdomain}.${prodBaseDomain}${port}${cleanPath}`;
  } else {
    return `${protocol}//${prodBaseDomain}${port}${cleanPath}`;
  }
};
