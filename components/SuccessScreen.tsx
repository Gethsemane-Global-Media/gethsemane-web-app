import React from 'react';

interface SuccessScreenProps {
  onNavigateToLogIn: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNavigateToLogIn }) => {
  return (
    <div className="flex flex-col flex-grow">
      <div className="flex-grow flex flex-col justify-center items-center text-center px-4 -mt-16">
        <p className="text-brand-dark text-lg font-normal">Sign up</p>
        <h1 className="text-[2.75rem] leading-tight font-bold text-brand-dark mt-3">
          SUCCESSFUL
        </h1>
      </div>
      <div className="pb-6 pt-8">
        <button
          onClick={onNavigateToLogIn}
          className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
        >
          Proceed to Log in
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;