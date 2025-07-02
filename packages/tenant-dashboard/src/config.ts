export interface TenantConfig {
  apiUrl: string;
  tenantId: string | null;
  subdomain: string | null;
  refreshInterval: number;
  isProduction: boolean;
}

// Extract tenant information from current domain
const getTenantInfo = () => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  // For development, we can use localhost with tenant header
  // For production, extract from subdomain
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isProduction = !isLocalhost && !hostname.includes('staging');

  return {
    subdomain: isLocalhost ? null : subdomain,
    isProduction,
  };
};

const { subdomain, isProduction } = getTenantInfo();

// Determine API URL based on environment
const getApiUrl = () => {
  // Check for explicit environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production, use the same domain as the current app
  if (isProduction) {
    return window.location.origin;
  }

  // Default to localhost for development
  return 'http://localhost:3001';
};

export const config: TenantConfig = {
  apiUrl: getApiUrl(),
  tenantId: null, // Will be set after authentication
  subdomain,
  refreshInterval: 30000, // 30 seconds
  isProduction,
};

// Helper function to get API headers with tenant context
export const getApiHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add tenant context via header (fallback for development)
  if (config.tenantId) {
    headers['X-Tenant-ID'] = config.tenantId;
  }

  return headers;
};

// Helper function to build tenant-aware API URLs
export const buildApiUrl = (endpoint: string) => {
  // Ensure endpoint starts with /api/tenant/ for tenant-scoped requests
  if (!endpoint.startsWith('/api/tenant/') && !endpoint.startsWith('/health')) {
    endpoint = `/api/tenant${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  }

  return `${config.apiUrl}${endpoint}`;
};
