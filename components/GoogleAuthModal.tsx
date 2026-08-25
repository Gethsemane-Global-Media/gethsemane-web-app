import React, { useState, useEffect } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { useAuth } from '../context/AuthContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSignUp?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isSignUp = false,
}) => {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If a real Google Client ID is provided, we can trigger OAuth redirect
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleOAuthRedirect = () => {
    if (googleClientId) {
      const redirectUri = encodeURIComponent(window.location.origin);
      const scope = encodeURIComponent('email profile openid');
      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
      window.location.href = googleOAuthUrl;
      return;
    }
  };

  const handleAccountSelect = async (account: { name: string; email: string; avatar: string }) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatar_url: account.avatar,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const googleAccounts = [
    {
      name: 'Precious Ebubechukwu',
      email: 'precious@gkni.org',
      avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      badge: 'GKNI Ministry Account',
    },
    {
      name: 'David Dauda',
      email: 'apostledaviddauda@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=David%20Dauda',
      badge: 'Personal Google Account',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 text-neutral-900 dark:text-white shadow-2xl animate-fade-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Google Header */}
        <div className="text-center pt-2 pb-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm mb-3">
            <GoogleIcon />
          </div>
          <h2 className="text-lg font-bold">
            {isSignUp ? 'Choose a Google Account to Sign Up' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            to continue to <strong className="text-neutral-700 dark:text-neutral-300">The Bible Experience</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Google Account List */}
        <div className="py-4 space-y-2">
          {googleAccounts.map((acc) => (
            <button
              key={acc.email}
              disabled={loading}
              onClick={() => handleAccountSelect(acc)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 transition-all cursor-pointer text-left group"
            >
              <img
                src={acc.avatar}
                alt={acc.name}
                className="w-10 h-10 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-brand-accent transition-colors">
                  {acc.name}
                </div>
                <div className="text-[11px] text-neutral-500 truncate">{acc.email}</div>
                <span className="inline-block text-[9px] text-neutral-400 font-medium">{acc.badge}</span>
              </div>
              <svg className="w-4 h-4 text-neutral-400 group-hover:text-brand-accent transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Use another account / OAuth trigger */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (googleClientId) {
                handleOAuthRedirect();
              } else {
                handleAccountSelect({
                  name: 'New Google Member',
                  email: `member-${Math.floor(Math.random() * 1000)}@gmail.com`,
                  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Google%20User',
                  badge: 'Google Account',
                });
              }
            }}
            className="w-full py-2.5 text-xs font-semibold text-brand-accent hover:underline flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Use another Google account
          </button>

          <p className="text-[10px] text-neutral-400 mt-2">
            To continue, Google will share your name, email address, and profile picture with Behold.
          </p>
        </div>
      </div>
    </div>
  );
};
