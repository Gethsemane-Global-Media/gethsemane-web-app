import React from 'react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { BIBLE_VERSIONS } from '../data/bibleVersions';

interface ReferencesPageProps {
  onBack: () => void;
  onSelectVersion: (version: string) => void;
}

const ReferencesPage: React.FC<ReferencesPageProps> = ({ onBack, onSelectVersion }) => {
  return (
    <div className="flex-grow flex flex-col h-full bg-brand-bg">
      <header className="relative flex items-center justify-center p-6 h-20 shrink-0">
        <button onClick={onBack} className="absolute left-4 text-brand-primary p-2" aria-label="Go back">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-medium text-brand-dark">References</h1>
      </header>

      <main className="flex-grow overflow-y-auto px-6 pb-6">
        <ul className="space-y-1">
          {BIBLE_VERSIONS.map(version => (
            <li key={version.short}>
              <button
                onClick={() => onSelectVersion(version.short)}
                className="w-full text-left py-4 rounded-lg hover:bg-gray-100/80 px-2 transition-colors"
                aria-label={`Select ${version.long}`}
              >
                <p className="text-lg text-brand-dark font-medium">{version.short}</p>
                <p className="text-sm text-brand-secondary">{version.long}</p>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default ReferencesPage;