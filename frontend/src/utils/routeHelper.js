export const getRegistrationRoute = (url, slug) => {
  if (!url) {
    return slug ? `/register/${slug}` : "/register";
  }
  
  let path = url;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsedUrl = new URL(url);
      if (
        parsedUrl.hostname === window.location.hostname ||
        parsedUrl.hostname === "51.21.159.47" ||
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1" ||
        parsedUrl.hostname === "intelevoresearch.org" ||
        parsedUrl.hostname.endsWith(".intelevoresearch.org")
      ) {
        path = parsedUrl.pathname + parsedUrl.search;
      } else {
        return null; // External URL
      }
    } catch (e) {
      return null;
    }
  }
  
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  // Support legacy fallback maps where url is just '/registrations' or '/register'
  if ((path === "/registrations" || path === "/register") && slug) {
    return `/register/${slug}`;
  }
  
  return path;
};
