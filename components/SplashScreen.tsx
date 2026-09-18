import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="bg-brand-bg min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center">
        <img
          src="/images/logos/gkni-logo.png"
          alt="Gethsemane Kingdom Network Int'l"
          className="w-[230px] h-[230px] rounded-full object-contain"
        />
      </div>
    </div>
  );
};

export default SplashScreen;