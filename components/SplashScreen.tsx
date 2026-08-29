import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center">
      <div className="flex items-center">
        <span className="h-10 w-px bg-brand-dark mr-4"></span>
        <span className="text-4xl font-medium tracking-[0.2em] text-brand-dark">
          GETHSEMANE
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;