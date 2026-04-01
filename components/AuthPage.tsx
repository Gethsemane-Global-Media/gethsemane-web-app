
import React, { useState, useCallback } from 'react';
import { AuthView } from '../types';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import EmailSignInForm from './EmailSignInForm';
import EmailSignUpForm from './EmailSignUpForm';
import SuccessScreen from './SuccessScreen';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import ForgotPasswordForm from './ForgotPasswordForm';
import ForgotPasswordSentScreen from './ForgotPasswordSentScreen';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);

  const navigateTo = useCallback((newView: AuthView) => {
    setView(newView);
  }, []);

  const handleBack = () => {
    if (view === AuthView.SIGN_UP_EMAIL) {
      navigateTo(AuthView.SIGN_UP);
    } else if (view === AuthView.SIGN_IN_EMAIL) {
      navigateTo(AuthView.SIGN_IN);
    } else if (view === AuthView.FORGOT_PASSWORD) {
      navigateTo(AuthView.SIGN_IN_EMAIL);
    } else {
      navigateTo(AuthView.SIGN_IN);
    }
  };

  const renderView = () => {
    switch (view) {
      case AuthView.SIGN_UP:
        return (
          <SignUpForm
            onNavigateToSignIn={() => navigateTo(AuthView.SIGN_IN)}
            onNavigateToEmailSignUp={() => navigateTo(AuthView.SIGN_UP_EMAIL)}
            onNavigateToSuccess={() => navigateTo(AuthView.SUCCESS)}
          />
        );
      case AuthView.SIGN_UP_EMAIL:
        return (
          <EmailSignUpForm
            onNavigateToSignIn={() => navigateTo(AuthView.SIGN_IN)}
            onNavigateToSuccess={() => navigateTo(AuthView.SUCCESS)}
          />
        );
      case AuthView.SUCCESS:
        return <SuccessScreen onNavigateToLogIn={onLoginSuccess} />;
      case AuthView.SIGN_IN_EMAIL:
        return (
          <EmailSignInForm
            onNavigateToSignUp={() => navigateTo(AuthView.SIGN_UP)}
            onSignInSuccess={onLoginSuccess}
            onNavigateToForgotPassword={() => navigateTo(AuthView.FORGOT_PASSWORD)}
          />
        );
      case AuthView.FORGOT_PASSWORD:
        return (
          <ForgotPasswordForm 
            onNavigateToSentScreen={() => navigateTo(AuthView.FORGOT_PASSWORD_SENT)} 
          />
        );
      case AuthView.FORGOT_PASSWORD_SENT:
        return (
          <ForgotPasswordSentScreen 
            onNavigateToSignIn={() => navigateTo(AuthView.SIGN_IN)} 
          />
        );
      case AuthView.SIGN_IN:
      default:
        return (
          <SignInForm
            onNavigateToSignUp={() => navigateTo(AuthView.SIGN_UP)}
            onNavigateToEmailSignIn={() => navigateTo(AuthView.SIGN_IN_EMAIL)}
            onSignInSuccess={onLoginSuccess}
          />
        );
    }
  };

  const showBackButton = ![
    AuthView.SIGN_IN,
    AuthView.SUCCESS,
    AuthView.FORGOT_PASSWORD_SENT,
  ].includes(view);

  return (
    <div className="bg-brand-bg min-h-screen flex flex-col p-6 max-w-md mx-auto">
      <header className="flex items-center h-16">
        {showBackButton && (
          <button onClick={handleBack} className="text-brand-primary p-2 -ml-2">
            <ArrowLeftIcon />
          </button>
        )}
        <div className="flex-grow flex items-center">
          <span className="h-8 w-px bg-green-800 mr-2"></span>
          <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col">
        {renderView()}
      </main>
    </div>
  );
};

export default AuthPage;