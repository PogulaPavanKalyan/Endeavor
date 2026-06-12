import { getSubdomain } from './subdomain.jsx';

export const BASE_URL = import.meta.env.VITE_API_URL || '';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const subdomain = getSubdomain();
  if (subdomain) {
    headers['X-Conference-Slug'] = subdomain;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401) {
    // If token expired or invalid, clear storage and redirect if it's admin route
    localStorage.removeItem('token');
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! Status: ${response.status}`);
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return await response.text();
};

const getFullUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Ensure we don't double slash
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

export const api = {
  get: async (url) => {
    const response = await fetch(getFullUrl(url), {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  post: async (url, data) => {
    const response = await fetch(getFullUrl(url), {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  postMultipart: async (url, formData) => {
    const response = await fetch(getFullUrl(url), {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(response);
  },

  put: async (url, data) => {
    const response = await fetch(getFullUrl(url), {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (url) => {
    const response = await fetch(getFullUrl(url), {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

