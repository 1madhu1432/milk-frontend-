export const DEFAULT_BACKEND_URL = 'https://milk-backend-1-q7sf.onrender.com/api/v1';

export const resolveApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:4000/api/v1';
    }
  }
  return DEFAULT_BACKEND_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();
