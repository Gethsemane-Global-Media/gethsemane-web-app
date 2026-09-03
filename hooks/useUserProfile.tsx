import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export interface UserProfile {
  id?: number;
  userId?: number;
  name: string;
  email?: string;
  role: string;
  avatarUrl?: string;
  student?: {
    id: number;
    matric_number: string;
    waves?: any[];
  } | null;
}

const USER_PROFILE_KEY = 'userProfile';

const DEFAULT_AVATAR =
  'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

export const defaultProfile: UserProfile = {
  id: undefined,
  userId: undefined,
  name: 'Precious Ocg',
  email: 'precious@gkni.org',
  role: 'Community Member',
  avatarUrl: DEFAULT_AVATAR,
  student: null,
};

interface UserProfileContextValue {
  profile: UserProfile;
  updateProfile: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

const loadProfile = (): UserProfile => {
  try {
    const item = window.localStorage.getItem(USER_PROFILE_KEY);
    if (item) {
      const parsed = JSON.parse(item) as UserProfile;
      return {
        ...defaultProfile,
        ...parsed,
        id: parsed.id ?? parsed.userId,
        userId: parsed.userId ?? parsed.id,
        avatarUrl: parsed.avatarUrl || DEFAULT_AVATAR,
      };
    }
  } catch (error) {
    console.error('Error reading from localStorage', error);
  }
  return defaultProfile;
};

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(loadProfile);

  const updateProfile = useCallback((newProfile: UserProfile) => {
    const merged = {
      ...defaultProfile,
      ...newProfile,
      avatarUrl: newProfile.avatarUrl || DEFAULT_AVATAR,
    };
    try {
      setProfile(merged);
      window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(merged));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): [UserProfile, (profile: UserProfile) => void] => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return [context.profile, context.updateProfile];
};

export const getFirstName = (fullName?: string | null): string => {
  if (!fullName || typeof fullName !== 'string') return 'Disciple';
  return fullName.trim().split(/\s+/)[0] || 'Disciple';
};
