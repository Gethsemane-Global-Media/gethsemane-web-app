import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import MainApp from './components/MainApp';
import SplashScreen from './components/SplashScreen';
import OnboardingPage from './components/OnboardingPage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    // Check localStorage to see if onboarding has been completed before
    return localStorage.getItem('onboardingCompleted') === 'true';
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };
  
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
    <div className="font-sans">
      {isLoggedIn ? <MainApp /> : <AuthPage onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default App;