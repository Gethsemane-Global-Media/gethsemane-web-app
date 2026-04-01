
import React from 'react';
import { MailSentIcon } from './icons/MailSentIcon';

interface ForgotPasswordSentScreenProps {
  onNavigateToSignIn: () => void;
}

const ForgotPasswordSentScreen: React.FC<ForgotPasswordSentScreenProps> = ({ onNavigateToSignIn }) => {
  return (
    <div className="flex flex-col justify-between flex-grow">
      <div className="text-center flex-grow flex flex-col justify-center items-center">
        <MailSentIcon />
        <h1 className="text-3xl font-medium text-brand-primary mt-8">
          Check your email
        </h1>
        <p className="text-brand-secondary mt-4 max-w-sm">
          We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
        </p>
      </div>
      <div className="pb-4">
        <button onClick={onNavigateToSignIn} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
          Back to Sign in
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordSentScreen;
