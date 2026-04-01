import React from 'react';

interface SuccessScreenProps {
  onNavigateToLogIn: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onNavigateToLogIn }) => {
  return (
    <div className="flex flex-col justify-between flex-grow">
      <div className="text-center flex-grow flex flex-col justify-center items-center">
        <p className="text-brand-primary text-xl">Sign up</p>
        <h1 className="text-5xl font-bold text-brand-primary mt-2 tracking-widest">
          SUCCESSFUL
        </h1>
      </div>
      <div className="pb-4">
        <button onClick={onNavigateToLogIn} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
          Proceed to Log in
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;