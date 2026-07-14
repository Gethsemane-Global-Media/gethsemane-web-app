import React from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { BIBLE_VERSIONS } from '../data/bibleVersions';

interface ReferencesPageProps {
  onBack: () => void;
  onSelectVersion: (version: string) => void;
}

const ReferencesPage: React.FC<ReferencesPageProps> = ({ onBack, onSelectVersion }) => {
  return (
    <div className="flex-grow flex flex-col h-full bg-brand-bg">
      <header className="relative flex items-center justify-center h-16 shrink-0 px-4">
        <button onClick={onBack} className="absolute left-4 text-brand-primary p-1" aria-label="Go back">
          <ChevronLeftIcon size={28} />
        </button>
        <h1 className="text-xl font-medium text-brand-dark">References</h1>
      </header>

      <main className="flex-grow overflow-y-auto px-6 pb-8 pt-4">
        <ul>
          {BIBLE_VERSIONS.map((version) => (
            <li key={version.short}>
              <button
                onClick={() => onSelectVersion(version.short)}
                className="w-full text-left py-5 transition-colors"
                aria-label={`Select ${version.long}`}
              >
                <p className="text-lg font-bold text-brand-dark">{version.short}</p>
                <p className="text-base font-light text-brand-secondary mt-0.5">{version.long}</p>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default ReferencesPage;
