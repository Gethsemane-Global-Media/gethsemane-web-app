import React from 'react';
import { CheckmarkIcon } from './icons/CheckmarkIcon';

interface ReadingCompletedPageProps {
  planProgress: number;
  onNavigateBack: () => void;
}

const ReadingCompletedPage: React.FC<ReadingCompletedPageProps> = ({ planProgress, onNavigateBack }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[#F4F6F4] p-8 rounded-3xl shadow-sm max-w-xs w-full">
        <div className="flex justify-center mb-6">
          <CheckmarkIcon />
        </div>
        <h1 className="text-3xl font-medium text-brand-dark mb-4 leading-tight">
          Daily reading completed
        </h1>
        <div className="w-full bg-gray-200 rounded-full h-1.5 my-8">
          <div className="bg-brand-green h-1.5 rounded-full" style={{ width: `${planProgress}%` }}></div>
        </div>
        <button
          onClick={onNavigateBack}
          className="w-full py-4 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ReadingCompletedPage;