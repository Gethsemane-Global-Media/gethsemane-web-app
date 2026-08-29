import React from 'react';
import { useBookmarks } from '../hooks/useBookmarks';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { Bookmark } from '../types';

interface BookmarksPageProps {
  onNavigateBack: () => void;
  onNavigateToVerse: (book: string, chapter: number, verse: number) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ onNavigateBack, onNavigateToVerse }) => {
  const [bookmarks, _, removeBookmark] = useBookmarks();

  const handleBookmarkClick = (bookmark: Bookmark) => {
    onNavigateToVerse(bookmark.book, bookmark.chapter, bookmark.verse);
  };

  return (
    <div className="flex-grow flex flex-col h-screen">
        <header className="flex items-center px-6 pt-4 pb-2 shrink-0">
            <button onClick={onNavigateBack} className="text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer" aria-label="Go back">
                <ArrowLeftIcon />
            </button>
        </header>
        <main className="flex-grow px-6 pb-24 overflow-y-auto">
            <h1 className="text-4xl font-medium text-brand-primary">Bookmarks</h1>
            
            {bookmarks.length > 0 ? (
                <div className="mt-8 space-y-4">
                    {bookmarks.map((bookmark, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <button onClick={() => handleBookmarkClick(bookmark)} className="w-full text-left">
                                <p className="font-semibold text-brand-dark">{bookmark.book} {bookmark.chapter}:{bookmark.verse}</p>
                                <p className="mt-2 text-brand-secondary text-base leading-relaxed">
                                    "{bookmark.text}"
                                </p>
                            </button>
                             <div className="text-right mt-2">
                                <button onClick={() => removeBookmark(bookmark)} className="text-sm text-red-500 hover:underline font-medium">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-20 text-center text-brand-secondary">
                    <p>You haven't bookmarked any verses yet.</p>
                    <p className="mt-2 text-sm">Tap a verse in the Bible reader to save it here.</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default BookmarksPage;
