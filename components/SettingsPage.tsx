import React, { useState } from 'react';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { NotificationIcon } from './icons/NotificationIcon';
import { ShareIcon } from './icons/ShareIcon';
import { useUserProfile } from '../hooks/useUserProfile';
import ShareModal from './ShareModal';

interface SettingsPageProps {
  onNavigateToEditProfile: () => void;
  onNavigateToNotificationSettings: () => void;
  onNavigateToCreatePlan: () => void;
  onNavigateToBookmarks: () => void;
  onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  onNavigateToEditProfile,
  onNavigateToNotificationSettings,
  onNavigateToCreatePlan,
}) => {
  const [profile] = useUserProfile();
  const [showShareModal, setShowShareModal] = useState(false);

  const settingsItems = [
    { icon: <PlusCircleIcon />, label: 'Create Bible plans', onClick: onNavigateToCreatePlan },
    { icon: <PlayCircleIcon />, label: 'Audio Scripture', onClick: () => {} },
    { icon: <NotificationIcon />, label: 'Notification settings', onClick: onNavigateToNotificationSettings },
  ];

  const handleShare = async () => {
    const shareData = {
      title: 'Behold App',
      text: 'Join me on Behold to grow your faith!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <div className="flex-grow flex flex-col">
      <header className="flex items-center gap-2 px-6 h-20 shrink-0">
        <div className="h-10 w-px bg-brand-green" />
        <span className="text-3xl font-medium tracking-wider text-brand-green">BEHOLD</span>
      </header>

      <main className="flex-grow px-6 pb-6 flex flex-col">
        <h1 className="text-4xl font-bold text-brand-dark">Settings</h1>

        <section className="mt-8">
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <div
                className="w-24 h-24 rounded-full bg-gray-200 bg-cover bg-center"
                style={{ backgroundImage: `url('${profile.avatarUrl}')` }}
                role="img"
                aria-label={`${profile.name}'s profile`}
              />
              <button
                onClick={onNavigateToEditProfile}
                className="mt-3 text-brand-dark font-medium text-sm hover:underline"
              >
                Edit profile
              </button>
            </div>

            <div className="relative pt-3 min-w-0 flex-1">
              <div className="absolute -left-5 top-8 flex items-center">
                <div className="w-4 h-px bg-brand-primary" />
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              </div>
              <h2 className="text-xl font-medium text-brand-dark leading-tight">{profile.name}</h2>
              <p className="text-brand-secondary text-sm mt-1">{profile.role}</p>
            </div>
          </div>
        </section>

        <section className="mt-12 space-y-7">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center w-full text-left gap-4 text-brand-dark text-lg"
            >
              <span className="text-brand-primary shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </section>

        <section className="mt-auto pb-24 pt-10 text-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-3 text-brand-accent font-semibold"
          >
            <ShareIcon />
            <span>Share with friends</span>
          </button>
        </section>
      </main>

      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
    </div>
  );
};

export default SettingsPage;
