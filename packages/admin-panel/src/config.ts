// Determine API URL based on environment
const getApiUrl = () => {
  // Check if we're in production (not localhost)
  const isProduction =
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1');

  if (isProduction) {
    return `${window.location.origin}/api`;
  }

  // Default to localhost for development
  return 'http://localhost:3001/api';
};

export const API_BASE_URL = getApiUrl();

export const config = {
  apiUrl: API_BASE_URL,
  environment: 'development',
  enableAuth: false, // Temporarily disabled for demo
  refreshInterval: 30000, // 30 seconds
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
  },
};

export default config;
