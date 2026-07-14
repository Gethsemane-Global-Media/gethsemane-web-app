import React, { useState, useMemo } from 'react';
import { BIBLE_BOOKS_LIST, BIBLE_CHAPTERS } from '../data/bibleBooks';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { CheckmarkFabIcon } from './icons/CheckmarkFabIcon';

interface ReferenceSelectorPageProps {
  onBack: () => void;
  onSelect: (book: string, chapter: number, verse: number | null) => void;
  initialBook: string;
  initialChapter: number;
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({
  label,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`py-3 text-base font-medium transition-colors ${
      isActive ? 'text-brand-dark' : 'text-brand-secondary'
    }`}
    aria-pressed={isActive}
  >
    {label}
  </button>
);

const ReferenceSelectorPage: React.FC<ReferenceSelectorPageProps> = ({
  onBack,
  onSelect,
  initialBook,
  initialChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'chapters' | 'verses'>('books');
  const [selectedBook, setSelectedBook] = useState(initialBook);
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const totalChapters = useMemo(() => BIBLE_CHAPTERS[selectedBook] || 0, [selectedBook]);
  const chapterNumbers = useMemo(
    () => Array.from({ length: totalChapters }, (_, i) => i + 1),
    [totalChapters]
  );
  const verseNumbers = useMemo(() => Array.from({ length: 50 }, (_, i) => i + 1), []);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return BIBLE_BOOKS_LIST;
    const query = searchQuery.toLowerCase();
    return BIBLE_BOOKS_LIST.filter((book) => book.toLowerCase().includes(query));
  }, [searchQuery]);

  const handleConfirm = () => {
    onSelect(selectedBook, selectedChapter, selectedVerse);
  };

  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setSelectedVerse(null);
    setActiveTab('chapters');
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-brand-bg relative">
      <header className="relative flex items-center justify-center h-16 shrink-0 px-4">
        <button
          onClick={onBack}
          className="absolute left-4 text-brand-primary p-1"
          aria-label="Go back"
        >
          <ChevronLeftIcon size={28} />
        </button>
        <h1 className="text-xl font-medium text-brand-dark">References</h1>
      </header>

      <div className="flex justify-center gap-10 px-6">
        <TabButton label="Books" isActive={activeTab === 'books'} onClick={() => setActiveTab('books')} />
        <TabButton
          label="Chapters"
          isActive={activeTab === 'chapters'}
          onClick={() => setActiveTab('chapters')}
        />
        <TabButton label="Verses" isActive={activeTab === 'verses'} onClick={() => setActiveTab('verses')} />
      </div>

      {activeTab === 'books' && (
        <div className="relative mx-6 mt-5 mb-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full border border-gray-300 rounded-xl py-3.5 pl-4 pr-10 text-brand-dark placeholder:text-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-white"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary pointer-events-none">
            <ChevronDownIcon size={20} />
          </div>
        </div>
      )}

      <main className="flex-grow overflow-y-auto px-6 pb-32 pt-4">
        {activeTab === 'books' && (
          <ul className="space-y-1">
            {filteredBooks.map((book) => (
              <li key={book}>
                <button
                  onClick={() => handleBookSelect(book)}
                  className={`w-full text-left py-4 text-lg ${
                    selectedBook === book ? 'font-semibold text-brand-dark' : 'text-brand-dark'
                  }`}
                >
                  {book}
                </button>
              </li>
            ))}
            {filteredBooks.length === 0 && (
              <p className="text-center text-brand-secondary py-8">No books found.</p>
            )}
          </ul>
        )}

        {activeTab === 'chapters' && (
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {chapterNumbers.map((chapter) => (
              <button
                key={chapter}
                onClick={() => {
                  setSelectedChapter(chapter);
                  setSelectedVerse(null);
                }}
                className={`py-2 text-lg text-center ${
                  selectedChapter === chapter ? 'font-semibold text-brand-dark' : 'text-brand-dark'
                }`}
              >
                {chapter}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'verses' && (
          <div className="grid grid-cols-4 gap-y-6 gap-x-2">
            {verseNumbers.map((verse) => (
              <button
                key={verse}
                onClick={() => setSelectedVerse(verse)}
                className={`py-2 text-lg text-center ${
                  selectedVerse === verse ? 'font-semibold text-brand-dark' : 'text-brand-dark'
                }`}
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
          className="w-14 h-14 bg-[#212631] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-colors"
          aria-label="Confirm selection"
        >
          <CheckmarkFabIcon />
        </button>
      </div>
    </div>
  );
};

export default ReferenceSelectorPage;
