import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { usersApi } from '../api/users';
import { storage } from '../utils/storage';
import { extractRolesFromToken, isAdmin } from '../utils/roles';
import { UserDto } from '../types/user';
import { JwtRequest, RegisterData } from '../types/auth';
import { showSuccessToast } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { SUCCESS_MESSAGES } from '../config';

interface AuthContextType {
  user: UserDto | null;
  roles: string[];
  isAuthenticated: boolean;
  isAdminUser: boolean;
  isLoading: boolean;
  login: (credentials: JwtRequest) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loadUserAfterOAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const token = storage.getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await usersApi.getCurrentUser();
      setUser(userData);

      // Extract roles from token
      const tokenRoles = extractRolesFromToken(token);
      setRoles(tokenRoles);
    } catch (error) {
      logger.error('Error loading user', error);
      storage.clear();
      setUser(null);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (credentials: JwtRequest) => {
    try {
      const response = await authApi.login(credentials);
      storage.setToken(response.jwtToken);
      storage.setRefreshToken(response.refreshToken);

      // Extract roles from token
      const tokenRoles = extractRolesFromToken(response.jwtToken);
      setRoles(tokenRoles);

      // Load user data
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
      storage.setUser(userData);

      logger.userAction('Login', { userId: userData.id, email: userData.email });
      showSuccessToast(SUCCESS_MESSAGES.login);
    } catch (error) {
      // Don't show toast here - let the LoginPage component handle error display
      // This prevents double error notifications and ensures error banner stays visible
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authApi.register(data);
      logger.userAction('Register', { email: data.email });
      showSuccessToast(SUCCESS_MESSAGES.register);
    } catch (error) {
      // Don't show toast here - let the RegisterPage component handle error display
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      logger.userAction('Logout', { userId: user?.id });
    } catch (error) {
      logger.error('Logout error', error);
    } finally {
      storage.clear();
      setUser(null);
      setRoles([]);
      showSuccessToast(SUCCESS_MESSAGES.logout);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
      storage.setUser(userData);
      logger.debug('User data refreshed', { userId: userData.id });
    } catch (error) {
      logger.error('Error refreshing user', error);
    }
  };

  const loadUserAfterOAuth = async () => {
    const token = storage.getToken();
    if (!token) {
      throw new Error('No token found after OAuth');
    }

    try {
      // Extract roles from token
      const tokenRoles = extractRolesFromToken(token);
      setRoles(tokenRoles);

      // Load user data
      const userData = await usersApi.getCurrentUser();
      setUser(userData);
      storage.setUser(userData);

      logger.userAction('OAuth Login', { userId: userData.id, email: userData.email });
      showSuccessToast(SUCCESS_MESSAGES.login);
    } catch (error) {
      logger.error('Error loading user after OAuth', error);
      storage.clear();
      setUser(null);
      setRoles([]);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    roles,
    isAuthenticated: !!user && !!storage.getToken(),
    isAdminUser: isAdmin(roles),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    loadUserAfterOAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
