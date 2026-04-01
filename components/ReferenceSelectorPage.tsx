import React, { useState, useMemo } from 'react';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, BIBLE_CHAPTERS } from '../data/bibleBooks';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CheckmarkFabIcon } from './icons/CheckmarkFabIcon';

interface ReferenceSelectorPageProps {
  onBack: () => void;
  onSelect: (book: string, chapter: number, verse: number | null) => void;
  initialBook: string;
  initialChapter: number;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`py-3 px-6 text-center font-medium transition-colors duration-200 ${
      isActive ? 'text-brand-dark' : 'text-brand-secondary'
    }`}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const ReferenceSelectorPage: React.FC<ReferenceSelectorPageProps> = ({ onBack, onSelect, initialBook, initialChapter }) => {
  const [activeTab, setActiveTab] = useState<'books' | 'chapters' | 'verses'>('chapters');
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const totalChapters = useMemo(() => BIBLE_CHAPTERS[selectedBook] || 0, [selectedBook]);
  const chapterNumbers = useMemo(() => Array.from({ length: totalChapters }, (_, i) => i + 1), [totalChapters]);
  
  // Mocking verse count as it's not in the data model. 
  // In a real app, this would come from a more detailed data source.
  const verseNumbers = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);

  const handleConfirm = () => {
    onSelect(selectedBook, selectedChapter, selectedVerse);
  };
  
  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1); // Reset chapter to 1 when a new book is selected
    setSelectedVerse(null); // Reset verse
    setActiveTab('chapters');
  }

  return (
    <div className="flex-grow flex flex-col h-full bg-brand-bg relative">
      <header className="flex items-center p-6 h-20 shrink-0">
        <button onClick={onBack} className="text-brand-primary p-2 -ml-2" aria-label="Go back">
          <ArrowLeftIcon />
        </button>
        <h1 className="text-xl font-medium text-brand-dark ml-4">References</h1>
      </header>
      
      <div className="flex justify-center border-b border-gray-200 relative">
        <TabButton label="Books" isActive={activeTab === 'books'} onClick={() => setActiveTab('books')} />
        <TabButton label="Chapters" isActive={activeTab === 'chapters'} onClick={() => setActiveTab('chapters')} />
        <TabButton label="Verses" isActive={activeTab === 'verses'} onClick={() => setActiveTab('verses')} />
        <div 
          className="absolute bottom-0 h-0.5 bg-brand-dark transition-all duration-300"
          style={{
            width: '80px', // Approximate width of a tab
            left: '50%',
            transform: activeTab === 'books' ? 'translateX(-120px)' : activeTab === 'verses' ? 'translateX(40px)' : 'translateX(-40px)'
          }}
        />
      </div>

      <main className="flex-grow overflow-y-auto p-6 pb-28">
        {activeTab === 'books' && (
          <div className="space-y-6">
            <section>
                <h2 className="text-lg font-semibold text-brand-secondary mb-3">Old Testament</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                    {OLD_TESTAMENT_BOOKS.map(book => (
                        <button key={book} onClick={() => handleBookSelect(book)} className={`py-2 text-left rounded-md ${selectedBook === book ? 'font-bold text-brand-accent' : 'text-brand-primary'}`}>{book}</button>
                    ))}
                </div>
            </section>
             <section>
                <h2 className="text-lg font-semibold text-brand-secondary mb-3">New Testament</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                    {NEW_TESTAMENT_BOOKS.map(book => (
                        <button key={book} onClick={() => handleBookSelect(book)} className={`py-2 text-left rounded-md ${selectedBook === book ? 'font-bold text-brand-accent' : 'text-brand-primary'}`}>{book}</button>
                    ))}
                </div>
            </section>
          </div>
        )}
        {activeTab === 'chapters' && (
            <div className="grid grid-cols-4 gap-4">
                {chapterNumbers.map(chapter => (
                    <button 
                        key={chapter} 
                        onClick={() => setSelectedChapter(chapter)}
                        className={`aspect-square flex items-center justify-center rounded-2xl transition-colors text-lg ${selectedChapter === chapter ? 'bg-brand-dark text-white' : 'bg-white'}`}
                    >
                        {chapter}
                    </button>
                ))}
            </div>
        )}
        {activeTab === 'verses' && (
             <div className="grid grid-cols-4 gap-4">
                {verseNumbers.map(verse => (
                    <button 
                        key={verse}
                        onClick={() => setSelectedVerse(verse)}
                        className={`aspect-square flex items-center justify-center rounded-2xl transition-colors text-lg ${selectedVerse === verse ? 'bg-brand-dark text-white' : 'bg-white'}`}
                    >
                        {verse}
                    </button>
                ))}
            </div>
        )}
      </main>

      <div className="fixed bottom-24 right-6 z-10">
          <button 
            onClick={handleConfirm} 
            className="w-16 h-16 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-colors"
            aria-label="Confirm selection"
            >
            <CheckmarkFabIcon />
          </button>
      </div>

    </div>
  );
};

export default ReferenceSelectorPage;