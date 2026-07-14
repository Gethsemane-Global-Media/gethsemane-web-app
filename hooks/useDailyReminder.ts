import { useCallback, useEffect, useState } from 'react';
import { NotificationSettings, Day } from './useNotificationSettings';

// Date.getDay(): 0 = Sunday ... 6 = Saturday
const DAY_BY_INDEX: Day[] = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

const todayKey = () => new Date().toISOString().split('T')[0];

const DISMISSED_PREFIX = 'reminderDismissed-';
const FIRED_PREFIX = 'reminderFired-';

export const isTodayScheduled = (settings: NotificationSettings): boolean =>
  settings.isConfigured && settings.repeatDays.includes(DAY_BY_INDEX[new Date().getDay()]);

export const getScheduledDateToday = (settings: NotificationSettings): Date => {
  const date = new Date();
  let hour = settings.hour % 12;
  if (settings.period === 'pm') hour += 12;
  date.setHours(hour, settings.minute, 0, 0);
  return date;
};

export const wasReminderFiredToday = (): boolean => {
  try {
    return window.localStorage.getItem(FIRED_PREFIX + todayKey()) === 'true';
  } catch {
    return false;
  }
};

export const markReminderFiredToday = (): void => {
  try {
    window.localStorage.setItem(FIRED_PREFIX + todayKey(), 'true');
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};

interface DailyReminder {
  showBanner: boolean;
  dismissBanner: () => void;
}

export const useDailyReminder = (
  settings: NotificationSettings,
  isDailyTaskCompleted: boolean
): DailyReminder => {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISSED_PREFIX + todayKey()) === 'true';
    } catch {
      return false;
    }
  });

  // If the app stays open past midnight, re-check the new day's dismissal flag.
  useEffect(() => {
    const interval = window.setInterval(() => {
      try {
        setIsDismissed(window.localStorage.getItem(DISMISSED_PREFIX + todayKey()) === 'true');
      } catch {
        /* noop */
      }
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const dismissBanner = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISSED_PREFIX + todayKey(), 'true');
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
    setIsDismissed(true);
  }, []);

  const showBanner = isTodayScheduled(settings) && !isDailyTaskCompleted && !isDismissed;

  return { showBanner, dismissBanner };
};
