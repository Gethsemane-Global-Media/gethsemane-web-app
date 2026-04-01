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
    onNavigateToBookmarks: () => void; // Kept for type compatibility, but not used in UI
    onNavigateBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToEditProfile, onNavigateToNotificationSettings, onNavigateToCreatePlan, onNavigateBack }) => {
    const [profile] = useUserProfile();
    const [showShareModal, setShowShareModal] = useState(false);

    const settingsItems = [
        { icon: <PlusCircleIcon />, label: 'Create Bible plans', onClick: onNavigateToCreatePlan },
        { icon: <PlayCircleIcon />, label: 'Audio Scripture', onClick: () => {} },
        { icon: <NotificationIcon />, label: 'Notification settings', onClick: onNavigateToNotificationSettings },
    ];

    const handleShare = async () => {
        const shareData = {
            title: 'GSOM App',
            text: 'Join me on GSOM to grow your faith!',
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
                 // Fallback to modal if user cancels share sheet on some devices or an error occurs.
                setShowShareModal(true);
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            setShowShareModal(true);
        }
    };

    return (
        <div className="flex-grow flex flex-col">
            <header className="flex items-center p-6 h-20 shrink-0">
                <div className="flex items-center">
                    <span className="h-8 w-px bg-brand-green mr-2"></span>
                    <span className="text-2xl font-medium tracking-wider text-brand-green">GSOM</span>
                </div>
            </header>
            <main className="flex-grow px-6 pb-6 flex flex-col">
                <h1 className="text-4xl font-medium text-brand-primary">Settings</h1>

                <section className="flex flex-col items-center text-center mt-8 relative">
                    <div className="w-28 h-28 rounded-full bg-gray-300 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}></div>
                    {/* Decorative line */}
                    <div className="absolute top-14 left-1/2 pl-14">
                        <div className="relative">
                            <div className="w-10 h-px bg-brand-primary transform -translate-y-1/2"></div>
                            <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-brand-primary rounded-full transform -translate-y-1/2 translate-x-1/2"></div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-medium text-brand-dark">{profile.name}</h2>
                        <p className="text-brand-secondary text-sm">{profile.role}</p>
                    </div>
                    <button onClick={onNavigateToEditProfile} className="mt-2 text-brand-primary font-medium text-sm hover:underline">
                        Edit profile
                    </button>
                </section>

                <section className="mt-12 space-y-6">
                    {settingsItems.map((item, index) => (
                        <button key={index} onClick={item.onClick} className="flex items-center w-full text-left gap-4 text-brand-primary text-lg">
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </section>
                
                <section className="mt-auto pb-24 text-center">
                    <button onClick={handleShare} className="flex items-center justify-center gap-3 text-brand-accent font-semibold mx-auto">
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