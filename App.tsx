import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import SplashScreen from './components/SplashScreen';
import OnboardingPage from './components/OnboardingPage';
import { UserProfileProvider } from './hooks/useUserProfile';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="font-sans">
      {isAuthenticated ? <MainApp /> : <AuthPage onLoginSuccess={() => {}} />}
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('onboardingCompleted') === 'true';
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setOnboardingCompleted(true);
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!onboardingCompleted) {
    return <OnboardingPage onOnboardingComplete={handleOnboardingComplete} />;
  }

  return (
    <AuthProvider>
      <UserProfileProvider>
        <AppContent />
      </UserProfileProvider>
    </AuthProvider>
  );
};

export default App;