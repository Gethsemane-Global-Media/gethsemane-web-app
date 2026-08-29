import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';

interface EmailSignInFormProps {
  onNavigateToSignUp: () => void;
  onSignInSuccess: () => void;
  onNavigateToForgotPassword: () => void;
}

const EmailSignInForm: React.FC<EmailSignInFormProps> = ({
  onNavigateToSignUp,
  onSignInSuccess,
  onNavigateToForgotPassword,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await login(email.trim(), password);
      onSignInSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignIn} className="flex flex-col justify-between flex-grow pt-16">
        <div>
          <h1 className="text-4xl font-medium text-brand-primary mb-8">Sign in</h1>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="email-signin" className="text-sm text-brand-secondary">Email</label>
              <input
                id="email-signin"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Email"
              />
            </div>
            <div>
              <label htmlFor="password-signin" className="text-sm text-brand-secondary">Password</label>
              <div className="relative mt-1">
                <input
                  id="password-signin"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-brand-dark p-1 cursor-pointer transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button type="button" onClick={onNavigateToForgotPassword} className="text-sm font-semibold text-brand-accent hover:underline cursor-pointer">
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-dark text-white rounded-full font-semibold text-base hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-md cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-brand-bg px-3 text-xs text-brand-secondary uppercase tracking-wider absolute">or</span>
            </div>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white rounded-full border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="pb-4 pt-6">
          <p className="text-center text-brand-secondary">
            No account?{' '}
            <button type="button" onClick={onNavigateToSignUp} className="font-semibold text-brand-accent hover:underline cursor-pointer">
              Sign up
            </button>
          </p>
        </div>
      </form>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={onSignInSuccess}
        isSignUp={false}
      />
    </>
  );
};

export default EmailSignInForm;