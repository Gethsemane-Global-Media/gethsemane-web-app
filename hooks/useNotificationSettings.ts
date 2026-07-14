import { useState, useCallback } from 'react';

export type Day = 'M' | 'T' | 'W' | 'Th' | 'F' | 'S' | 'Su';

export interface NotificationSettings {
  hour: number;
  minute: number;
  period: 'am' | 'pm';
  repeatDays: Day[];
  ringtone: string;
  isConfigured: boolean;
}

const NOTIFICATION_SETTINGS_KEY = 'notificationSettings';

export const unsetNotificationSettings: NotificationSettings = {
  hour: 2,
  minute: 0,
  period: 'am',
  repeatDays: [],
  ringtone: 'Sound the alarm',
  isConfigured: false,
};

const normalizeSettings = (raw: Partial<NotificationSettings>): NotificationSettings => {
  const repeatDays = Array.isArray(raw.repeatDays) ? raw.repeatDays : [];
  const isConfigured =
    raw.isConfigured === true ||
    (raw.isConfigured !== false && repeatDays.length > 0);

  return {
    hour: raw.hour ?? unsetNotificationSettings.hour,
    minute: raw.minute ?? unsetNotificationSettings.minute,
    period: raw.period ?? unsetNotificationSettings.period,
    repeatDays,
    ringtone: raw.ringtone ?? unsetNotificationSettings.ringtone,
    isConfigured,
  };
};

export const getStoredNotificationSettings = (): NotificationSettings => {
  try {
    const item = window.localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return item ? normalizeSettings(JSON.parse(item)) : unsetNotificationSettings;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return unsetNotificationSettings;
  }
};

export const useNotificationSettings = (): [
  NotificationSettings,
  (settings: NotificationSettings) => void,
] => {
  const [settings, setSettings] = useState<NotificationSettings>(getStoredNotificationSettings);

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    const normalized = normalizeSettings(newSettings);
    try {
      setSettings(normalized);
      window.localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(normalized));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, []);

  return [settings, updateSettings];
};
