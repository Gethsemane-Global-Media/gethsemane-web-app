import React from 'react';
import { CheckmarkIcon } from './icons/CheckmarkIcon';

interface ReadingCompletedPageProps {
  planProgress: number;
  onNavigateBack: () => void;
}

const ReadingCompletedPage: React.FC<ReadingCompletedPageProps> = ({ planProgress, onNavigateBack }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
      <div className="bg-[#F4F6F4] p-8 rounded-3xl max-w-xs w-full">
        <div className="flex justify-center mb-6">
          <CheckmarkIcon backgroundColor="#49684F" />
        </div>
        <h1 className="text-3xl font-medium text-brand-dark leading-tight">
          Daily reading<br />completed
        </h1>
        <div className="w-16 mx-auto bg-gray-200 rounded-full h-1 my-8">
          <div
            className="bg-brand-green h-1 rounded-full transition-all"
            style={{ width: `${Math.max(planProgress, 8)}%` }}
          />
        </div>
        <button
          onClick={onNavigateBack}
          className="w-full py-4 bg-[#212631] text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ReadingCompletedPage;
