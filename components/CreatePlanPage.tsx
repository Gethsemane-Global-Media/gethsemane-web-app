import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../data/bibleBooks';

interface CreatePlanPageProps {
  onNavigateBack: () => void;
  onAddPlan: (planData: { title: string; description: string; chaptersPerDay: number; books: string[] }) => void;
  setIsDirty: (isDirty: boolean) => void;
}

const inputClasses =
  'w-full px-5 py-4 mt-2 bg-[#E9E7EF] rounded-full border-0 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-accent/40';

const checkboxClasses =
  'w-5 h-5 shrink-0 rounded border-2 border-brand-primary text-brand-green focus:ring-brand-green focus:ring-offset-0';

const BookList: React.FC<{
  books: string[];
  selectedBooks: string[];
  onToggle: (book: string) => void;
}> = ({ books, selectedBooks, onToggle }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-5 mt-5">
    {books.map((book) => (
      <div key={book} className="flex items-center">
        <input
          type="checkbox"
          id={`book-${book.replace(/\s/g, '-')}`}
          checked={selectedBooks.includes(book)}
          onChange={() => onToggle(book)}
          className={checkboxClasses}
        />
        <label
          htmlFor={`book-${book.replace(/\s/g, '-')}`}
          className="ml-3 text-brand-dark text-[15px]"
        >
          {book}
        </label>
      </div>
    ))}
  </div>
);

const TestamentSelection: React.FC<{
  title: string;
  books: string[];
  selectedBooks: string[];
  onToggleBook: (book: string) => void;
  onSelectAll: () => void;
}> = ({ title, books, selectedBooks, onToggleBook, onSelectAll }) => (
  <section className="mt-10">
    <h2 className="text-2xl font-bold text-brand-dark">{title}</h2>
    <div className="flex items-center gap-3 mt-5">
      <input
        type="checkbox"
        id={`select-all-${title.toLowerCase().replace(' ', '-')}`}
        checked={books.every((book) => selectedBooks.includes(book))}
        onChange={onSelectAll}
        className={checkboxClasses}
      />
      <label
        htmlFor={`select-all-${title.toLowerCase().replace(' ', '-')}`}
        className="text-brand-dark text-[15px] shrink-0"
      >
        Select All
      </label>
      <div className="flex-grow h-px bg-gray-300" />
    </div>
    <BookList books={books} selectedBooks={selectedBooks} onToggle={onToggleBook} />
  </section>
);

const CreatePlanPage: React.FC<CreatePlanPageProps> = ({ onNavigateBack, onAddPlan, setIsDirty }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [chaptersPerDay, setChaptersPerDay] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const isFormValid =
    Boolean(title) && Boolean(chaptersPerDay) && parseInt(chaptersPerDay, 10) > 0 && selectedBooks.length > 0;
  const isDirty =
    title !== '' || description !== '' || chaptersPerDay !== '' || selectedBooks.length > 0;

  useEffect(() => {
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  const handleCreateClick = () => {
    if (!isFormValid) return;

    onAddPlan({
      title,
      description,
      chaptersPerDay: parseInt(chaptersPerDay, 10),
      books: selectedBooks,
    });
  };

  const handleToggleBook = (book: string) => {
    setSelectedBooks((prev) =>
      prev.includes(book) ? prev.filter((b) => b !== book) : [...prev, book]
    );
  };

  const handleSelectAll = (testamentBooks: string[]) => {
    const allSelected = testamentBooks.every((book) => selectedBooks.includes(book));
    if (allSelected) {
      setSelectedBooks((prev) => prev.filter((b) => !testamentBooks.includes(b)));
    } else {
      setSelectedBooks((prev) => [...new Set([...prev, ...testamentBooks])]);
    }
  };

  return (
    <div className="bg-brand-bg min-h-screen max-w-md mx-auto flex flex-col">
      <header className="shrink-0 px-6 pt-4 pb-2">
        <button
          onClick={onNavigateBack}
          className="text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ChevronLeftIcon size={28} />
        </button>
      </header>

      <main className="flex-grow overflow-y-auto pb-10 px-6">
        <h1 className="text-4xl font-medium text-brand-dark leading-tight">Create plans</h1>
        <p className="text-brand-secondary mt-4 text-[15px] leading-relaxed">
          Welcome, here you can create your own special plan and follow through as guided by the HOLY spirit.
        </p>

        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="plan-title" className="text-sm text-brand-dark">
              Plan title
            </label>
            <input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="plan-description" className="text-sm text-brand-dark">
              Description
            </label>
            <input
              id="plan-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="chapters-per-day" className="text-sm text-brand-dark">
              Chapters per day
            </label>
            <input
              id="chapters-per-day"
              type="number"
              value={chaptersPerDay}
              onChange={(e) => setChaptersPerDay(e.target.value)}
              className={inputClasses}
            />
          </div>
        </form>

        <TestamentSelection
          title="Old Testament"
          books={OLD_TESTAMENT_BOOKS}
          selectedBooks={selectedBooks}
          onToggleBook={handleToggleBook}
          onSelectAll={() => handleSelectAll(OLD_TESTAMENT_BOOKS)}
        />

        <TestamentSelection
          title="New Testament"
          books={NEW_TESTAMENT_BOOKS}
          selectedBooks={selectedBooks}
          onToggleBook={handleToggleBook}
          onSelectAll={() => handleSelectAll(NEW_TESTAMENT_BOOKS)}
        />

        <section className="mt-12 pb-6">
          <button
            onClick={handleCreateClick}
            disabled={!isFormValid}
            className="w-full py-5 bg-[#212631] text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create Plan
          </button>
        </section>
      </main>
    </div>
  );
};

export default CreatePlanPage;
