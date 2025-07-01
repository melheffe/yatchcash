import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { User } from '@yachtcash/shared';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (_email: string, _password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [_token, _setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Verify token with API
      // For now, just check if token exists
      if (token === 'mock_token') {
        const mockUser: User = {
          id: '1',
          email: 'admin@yachtcash.com',
          status: 'active',
          assignedRoles: ['admin'],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const login = async (_email: string, _password: string) => {
    try {
      // TODO: Implement actual authentication
      setIsLoading(true);

      // Mock authentication - replace with real API call
      const mockUser: User = {
        id: '1',
        email: _email,
        status: 'active',
        assignedRoles: ['admin'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);
      localStorage.setItem('auth_token', 'mock_token');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const hasPermission = () => {
    // TODO: Implement permission checking logic
    return true;
  };

  const value: AuthContextType = {
    user,
    token: _token,
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
