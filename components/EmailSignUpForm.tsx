import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';

interface EmailSignUpFormProps {
  onNavigateToSignIn: () => void;
  onNavigateToSuccess: () => void;
}

const EmailSignUpForm: React.FC<EmailSignUpFormProps> = ({ onNavigateToSignIn, onNavigateToSuccess }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await register(fullName.trim(), email.trim(), password);
      onNavigateToSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignUp} className="flex flex-col justify-between flex-grow pt-16">
        <div>
          <h1 className="text-4xl font-medium text-brand-primary mb-8">Sign up</h1>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="fullname-signup" className="text-sm text-brand-secondary">Full name</label>
              <input
                id="fullname-signup"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Full name"
              />
            </div>
            <div>
              <label htmlFor="email-signup" className="text-sm text-brand-secondary">Email</label>
              <input
                id="email-signup"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Email"
              />
            </div>
            <div>
              <label htmlFor="password-signup" className="text-sm text-brand-secondary">Password</label>
              <input
                id="password-signup"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a secure password (min. 6 chars)"
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Password"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-dark text-white rounded-full font-semibold text-base hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Creating Account...' : 'Sign up'}
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-brand-bg px-3 text-xs text-brand-secondary uppercase tracking-wider absolute">or</span>
            </div>

            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-white rounded-full border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              <GoogleIcon />
              Sign up with Google
            </button>
          </div>
        </div>

        <div className="pb-4 pt-6">
          <p className="text-center text-brand-secondary">
            Have an account?{' '}
            <button type="button" onClick={onNavigateToSignIn} className="font-semibold text-brand-accent hover:underline">
              Sign in
            </button>
          </p>
        </div>
      </form>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={onNavigateToSuccess}
        isSignUp={true}
      />
    </>
  );
};

export default EmailSignUpForm;
