import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
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
                placeholder="your.email@example.com"
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Email"
              />
            </div>
            <div>
              <label htmlFor="password-signin" className="text-sm text-brand-secondary">Password</label>
              <input
                id="password-signin"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                aria-label="Password"
              />
              <div className="text-right mt-2">
                <button type="button" onClick={onNavigateToForgotPassword} className="text-sm font-semibold text-brand-accent hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>
          </div>

          <div className="text-center my-8 text-brand-secondary text-sm">or</div>

          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="text-center mt-6 text-brand-secondary">
            No account?{' '}
            <button type="button" onClick={onNavigateToSignUp} className="font-semibold text-brand-accent hover:underline">
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