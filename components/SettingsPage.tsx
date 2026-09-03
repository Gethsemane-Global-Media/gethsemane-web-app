import React, { useState } from 'react';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { PlayCircleIcon } from './icons/PlayCircleIcon';
import { NotificationIcon } from './icons/NotificationIcon';
import { ShareIcon } from './icons/ShareIcon';
import { TelegramIcon, YouTubeIcon, FacebookIcon, InstagramIcon } from './icons/SocialIcons';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);

  // Authenticated user state takes precedence
  const displayName = user?.name || profile.name || 'Disciple';
  const displayRole = user?.role || profile.role || 'Community Member';
  const displayAvatar = user?.avatarUrl || profile.avatarUrl;

  const settingsItems = [
    { icon: <PlusCircleIcon />, label: 'Create Bible plans', onClick: onNavigateToCreatePlan },
    { icon: <PlayCircleIcon />, label: 'Audio Scripture', onClick: () => {} },
    { icon: <NotificationIcon />, label: 'Notification settings', onClick: onNavigateToNotificationSettings },
  ];

  const handleShare = async () => {
    const shareData = {
      title: 'Gethsemane',
      text: 'Join me on Gethsemane to grow your faith!',
      url: window.location.origin,
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
    <div className="flex-grow flex flex-col min-h-screen overflow-y-auto pb-36">
      <main className="flex-grow px-6 pt-6 flex flex-col">
        <h1 className="text-4xl font-bold text-brand-dark">Settings</h1>

        <section className="mt-8">
          <div className="flex items-start gap-5">
            <div className="shrink-0">
              <div
                className="w-24 h-24 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white shadow-sm"
                style={{ backgroundImage: `url('${displayAvatar}')` }}
                role="img"
                aria-label={`${displayName}'s profile`}
              />
              <button
                onClick={onNavigateToEditProfile}
                className="mt-3 text-brand-dark font-medium text-sm hover:underline cursor-pointer"
              >
                Edit profile
              </button>
            </div>

            <div className="relative pt-3 min-w-0 flex-1">
              <div className="absolute -left-5 top-8 flex items-center">
                <div className="w-4 h-px bg-brand-primary" />
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
              </div>
              <h2 className="text-xl font-medium text-brand-dark leading-tight truncate">{displayName}</h2>
              <p className="text-brand-secondary text-sm mt-1">{displayRole}</p>
            </div>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          {settingsItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex items-center w-full text-left gap-4 text-brand-dark text-base sm:text-lg hover:text-brand-accent transition-colors cursor-pointer"
            >
              <span className="text-brand-primary shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}

          <button
            onClick={logout}
            className="flex items-center w-full text-left gap-4 text-red-600 text-base sm:text-lg hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span className="shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span>Sign out</span>
          </button>
        </section>

        {/* Official Ministry Social & Broadcast Channels */}
        <section className="mt-10 rounded-3xl bg-brand-bg/60 border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-green/10 text-brand-green text-[10px] font-bold uppercase tracking-wider">
              Official Media
            </span>
          </div>
          <h2 className="text-sm font-bold text-brand-dark">Gethsemane Kingdom Network International</h2>
          <p className="text-xs text-brand-secondary mt-0.5 mb-4 leading-relaxed">
            Stay connected with audio broadcasts, livestream services, and official ministry lines.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
            <a
              href="https://t.me/GKNI_Official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-sky-700 hover:border-sky-300 hover:bg-sky-50/50 shadow-xs transition-all"
            >
              <TelegramIcon size={18} className="text-sky-500 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate">Telegram Channel</div>
                <div className="text-[10px] text-gray-400 font-normal truncate">@GKNI_Official</div>
              </div>
            </a>

            <a
              href="https://youtube.com/@GKNIOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-red-600 hover:border-red-300 hover:bg-red-50/50 shadow-xs transition-all"
            >
              <YouTubeIcon size={18} className="text-red-500 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate">YouTube Official</div>
                <div className="text-[10px] text-gray-400 font-normal truncate">@GKNIOfficial</div>
              </div>
            </a>

            <a
              href="https://www.facebook.com/GKNIOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50/50 shadow-xs transition-all"
            >
              <FacebookIcon size={18} className="text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate">Facebook Page</div>
                <div className="text-[10px] text-gray-400 font-normal truncate">/GKNIOfficial</div>
              </div>
            </a>

            <a
              href="https://www.instagram.com/gkni.official"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-gray-200 text-pink-700 hover:border-pink-300 hover:bg-pink-50/50 shadow-xs transition-all"
            >
              <InstagramIcon size={18} className="text-pink-600 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate">Instagram Handle</div>
                <div className="text-[10px] text-gray-400 font-normal truncate">@gkni.official</div>
              </div>
            </a>

            <a
              href="https://wa.me/2349034694585"
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-1 sm:col-span-2 flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50/60 shadow-xs transition-all"
            >
              <WhatsAppIcon size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0 flex-1 truncate">
                <div className="truncate">Official WhatsApp Helpline</div>
                <div className="text-[10px] text-emerald-600 font-normal truncate">+234 903 469 4585</div>
              </div>
            </a>
          </div>
        </section>

        <section className="mt-8 pt-4 text-center">
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-3 text-brand-accent font-semibold hover:underline cursor-pointer"
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
