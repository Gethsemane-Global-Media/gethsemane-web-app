import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  role: string;
}

const USER_PROFILE_KEY = 'userProfile';

const defaultProfile: UserProfile = {
  name: 'Precious Ocg',
  role: 'Student',
};

export const useUserProfile = (): [UserProfile, (profile: UserProfile) => void] => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const item = window.localStorage.getItem(USER_PROFILE_KEY);
      return item ? JSON.parse(item) : defaultProfile;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultProfile;
    }
  });

  const updateProfile = useCallback((newProfile: UserProfile) => {
    try {
      setProfile(newProfile);
      window.localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, []);

  return [profile, updateProfile];
};
