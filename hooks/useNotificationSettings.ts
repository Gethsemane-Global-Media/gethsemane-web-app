import { useState, useCallback } from 'react';

export type Day = 'M' | 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su';

export interface NotificationSettings {
  hour: number;
  minute: number;
  period: 'am' | 'pm';
  repeatDays: Day[];
  ringtone: string;
}

const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';

const defaultSettings: NotificationSettings = {
  hour: 2,
  minute: 2,
  period: 'am',
  repeatDays: ['M'],
  ringtone: 'Sound the alarm',
};

export const useNotificationSettings = (): [
  NotificationSettings, 
  (settings: NotificationSettings) => void
] => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const item = window.localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      return item ? JSON.parse(item) : defaultSettings;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return defaultSettings;
    }
  });

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    try {
      setSettings(newSettings);
      window.localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, []);

  return [settings, updateSettings];
};
