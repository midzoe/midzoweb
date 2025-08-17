import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

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

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addActivity: (activity: Omit<UserActivity, 'timestamp'>) => void;
  addRecentService: (service: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUserData: User = {
  username: 'midzo',
  recentActivities: [
    {
      category: 'study',
      service: 'University Finder',
      country: 'United Kingdom',
      timestamp: new Date('2024-01-15').toISOString()
    },
    {
      category: 'tourism',
      service: 'Hotel Booking',
      country: 'France',
      timestamp: new Date('2024-02-01').toISOString()
    },
    {
      category: 'business',
      service: 'Business Networking',
      country: 'Germany',
      timestamp: new Date('2024-02-15').toISOString()
    }
  ],
  favoriteCategories: {
    study: 5,
    tourism: 3,
    business: 2,
    professional: 1
  },
  favoriteCountries: {
    'United Kingdom': 4,
    'France': 3,
    'Germany': 2,
    'Spain': 1
  },
  recentServices: [
    'University finder',
    'Student accommodation',
    'Flight booking',
    'Insurance',
    'Language center',
    'Bank account'
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('midzo_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated on app start
    const initializeAuth = async () => {
      if (apiService.isAuthenticated()) {
        setIsLoading(true);
        try {
          const response = await apiService.getProfile();
          if (response.success) {
            setUser({
              ...response.user,
              ...initialUserData // Merge with activity data
            });
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
          apiService.logout();
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(username, password);
      if (response.success) {
        setUser({
          ...response.user,
          ...initialUserData // Merge with activity data
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const addActivity = (activity: Omit<UserActivity, 'timestamp'>) => {
    if (user) {
      const newActivity = {
        ...activity,
        timestamp: new Date().toISOString()
      };

      const updatedUser = {
        ...user,
        recentActivities: [newActivity, ...user.recentActivities].slice(0, 10),
        favoriteCategories: {
          ...user.favoriteCategories,
          [activity.category]: (user.favoriteCategories[activity.category] || 0) + 1
        },
        favoriteCountries: {
          ...user.favoriteCountries,
          [activity.country]: (user.favoriteCountries[activity.country] || 0) + 1
        }
      };

      setUser(updatedUser);
    }
  };

  const addRecentService = (service: string) => {
    if (user) {
      const updatedServices = [
        service,
        ...user.recentServices.filter(s => s !== service)
      ].slice(0, 6);

      setUser({
        ...user,
        recentServices: updatedServices
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, addActivity, addRecentService, isLoading }}>
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