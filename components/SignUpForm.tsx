import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';
import { EmailIcon } from './icons/EmailIcon';
import { GoogleAuthModal } from './GoogleAuthModal';

interface SignUpFormProps {
  onNavigateToSignIn: () => void;
  onNavigateToEmailSignUp: () => void;
  onNavigateToSuccess: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onNavigateToSignIn, onNavigateToEmailSignUp, onNavigateToSuccess }) => {
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  return (
    <div className="flex flex-col justify-between flex-grow pt-16">
      <div>
        <h1 className="text-4xl font-medium text-brand-primary mb-12">Sign up</h1>
        <div className="space-y-4">
          <button
            type="button"
            onClick={onNavigateToEmailSignUp}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <EmailIcon />
            Sign up with Email
          </button>
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <GoogleIcon />
            Sign up with Google
          </button>
        </div>
      </div>
      <div className="pb-4">
        <p className="text-center text-brand-secondary">
          Have an account?{' '}
          <button type="button" onClick={onNavigateToSignIn} className="font-semibold text-brand-accent hover:underline">
            Sign in
          </button>
        </p>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={onNavigateToSuccess}
        isSignUp={true}
      />
    </div>
  );
};

export default SignUpForm;
