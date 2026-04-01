import React, { useState, useMemo } from 'react';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS, BIBLE_CHAPTERS } from '../data/bibleBooks';
import { CloseIcon } from './icons/CloseIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface BibleNavigationModalProps {
  // Search state will help filter book list

  isOpen: boolean;
  onClose: () => void;
  onSelect: (book: string, chapter: number) => void;
  currentBook: string;
  currentChapter: number;
}

const BibleNavigationModal: React.FC<BibleNavigationModalProps> = ({ isOpen, onClose, onSelect, currentBook }) => {
    const [view, setView] = useState<'books' | 'chapters'>('books');
    const [testament, setTestament] = useState<'ot' | 'nt'>(
        NEW_TESTAMENT_BOOKS.includes(currentBook) ? 'nt' : 'ot'
    );
    const [selectedBook, setSelectedBook] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const bookToShowChaptersFor = selectedBook || currentBook;

    const filteredBooks = useMemo(() => {
        const list = testament === 'ot' ? OLD_TESTAMENT_BOOKS : NEW_TESTAMENT_BOOKS;
        if (!searchTerm) return list;
        return list.filter(b => b.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, testament]);

    const chapters = useMemo(() => {
        const chapterCount = BIBLE_CHAPTERS[bookToShowChaptersFor] || 0;
        return Array.from({ length: chapterCount }, (_, i) => i + 1);
    }, [bookToShowChaptersFor]);

    const handleBookClick = (book: string) => {
        setSelectedBook(book);
        setView('chapters');
    };

    const handleBackToBooks = () => {
        setView('books');
        setSelectedBook(null);
    };
    
    // Add styles for modal animation
    const styles = `
        @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
    `;

    if (!isOpen) return null;

    return (
        <>
            <style>{styles}</style>
            <div 
                className="fixed inset-0 bg-black bg-opacity-30 z-40"
                onClick={onClose}
                aria-hidden="true"
            ></div>
            <div
                className="fixed inset-0 bg-brand-bg z-50 flex flex-col animate-slide-up"
                role="dialog"
                aria-modal="true"
            >
                <header className="flex items-center justify-between p-6 h-20 shrink-0 border-b border-gray-200">
                    {view === 'chapters' ? (
                         <button onClick={handleBackToBooks} className="p-2 -ml-2 text-brand-primary">
                            <ArrowLeftIcon />
                        </button>
                    ) : <div className="w-10"></div>}
                    <h2 className="text-xl font-semibold text-brand-dark">
                        {view === 'books' ? 'Select Book' : bookToShowChaptersFor}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-brand-primary">
                        <CloseIcon />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto">
                    {view === 'books' && (
                        <div>
                            <div className="flex justify-around border-b border-gray-200">
                                <button
                                    onClick={() => setTestament('ot')}
                                    className={`w-full py-4 font-medium text-center ${testament === 'ot' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-secondary'}`}
                                >
                                    Old Testament
                                </button>
                                <button
                                    onClick={() => setTestament('nt')}
                                    className={`w-full py-4 font-medium text-center ${testament === 'nt' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-secondary'}`}
                                >
                                    New Testament
                                </button>
                            </div>
                            {/* Search Input */}
                            <div className="p-4">
                                <input
                                    type="search"
                                    placeholder="Search book…"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full border rounded-full py-2 px-4 text-brand-primary focus:ring-2 focus:ring-brand-accent focus:outline-none"
                                />
                            </div>
                            <div className="px-6 pb-6 grid grid-cols-2 gap-x-6 gap-y-4">
                                {filteredBooks.map(book => (
                                    <button 
                                        key={book}
                                        onClick={() => handleBookClick(book)}
                                        className={`py-2 rounded-lg text-left text-brand-primary hover:bg-gray-100 ${book === currentBook ? 'font-bold' : ''}`}
                                    >
                                        {book}
                                    </button>
                                ))}
                                {filteredBooks.length === 0 && <p className="col-span-2 text-center text-brand-secondary">No books match.</p>}
                            </div>
                        </div>
                    )}

                    {view === 'chapters' && (
                        <div className="p-6 grid grid-cols-5 gap-3 justify-items-center">
                            {chapters.map(chapter => (
                                <button
                                    key={chapter}
                                    onClick={() => onSelect(bookToShowChaptersFor, chapter)}
                                    className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-100 text-brand-primary hover:bg-brand-nav-active-bg transition-colors"
                                >
                                    {chapter}
                                </button>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default BibleNavigationModal;
