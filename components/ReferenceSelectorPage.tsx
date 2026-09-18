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
    className={`py-3 text-base font-medium transition-colors cursor-pointer ${
      isActive ? 'text-brand-dark border-b-2 border-brand-dark' : 'text-brand-secondary'
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

  const totalChapters = useMemo(() => BIBLE_CHAPTERS[selectedBook] || 1, [selectedBook]);
  const chapterNumbers = useMemo(
    () => Array.from({ length: totalChapters }, (_, i) => i + 1),
    [totalChapters]
  );

  // Dynamic verse counts (common maximum per chapter up to 176 for Psalm 119, standard 60 default)
  const totalVersesForChapter = useMemo(() => {
    if (selectedBook === 'Psalms' && selectedChapter === 119) return 176;
    if (selectedBook === 'Psalms' && selectedChapter === 78) return 72;
    if (selectedBook === 'Numbers' && selectedChapter === 7) return 89;
    if (selectedBook === 'Luke' && selectedChapter === 1) return 80;
    if (selectedBook === 'Matthew' && selectedChapter === 26) return 75;
    return 60;
  }, [selectedBook, selectedChapter]);

  const verseNumbers = useMemo(
    () => Array.from({ length: totalVersesForChapter }, (_, i) => i + 1),
    [totalVersesForChapter]
  );

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

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerse(null);
    setActiveTab('verses');
  };

  const handleVerseSelect = (verse: number) => {
    setSelectedVerse(verse);
    // Instant navigate to verse upon clicking
    onSelect(selectedBook, selectedChapter, verse);
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-brand-bg relative">
      <header className="relative flex items-center justify-center h-16 shrink-0 px-4">
        <button
          onClick={onBack}
          className="absolute left-4 text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeftIcon size={28} />
        </button>
        <h1 className="text-xl font-medium text-brand-dark">References</h1>
      </header>

      {/* Tabs */}
      <div className="flex justify-center gap-10 px-6 border-b border-gray-200">
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
            aria-label="Search books"
            className="w-full border border-gray-300 rounded-xl py-3.5 pl-4 pr-10 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent/30 bg-white text-sm"
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
                  className={`w-full text-left py-3.5 px-3 rounded-xl text-lg transition-colors cursor-pointer ${
                    selectedBook === book
                      ? 'font-bold text-brand-dark bg-white shadow-2xs'
                      : 'text-brand-dark hover:bg-white/60'
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
          <div>
            <div className="mb-4 text-sm font-semibold text-brand-secondary">
              {selectedBook} — Select Chapter
            </div>
            <div className="grid grid-cols-4 gap-3">
              {chapterNumbers.map((chapter) => (
                <button
                  key={chapter}
                  onClick={() => handleChapterSelect(chapter)}
                  className={`py-3 rounded-2xl text-lg font-medium text-center transition-all cursor-pointer ${
                    selectedChapter === chapter
                      ? 'bg-brand-dark text-white shadow-xs font-bold'
                      : 'bg-white text-brand-dark border border-gray-200 hover:border-brand-accent'
                  }`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'verses' && (
          <div>
            <div className="mb-4 text-sm font-semibold text-brand-secondary">
              {selectedBook} {selectedChapter} — Select Verse
            </div>
            <div className="grid grid-cols-4 gap-3">
              {verseNumbers.map((verse) => (
                <button
                  key={verse}
                  onClick={() => handleVerseSelect(verse)}
                  className={`py-3 rounded-2xl text-lg font-medium text-center transition-all cursor-pointer ${
                    selectedVerse === verse
                      ? 'bg-brand-dark text-white shadow-xs font-bold'
                      : 'bg-white text-brand-dark border border-gray-200 hover:border-brand-accent'
                  }`}
                >
                  {verse}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating confirm button if user only chose chapter */}
      {activeTab === 'chapters' && (
        <div className="fixed bottom-24 right-6 z-10">
          <button
            onClick={handleConfirm}
            className="w-14 h-14 bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-colors cursor-pointer"
            aria-label="Confirm selection"
            title="Go to chapter"
          >
            <CheckmarkFabIcon />
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferenceSelectorPage;
