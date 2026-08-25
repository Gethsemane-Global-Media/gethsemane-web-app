import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { EmailIcon } from './icons/EmailIcon';
import { GoogleAuthModal } from './GoogleAuthModal';

interface SignInFormProps {
  onNavigateToSignUp: () => void;
  onNavigateToEmailSignIn: () => void;
  onSignInSuccess: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onNavigateToSignUp, onNavigateToEmailSignIn, onSignInSuccess }) => {
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  return (
    <div className="flex flex-col justify-between flex-grow pt-16">
      <div>
        <h1 className="text-4xl font-medium text-brand-primary mb-12">Sign in</h1>
        <div className="space-y-4">
          <button
            type="button"
            onClick={onNavigateToEmailSignIn}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <EmailIcon />
            Sign in with Email
          </button>
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Sign in with Google
          </button>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-center text-brand-secondary">
          No account?{' '}
          <button type="button" onClick={onNavigateToSignUp} className="font-semibold text-brand-accent hover:underline">
            Sign up
          </button>
        </p>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={onSignInSuccess}
        isSignUp={false}
      />
    </div>
  );
};

export default SignInForm;
