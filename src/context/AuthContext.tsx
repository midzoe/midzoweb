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

interface UserLanguage {
  language: string;
  level: string;
}

interface User {
  id?: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'superadmin';
  is_premium?: boolean;
  premium_since?: string;
  nationality?: string;
  country_of_residence?: string;
  languages?: UserLanguage[];
  newsletter_study?: boolean;
  newsletter_tourism?: boolean;
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
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addActivity: (activity: Omit<UserActivity, 'timestamp'>) => void;
  addRecentService: (service: string) => void;
  updateUserLocally: (fields: Partial<User>) => void;
  isLoading: boolean;
  isAdmin: boolean;
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
  const [adminVerified, setAdminVerified] = useState<boolean>(() => {
    return localStorage.getItem('midzo_is_admin') === 'true';
  });

  // isAdmin: backend role field OR verified via admin endpoint probe
  const isAdmin = !!(
    user?.role === 'admin' ||
    user?.role === 'superadmin' ||
    (user as any)?.is_admin === true ||
    (user as any)?.is_staff === true ||
    adminVerified
  );

  // Refresh real user data from API on app load
  useEffect(() => {
    if (!apiService.isAuthenticated()) return;

    const refresh = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(prev => {
            const updated: User = {
              ...emptyActivity(),
              ...(prev ?? {}),
              ...response.user,
              // Preserve role from prev if API doesn't return it yet
              role: response.user?.role ?? prev?.role,
            };
            localStorage.setItem('midzo_user', JSON.stringify(updated));
            return updated;
          });

          // If backend doesn't return role yet, probe the admin endpoint
          const hasRoleInResponse =
            response.user?.role === 'admin' ||
            response.user?.role === 'superadmin' ||
            response.user?.is_admin === true;

          if (!hasRoleInResponse) {
            try {
              const statsRes = await apiService.adminGetStats();
              const isAdminViaProbe = statsRes.success === true;
              setAdminVerified(isAdminViaProbe);
              localStorage.setItem('midzo_is_admin', String(isAdminViaProbe));
            } catch {
              // Not admin or endpoint doesn't exist yet
            }
          }
        } else {
          apiService.logout();
          localStorage.removeItem('midzo_is_admin');
          setAdminVerified(false);
          setUser(null);
        }
      } catch {
        // Network error — keep existing session
      } finally {
        setIsLoading(false);
      }
    };

    refresh();
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(identifier, password);
      if (response.success) {
        const userData: User = { ...emptyActivity(), ...response.user };
        setUser(userData);
        // Ensure role is persisted in localStorage immediately
        localStorage.setItem('midzo_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (error: any) {
      return { success: false, error: error.message };
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
    localStorage.removeItem('midzo_is_admin');
    setAdminVerified(false);
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

  const updateUserLocally = (fields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('midzo_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyEmail, logout, addActivity, addRecentService, updateUserLocally, isLoading, isAdmin }}>
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
