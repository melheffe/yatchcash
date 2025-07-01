import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { config, getApiHeaders, buildApiUrl } from '../config';

interface User {
  id: string;
  email: string;
  tenantId: string;
  assignedRoles: string[];
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
    country?: string;
  };
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  subscriptionPlan: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user && !!tenant;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to get stored auth token
      const token = localStorage.getItem('tenant_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Verify token and get user/tenant info
      const response = await fetch(buildApiUrl('/auth/verify'), {
        method: 'POST',
        headers: {
          ...getApiHeaders(),
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setTenant(data.tenant);
          // Update config with tenant ID
          config.tenantId = data.tenant.id;
        } else {
          // Invalid token
          localStorage.removeItem('tenant_auth_token');
        }
      } else {
        // Token expired or invalid
        localStorage.removeItem('tenant_auth_token');
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Failed to initialize authentication');
      localStorage.removeItem('tenant_auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ 
          email, 
          password,
          subdomain: config.subdomain 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store auth token
        localStorage.setItem('tenant_auth_token', data.token);
        
        // Set user and tenant data
        setUser(data.user);
        setTenant(data.tenant);
        
        // Update config with tenant ID
        config.tenantId = data.tenant.id;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tenant_auth_token');
    setUser(null);
    setTenant(null);
    config.tenantId = null;
    setError(null);
  };

  const value: AuthContextType = {
    user,
    tenant,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 