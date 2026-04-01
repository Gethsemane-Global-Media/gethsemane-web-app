import React, { useState, useRef, useEffect } from 'react';
import { useNotificationSettings, NotificationSettings, Day } from '../hooks/useNotificationSettings';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface NotificationSettingsPageProps {
  onNavigateBack: () => void;
}

const TimePickerColumn: React.FC<{ 
  values: number[]; 
  selectedValue: number; 
  onValueChange: (value: number) => void;
  label?: string;
  isHour?: boolean;
}> = ({ values, selectedValue, onValueChange, label, isHour = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 60; // px
  const VISIBLE_HEIGHT = 180; // px
  const PADDING_OFFSET = VISIBLE_HEIGHT / 2 - ITEM_HEIGHT / 2; // leading/trailing padding so selected item centers
  const snapTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      const selectedIndex = Math.max(0, values.indexOf(selectedValue));
      const scrollTop = PADDING_OFFSET + selectedIndex * ITEM_HEIGHT;
      scrollRef.current.scrollTop = scrollTop;
    }
  }, [selectedValue, values]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollTop = scrollRef.current.scrollTop;
      const rawIndex = Math.round((scrollTop - PADDING_OFFSET) / ITEM_HEIGHT);
      const selectedIndex = Math.min(Math.max(rawIndex, 0), values.length - 1);
      const newValue = values[selectedIndex];
      if (newValue !== selectedValue) {
        onValueChange(newValue);
      }

      // Debounced snap to the exact item position to avoid jitter/glitch
      if (snapTimeoutRef.current) {
        window.clearTimeout(snapTimeoutRef.current);
      }
      snapTimeoutRef.current = window.setTimeout(() => {
        if (!scrollRef.current) return;
        const targetTop = PADDING_OFFSET + selectedIndex * ITEM_HEIGHT;
        scrollRef.current.scrollTo({ top: targetTop, behavior: 'auto' });
      }, 120);
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative w-16 h-48 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto scrollbar-hide" 
          onScroll={handleScroll}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div 
            className="flex flex-col items-center"
            style={{ paddingTop: `${PADDING_OFFSET}px`, paddingBottom: `${PADDING_OFFSET}px` }}
          >
            {values.map((value, index) => {
              const isSelected = value === selectedValue;
              const displayValue = isHour ? value : value.toString().padStart(2, '0');
              return (
                <div 
                  key={value}
                  className={`h-15 flex items-center justify-center text-2xl font-semibold transition-colors ${
                    isSelected ? 'text-brand-accent' : 'text-brand-inactive'
                  }`}
                  style={{ height: `${ITEM_HEIGHT}px` }}
                >
                  {displayValue}
                </div>
              );
            })}
          </div>
        </div>
        {/* Selection highlight overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-15 -translate-y-1/2 bg-brand-accent rounded-lg opacity-20"></div>
        </div>
      </div>
      {label && <span className="text-4xl font-semibold text-brand-dark mx-2">{label}</span>}
    </div>
  );
};

const DayButton: React.FC<{ day: Day; isSelected: boolean; onClick: () => void }> = ({ day, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center text-lg font-medium transition-colors ${
      isSelected ? 'w-10 h-10 rounded-full bg-brand-green text-white' : 'text-brand-secondary px-2'
    }`}
  >
    {day}
  </button>
);



const NotificationSettingsPage: React.FC<NotificationSettingsPageProps> = ({ onNavigateBack }) => {
  const [initialSettings, updateSettings] = useNotificationSettings();
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);

  const handleSave = () => {
    updateSettings(settings);
    onNavigateBack();
  };
  
  const handleToggleDay = (day: Day) => {
    setSettings(prev => {
        const repeatDays = prev.repeatDays.includes(day)
            ? prev.repeatDays.filter(d => d !== day)
            : [...prev.repeatDays, day];
        return { ...prev, repeatDays };
    });
  };

  const handleHourChange = (hour: number) => {
    setSettings(prev => ({ ...prev, hour }));
  };

  const handleMinuteChange = (minute: number) => {
    setSettings(prev => ({ ...prev, minute }));
  };

  const handlePeriodChange = (period: 'am' | 'pm') => {
    setSettings(prev => ({ ...prev, period }));
  };

  // Generate arrays for time picker
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ALL_DAYS: Day[] = ['M', 'T', 'W', 'Th', 'F', 'S', 'Su'];

  return (
    <div className="flex flex-col h-screen bg-brand-bg">
      <div className="flex-grow p-6 flex flex-col overflow-hidden">
        <header className="flex items-center h-16 shrink-0">
          <button onClick={onNavigateBack} className="text-brand-dark p-2 -ml-2">
            <ArrowLeftIcon size={24} />
          </button>
          <div className="flex-grow flex items-center">
            <span className="h-8 w-px bg-brand-green mr-3"></span>
            <span className="text-2xl font-medium tracking-wider text-brand-green">GSOM</span>
          </div>
        </header>
        
        <main className="flex-grow flex flex-col pt-4 overflow-y-auto pb-24">
          <h1 className="text-3xl font-medium text-brand-dark mb-8">Notifications</h1>

          <section className="flex justify-center items-center my-12">
            <TimePickerColumn 
              values={hours} 
              selectedValue={settings.hour} 
              onValueChange={handleHourChange}
              isHour={true}
            />
            <span className="text-4xl font-semibold text-brand-dark mx-4">:</span>
            <TimePickerColumn 
              values={minutes} 
              selectedValue={settings.minute} 
              onValueChange={handleMinuteChange}
            />
            <div className="flex flex-col items-start w-16 ml-6">
              <button 
                onClick={() => handlePeriodChange('am')}
                className={`text-2xl font-semibold transition-colors ${
                  settings.period === 'am' ? 'text-brand-accent' : 'text-brand-inactive'
                }`}
              >
                am
              </button>
              <button 
                onClick={() => handlePeriodChange('pm')}
                className={`text-2xl font-semibold mt-8 transition-colors ${
                  settings.period === 'pm' ? 'text-brand-accent' : 'text-brand-inactive'
                }`}
              >
                pm
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">Repeat Days</h2>
            <div className="flex justify-between items-center">
              {ALL_DAYS.map(day => (
                <DayButton 
                  key={day} 
                  day={day} 
                  isSelected={settings.repeatDays.includes(day)}
                  onClick={() => handleToggleDay(day)}
                />
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-semibold text-brand-dark mb-2">Ringtone</h2>
            <div className="relative">
              <select 
                value={settings.ringtone}
                onChange={(e) => setSettings(s => ({ ...s, ringtone: e.target.value }))}
                className="w-full bg-transparent text-xl text-brand-inactive appearance-none border-b-2 border-gray-200 py-2 focus:outline-none focus:border-brand-accent"
              >
                <option>Sound the alarm</option>
                <option>Chimes</option>
                <option>Beep</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDownIcon size={20} />
              </div>
            </div>
          </section>

          <section className="mt-auto flex items-center justify-end gap-6 pb-4">
            <button 
              onClick={onNavigateBack} 
              className="text-brand-inactive font-semibold text-lg px-6 py-3 hover:text-brand-secondary transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              className="px-8 py-3 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
            >
              Save
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
