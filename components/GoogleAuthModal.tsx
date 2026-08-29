import React, { useState, useEffect, useRef } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { useAuth } from '../context/AuthContext';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isSignUp?: boolean;
}

declare global {
  interface Window {
    google?: any;
  }
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
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Parse Google JWT ID Token safely without external deps
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const handleCredentialResponse = async (response: any) => {
    if (!response.credential) {
      setErrorMsg('No Google credential token received.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = parseJwt(response.credential);
      if (!payload || !payload.email) {
        throw new Error('Could not parse Google user profile.');
      }

      await loginWithGoogle({
        email: payload.email,
        name: payload.name || payload.given_name || 'Google User',
        google_id: payload.sub,
        avatar_url: payload.picture,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const initGoogleGsi = () => {
      if (!googleClientId) return;

      if (window.google?.accounts?.id && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: isSignUp ? 'signup_with' : 'signin_with',
          shape: 'pill',
        });
      }
    };

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) initGoogleGsi();
      };
      document.head.appendChild(script);
    } else {
      initGoogleGsi();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, googleClientId, isSignUp]);

  const handleOAuthRedirect = () => {
    if (!googleClientId) {
      setErrorMsg('Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
      return;
    }

    const redirectUri = encodeURIComponent(window.location.origin);
    const scope = encodeURIComponent('email profile openid');
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    window.location.href = googleOAuthUrl;
  };

  if (!isOpen) return null;

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
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            to continue to <strong className="text-neutral-700 dark:text-neutral-300">Gethsemane</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="my-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Production Google Identity Render Target */}
        <div className="py-6 flex flex-col items-center justify-center min-h-[120px]">
          {loading ? (
            <div className="text-center space-y-2 py-4">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-green border-t-transparent"></div>
              <p className="text-xs text-neutral-500">Authenticating with Google Identity...</p>
            </div>
          ) : googleClientId ? (
            <div className="w-full flex flex-col items-center space-y-3">
              <div ref={googleBtnRef} className="flex justify-center" />
              <button
                type="button"
                onClick={handleOAuthRedirect}
                className="text-[11px] text-neutral-500 hover:text-brand-green underline transition-colors"
              >
                Or continue via Google Web OAuth redirect
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left space-y-2">
              <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                ⚠️ Google OAuth Configuration Needed
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                Add your Google Cloud OAuth Client ID to <code className="font-mono bg-white/70 dark:bg-black/40 px-1 py-0.5 rounded">.env</code>:
              </p>
              <div className="p-2 rounded bg-white dark:bg-neutral-950 font-mono text-[10px] text-neutral-700 dark:text-neutral-300 break-all select-all">
                VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
          <p className="text-[10px] text-neutral-400">
            Google will securely share your verified name, email address, and profile photo with Gethsemane.
          </p>
        </div>
      </div>
    </div>
  );
};
