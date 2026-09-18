import React, { useState, useRef, useEffect } from 'react';
import {
  useNotificationSettings,
  NotificationSettings,
  Day,
} from '../hooks/useNotificationSettings';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface NotificationSettingsPageProps {
  onNavigateBack: () => void;
}

const ALL_DAYS: Day[] = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

const TimePickerColumn: React.FC<{
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  isHour?: boolean;
  isSettingMode: boolean;
}> = ({ values, selectedValue, onValueChange, isHour = false, isSettingMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 52;
  const VISIBLE_HEIGHT = 156;
  const PADDING_OFFSET = VISIBLE_HEIGHT / 2 - ITEM_HEIGHT / 2;
  const snapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = Math.max(0, values.indexOf(selectedValue));
      scrollRef.current.scrollTop = PADDING_OFFSET + selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedValue, values, PADDING_OFFSET]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const rawIndex = Math.round((scrollRef.current.scrollTop - PADDING_OFFSET) / ITEM_HEIGHT);
    const selectedIndex = Math.min(Math.max(rawIndex, 0), values.length - 1);
    const newValue = values[selectedIndex];
    if (newValue !== selectedValue) onValueChange(newValue);

    if (snapTimeoutRef.current) window.clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = window.setTimeout(() => {
      if (!scrollRef.current) return;
      scrollRef.current.scrollTo({
        top: PADDING_OFFSET + selectedIndex * ITEM_HEIGHT,
        behavior: 'auto',
      });
    }, 120);
  };

  return (
    <div className="relative w-14 h-[156px] overflow-hidden">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
      >
        <div
          className="flex flex-col items-center"
          style={{ paddingTop: PADDING_OFFSET, paddingBottom: PADDING_OFFSET }}
        >
          {values.map((value) => {
            const isSelected = value === selectedValue;
            const displayValue = isHour ? value : value.toString().padStart(2, '0');
            return (
              <div
                key={value}
                className={`flex items-center justify-center text-2xl font-semibold transition-colors ${
                  isSelected
                    ? isSettingMode
                      ? 'text-brand-accent'
                      : 'text-brand-dark'
                    : 'text-brand-inactive'
                }`}
                style={{ height: ITEM_HEIGHT }}
              >
                {displayValue}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const DayButton: React.FC<{
  day: Day;
  isSelected: boolean;
  isSettingMode: boolean;
  onClick: () => void;
}> = ({ day, isSelected, isSettingMode, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center text-base font-medium transition-colors ${
      isSelected && isSettingMode
        ? 'w-10 h-10 rounded-full bg-brand-green text-white'
        : isSelected
          ? 'font-semibold text-brand-dark'
          : isSettingMode
            ? 'text-brand-accent/70 px-1'
            : 'text-brand-secondary px-1'
    }`}
  >
    {day}
  </button>
);

const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ onNavigateBack }) => {
  const [savedSettings, updateSettings] = useNotificationSettings();
  const [settings, setSettings] = useState<NotificationSettings>(savedSettings);
  const [isSettingMode, setIsSettingMode] = useState(savedSettings.isConfigured);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const enterSettingMode = () => {
    if (!isSettingMode) setIsSettingMode(true);
  };

  const handleSave = () => {
    const nextSettings: NotificationSettings = {
      ...settings,
      isConfigured: isSettingMode && settings.repeatDays.length > 0,
    };
    updateSettings(nextSettings);
    if (nextSettings.isConfigured && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    onNavigateBack();
  };

  const handleToggleDay = (day: Day) => {
    enterSettingMode();
    setSettings((prev) => {
      const repeatDays = prev.repeatDays.includes(day)
        ? prev.repeatDays.filter((d) => d !== day)
        : [...prev.repeatDays, day];
      return { ...prev, repeatDays };
    });
  };

  const handleHourChange = (hour: number) => {
    enterSettingMode();
    setSettings((prev) => ({ ...prev, hour }));
  };

  const handleMinuteChange = (minute: number) => {
    enterSettingMode();
    setSettings((prev) => ({ ...prev, minute }));
  };

  const handlePeriodChange = (period: 'am' | 'pm') => {
    enterSettingMode();
    setSettings((prev) => ({ ...prev, period }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg">
      <header className="shrink-0 px-6 pt-4 pb-2">
        <button
          onClick={onNavigateBack}
          className="text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeftIcon size={28} />
        </button>
      </header>

      <main className="flex-grow flex flex-col px-6 pb-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-brand-dark">Notifications</h1>

        <section className="mt-10 mb-8">
          <div className="border-t border-brand-dark/80 mx-2" />
          <div className="flex justify-center items-center py-2">
            <TimePickerColumn
              values={hours}
              selectedValue={settings.hour}
              onValueChange={handleHourChange}
              isHour
              isSettingMode={isSettingMode}
            />
            <span
              className={`text-3xl font-semibold mx-3 ${
                isSettingMode ? 'text-brand-accent' : 'text-brand-dark'
              }`}
            >
              :
            </span>
            <TimePickerColumn
              values={minutes}
              selectedValue={settings.minute}
              onValueChange={handleMinuteChange}
              isSettingMode={isSettingMode}
            />
            <div className="flex flex-col items-start ml-5 gap-6">
              <button
                onClick={() => handlePeriodChange('am')}
                className={`text-xl font-semibold transition-colors ${
                  settings.period === 'am'
                    ? isSettingMode
                      ? 'text-brand-accent'
                      : 'text-brand-dark'
                    : 'text-brand-inactive'
                }`}
              >
                am
              </button>
              <button
                onClick={() => handlePeriodChange('pm')}
                className={`text-xl font-semibold transition-colors ${
                  settings.period === 'pm'
                    ? isSettingMode
                      ? 'text-brand-accent'
                      : 'text-brand-dark'
                    : 'text-brand-inactive'
                }`}
              >
                pm
              </button>
            </div>
          </div>
          <div className="border-t border-brand-dark/80 mx-2" />
        </section>

        <section className="mb-8">
          <h2 className="text-lg font-medium text-brand-dark mb-5">
            {isSettingMode ? 'Repeat Days' : 'Days'}
          </h2>
          <div className="flex justify-between items-center max-w-sm">
            {ALL_DAYS.map((day) => (
              <DayButton
                key={day}
                day={day}
                isSelected={settings.repeatDays.includes(day)}
                isSettingMode={isSettingMode}
                onClick={() => handleToggleDay(day)}
              />
            ))}
          </div>
        </section>

        {isSettingMode && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-brand-dark mb-3">Ringtone</h2>
            <div className="relative border-b border-gray-200 pb-2">
              <select
                value={settings.ringtone}
                onChange={(e) => setSettings((s) => ({ ...s, ringtone: e.target.value }))}
                className="w-full bg-transparent text-lg text-brand-inactive appearance-none py-1 focus:outline-none"
              >
                <option>Sound the alarm</option>
                <option>Chimes</option>
                <option>Beep</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pointer-events-none text-brand-inactive">
                <ChevronDownIcon size={20} />
              </div>
            </div>
          </section>
        )}

        <section className="mt-auto flex items-center justify-between pt-8 pb-20">
          <button
            onClick={onNavigateBack}
            className="text-brand-inactive font-medium text-lg hover:text-brand-secondary transition-colors"
          >
            Cancel
          </button>
          {isSettingMode ? (
            <button
              onClick={handleSave}
              className="px-10 py-3 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
            >
              Save
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="text-brand-dark font-medium text-lg hover:text-brand-primary transition-colors"
            >
              Save
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default NotificationSettingsPage;
