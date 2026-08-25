import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  loginWithGoogleApi,
  linkStudentAccount,
  AuthUser,
} from '../services/authService';

export interface UserProfileState {
  userId?: number;
  name: string;
  email?: string;
  avatarUrl?: string;
  role: string;
  student?: AuthUser['student'] | null;
}

interface AuthContextType {
  user: UserProfileState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<AuthUser>;
  register: (name: string, email: string, pass: string) => Promise<AuthUser>;
  loginWithGoogle: (payload: { email: string; name: string; avatar_url?: string; google_id?: string }) => Promise<AuthUser>;
  linkStudent: (matric: string, pass: string) => Promise<AuthUser>;
  updateUser: (updated: UserProfileState) => void;
  logout: () => void;
}

const defaultProfile: UserProfileState = {
  name: 'User',
  role: 'Community Member',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfileState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session on mount and listen to cross-tab storage changes
  useEffect(() => {
    const hydrate = () => {
      try {
        const stored = localStorage.getItem('userProfile');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name) {
            setUser(parsed);
          }
        }
      } catch (err) {
        console.error('Session hydration error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'userProfile') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {}
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const saveProfile = (profile: UserProfileState | null) => {
    setUser(profile);
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
    }
  };

  const transformUserToProfile = (authUser: AuthUser): UserProfileState => {
    return {
      userId: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.student ? 'Discipleship Candidate' : 'Community Member',
      student: authUser.student || null,
    };
  };

  const login = async (email: string, pass: string): Promise<AuthUser> => {
    const authUser = await loginUser(email, pass);
    saveProfile(transformUserToProfile(authUser));
    return authUser;
  };

  const register = async (name: string, email: string, pass: string): Promise<AuthUser> => {
    const authUser = await registerUser(name, email, pass);
    saveProfile(transformUserToProfile(authUser));
    return authUser;
  };

  const loginWithGoogle = async (payload: {
    email: string;
    name: string;
    avatar_url?: string;
    google_id?: string;
  }): Promise<AuthUser> => {
    const authUser = await loginWithGoogleApi(payload);
    saveProfile(transformUserToProfile(authUser));
    return authUser;
  };

  const linkStudent = async (matric: string, pass: string): Promise<AuthUser> => {
    if (!user?.userId) throw new Error('You must be signed in to link a student account.');
    const authUser = await linkStudentAccount(user.userId, matric, pass);
    saveProfile(transformUserToProfile(authUser));
    return authUser;
  };

  const updateUser = (updated: UserProfileState) => {
    saveProfile(updated);
  };

  const logout = () => {
    saveProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!user.userId,
        isLoading,
        login,
        register,
        loginWithGoogle,
        linkStudent,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
