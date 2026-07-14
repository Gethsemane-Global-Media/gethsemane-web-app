import React from 'react';
import { NotificationIcon } from './icons/NotificationIcon';
import { CloseIcon } from './icons/CloseIcon';

interface ReminderBannerProps {
  planTitle: string;
  onReadNow: () => void;
  onDismiss: () => void;
}

const ReminderBanner: React.FC<ReminderBannerProps> = ({ planTitle, onReadNow, onDismiss }) => (
  <div className="mx-6 mb-2 bg-white border border-brand-green/30 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
    <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
      <NotificationIcon size={20} />
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-brand-dark font-semibold text-sm">Time for your daily reading</p>
      <p className="text-brand-secondary text-xs mt-0.5 truncate">{planTitle}</p>
    </div>
    <button
      onClick={onReadNow}
      className="shrink-0 px-4 py-2 bg-brand-green text-white rounded-full font-semibold text-xs hover:bg-opacity-90 transition-colors"
    >
      Read now
    </button>
    <button
      onClick={onDismiss}
      className="shrink-0 text-brand-secondary p-1 -mr-1"
      aria-label="Dismiss reminder"
    >
      <CloseIcon size={18} />
    </button>
  </div>
);

export default ReminderBanner;
