import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

// Incrementing this clears all stale localStorage auth data on next page load
const AUTH_VERSION = '2';

interface UserActivity {
  category: string;
  service: string;
  country: string;
  timestamp: string;
}

interface User {
  id?: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  recentActivities: UserActivity[];
  favoriteCategories: { [key: string]: number };
  favoriteCountries: { [key: string]: number };
  recentServices: string[];
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addActivity: (activity: Omit<UserActivity, 'timestamp'>) => void;
  addRecentService: (service: string) => void;
  isLoading: boolean;
}

/** Returns a clean empty activity state — no mock data */
const emptyActivity = () => ({
  recentActivities: [] as UserActivity[],
  favoriteCategories: {} as { [key: string]: number },
  favoriteCountries: {} as { [key: string]: number },
  recentServices: [] as string[],
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Version check — clears stale/mock data from previous versions
    if (localStorage.getItem('midzo_version') !== AUTH_VERSION) {
      localStorage.removeItem('midzo_user');
      localStorage.removeItem('midzo_token');
      localStorage.removeItem('tripBuilderData');
      localStorage.setItem('midzo_version', AUTH_VERSION);
      return null;
    }
    const saved = localStorage.getItem('midzo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Refresh real user data from API on app load
  useEffect(() => {
    if (!apiService.isAuthenticated()) return;

    const refresh = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(prev => ({
            ...emptyActivity(),
            ...(prev ?? {}),       // preserve accumulated local activity
            ...response.user,      // real API data always wins
          }));
        } else {
          apiService.logout();
          setUser(null);
        }
      } catch {
        apiService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    refresh();
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(identifier, password);
      if (response.success) {
        setUser({ ...emptyActivity(), ...response.user });
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await apiService.register(data);
      if (response.success) return { success: true };
      return { success: false, error: response.error || 'registration_failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'registration_failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyEmail(email, code);
      if (response.success) {
        setUser({ ...emptyActivity(), ...response.user });
        return { success: true };
      }
      return { success: false, error: response.error || 'verification_failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'verification_failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    localStorage.removeItem('tripBuilderData');
    setUser(null);
  };

  const addActivity = (activity: Omit<UserActivity, 'timestamp'>) => {
    if (!user) return;
    const newActivity = { ...activity, timestamp: new Date().toISOString() };
    setUser({
      ...user,
      recentActivities: [newActivity, ...user.recentActivities].slice(0, 10),
      favoriteCategories: {
        ...user.favoriteCategories,
        [activity.category]: (user.favoriteCategories[activity.category] || 0) + 1,
      },
      favoriteCountries: {
        ...user.favoriteCountries,
        [activity.country]: (user.favoriteCountries[activity.country] || 0) + 1,
      },
    });
  };

  const addRecentService = (service: string) => {
    if (!user) return;
    setUser({
      ...user,
      recentServices: [service, ...user.recentServices.filter(s => s !== service)].slice(0, 6),
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmail, logout, addActivity, addRecentService, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
