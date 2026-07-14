import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  Component,
  ErrorInfo,
  ReactNode,
} from 'react';
import { SearchIcon } from './icons/SearchIcon';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { useBookmarks } from '../hooks/useBookmarks';
import { Bookmark } from '../types';
import VerseActionMenu from './VerseActionMenu';
import { Note } from '../types';

interface ReaderPageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ReaderPageErrorBoundary extends Component<{
  children: ReactNode;
  fallback?: ReactNode;
}, ReaderPageErrorBoundaryState> {
  
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ReaderPageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ReaderPage Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex-grow flex flex-col h-screen bg-brand-bg items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-primary mb-4">Something went wrong</h2>
            <p className="text-brand-secondary mb-6">An error occurred while loading the Bible reader.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-brand-dark text-white rounded-lg hover:bg-brand-primary transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface SearchResult {
  version: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
}

interface ReaderPageProps {
  currentBook: string;
  currentChapter: number;
  currentVersion: string;
  totalChapters: number;
  isLoadingChapter: boolean;
  parsedVerses: { number: string; text: string }[];
  isLoadingSearch: boolean;
  searchResults: SearchResult[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  performSearch: () => void;
  handleCancelSearch: () => void;
  handleResultClick: (result: SearchResult) => void;
  handlePrevChapter: () => void;
  handleNextChapter: () => void;
  highlightText: (text: string, highlight: string) => string;
  isSearching: boolean;
  onSearchingChange: (isSearching: boolean) => void;
  onOpenVersionSelector: () => void;
  onOpenReferenceSelector: () => void;
  scrollToVerse: number | null;
  onScrolledToVerse: () => void;
  isPlanReadingMode?: boolean;
  planChapterProgress?: number;
  canGoPrevChapter?: boolean;
  canGoNextChapter?: boolean;
}


export default function ReaderPage({
  currentBook,
  currentChapter,
  currentVersion,
  totalChapters,
  isLoadingChapter,
  parsedVerses = [], // Add default empty array
  isLoadingSearch,
  searchResults,
  searchQuery,
  setSearchQuery,
  performSearch,
  handleCancelSearch,
  handleResultClick,
  handlePrevChapter,
  handleNextChapter,
  highlightText,
  isSearching,
  onSearchingChange,
  onOpenVersionSelector,
  onOpenReferenceSelector,
  scrollToVerse,
  onScrolledToVerse,
  isPlanReadingMode = false,
  planChapterProgress = 0,
  canGoPrevChapter = true,
  canGoNextChapter = true,
}: ReaderPageProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<{ verse: Bookmark, element: HTMLElement } | null>(null);
  const [bookmarks, addBookmark, removeBookmark, isBookmarked] = useBookmarks();
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const item = window.localStorage.getItem('behold-notes');
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (type: 'bold' | 'italic') => {
    if (!noteTextareaRef.current) return;
    const textarea = noteTextareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = noteDraft.slice(start, end);
    const wrapper = type === 'bold' ? '**' : '*';
    const newText = noteDraft.slice(0, start) + wrapper + selectedText + wrapper + noteDraft.slice(end);
    setNoteDraft(newText);
    // Restore selection inside wrappers
    setTimeout(() => {
      textarea.selectionStart = start + wrapper.length;
      textarea.selectionEnd = end + wrapper.length;
      textarea.focus();
    }, 0);
  };
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const mainRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const readerContentRef = useRef<HTMLDivElement>(null);

  const FONT_SIZE_KEY = 'behold-font-size';
  const FONT_SIZES = ['text-base', 'text-lg', 'text-xl', 'text-2xl'];
  const [fontSizeIndex, setFontSizeIndex] = useState(() => {
      try {
          const saved = localStorage.getItem(FONT_SIZE_KEY);
          return saved ? parseInt(saved, 10) : 1;
      } catch {
          return 1;
      }
  });

  useEffect(() => {
      localStorage.setItem(FONT_SIZE_KEY, fontSizeIndex.toString());
  }, [fontSizeIndex]);

  const increaseFontSize = () => setFontSizeIndex(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  const decreaseFontSize = () => setFontSizeIndex(prev => Math.max(prev - 1, 0));
  const fontSizeClass = FONT_SIZES[fontSizeIndex];
  
  const handleVerseClick = (verse: { number: string; text: string }, event: React.MouseEvent<HTMLDivElement>) => {
    try {
      if (!verse || !verse.number || !verse.text) {
        console.warn('Invalid verse data:', verse);
        return;
      }
      
      const verseData: Bookmark = {
          book: currentBook,
          chapter: currentChapter,
          verse: parseInt(verse.number, 10),
          text: verse.text
      };
      setSelectedVerse({ verse: verseData, element: event.currentTarget });
    } catch (error) {
      console.error('Error in handleVerseClick:', error);
    }
  };
  
  const handleToggleBookmark = () => {
    if (selectedVerse) {
        isBookmarked(selectedVerse.verse) ? removeBookmark(selectedVerse.verse) : addBookmark(selectedVerse.verse);
    }
  };

  const getNoteForVerse = (book: string, chapter: number, verse: number) =>
    notes.find(n => n.book === book && n.chapter === chapter && n.verse === verse);

  const handleOpenNote = () => {
    if (selectedVerse) {
      const note = getNoteForVerse(selectedVerse.verse.book, selectedVerse.verse.chapter, selectedVerse.verse.verse);
      setNoteDraft(note ? note.text : '');
      setEditingNoteId(note ? note.id : null);
      setIsNoteModalOpen(true);
    }
  };
  const handleSaveNote = () => {
    if (!selectedVerse) return;
    const { book, chapter, verse } = selectedVerse.verse;
    let updatedNotes;
    if (editingNoteId) {
      updatedNotes = notes.map(n => n.id === editingNoteId ? { ...n, text: noteDraft, updatedAt: new Date().toISOString() } : n);
    } else {
      const newNote: Note = {
        id: `${book}-${chapter}-${verse}-${Date.now()}`,
        book, chapter, verse, text: noteDraft,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updatedNotes = [...notes, newNote];
    }
    setNotes(updatedNotes);
    window.localStorage.setItem('behold-notes', JSON.stringify(updatedNotes));
    setIsNoteModalOpen(false);
    setEditingNoteId(null);
    setNoteDraft('');
    setSelectedVerse(null);
  };
  const handleDeleteNote = () => {
    if (!editingNoteId) return;
    const updatedNotes = notes.filter(n => n.id !== editingNoteId);
    setNotes(updatedNotes);
    window.localStorage.setItem('behold-notes', JSON.stringify(updatedNotes));
    setIsNoteModalOpen(false);
    setEditingNoteId(null);
    setNoteDraft('');
    setSelectedVerse(null);
  };


  useEffect(() => {
    if (scrollToVerse === null) return;
    const verseElement = document.getElementById(`verse-${scrollToVerse}`);
    if (verseElement) {
      verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      verseElement.classList.add('bg-yellow-200', 'transition-colors', 'duration-1000', 'rounded');
      const timer = setTimeout(() => verseElement.classList.remove('bg-yellow-200'), 2500);
      onScrolledToVerse();
      return () => clearTimeout(timer);
    }
  }, [scrollToVerse, parsedVerses, onScrolledToVerse]);

  // Swipe gesture navigation
  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    let touchStartX = 0;
    const threshold = 50; // px

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) < threshold) return;
      if (diff < 0) {
        // swipe left -> next chapter
        handleNextChapter();
      } else {
        // swipe right -> previous chapter
        handlePrevChapter();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleNextChapter, handlePrevChapter]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedVerse(null); // Close popover on chapter change
  }, [currentBook, currentChapter]);

  useEffect(() => {
    if (isSearching) searchInputRef.current?.focus();
  }, [isSearching]);

  useEffect(() => {
    return () => { if (speechSynthesis.speaking) speechSynthesis.cancel(); };
  }, [currentBook, currentChapter]);

  useEffect(() => {
    const closeDropdowns = (e: MouseEvent) => {
      if (isSettingsOpen && settingsDropdownRef.current && !settingsDropdownRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('mousedown', closeDropdowns);
    return () => window.removeEventListener('mousedown', closeDropdowns);
  }, [isSettingsOpen]);

  const highlightedResults = useMemo(() => searchResults.map(r => ({ ...r, html: highlightText(r.text, searchQuery) })), [searchResults, searchQuery, highlightText]);
  const onSearchSubmit = useCallback((e: React.FormEvent) => { e.preventDefault(); performSearch(); }, [performSearch]);

  const handleToggleAudio = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      if (speechSynthesis.speaking) speechSynthesis.cancel();
      
      // Add safety check for parsedVerses
      if (!parsedVerses || !Array.isArray(parsedVerses) || parsedVerses.length === 0) {
        console.warn('No verses available for audio playback');
        return;
      }
      
      const textToSpeak = parsedVerses.map(v => v.text).join(' ');
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => { console.error('Speech error', e); setIsPlaying(false); };
      speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  }, [isPlaying, parsedVerses]);

  return (
    <div className="flex-grow flex flex-col h-screen bg-brand-bg">
      {isSearching ? (
        <header className="flex items-center p-6 h-20 shrink-0">
          <form role="search" onSubmit={onSearchSubmit} className="relative w-full">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary pointer-events-none"><SearchIcon /></div>
            <input ref={searchInputRef} type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search in ${currentVersion}…`} className="w-full pl-12 pr-12 py-3.5 bg-white rounded-full border border-gray-300 focus:ring-2 focus:ring-brand-accent focus:outline-none text-lg" autoFocus />
            <button type="button" onClick={handleCancelSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary p-1" aria-label="Close search"><CloseIcon /></button>
          </form>
        </header>
      ) : isPlanReadingMode ? (
        <header className="shrink-0 px-6 pt-2 pb-4">
          <div className="flex items-center gap-2 h-14">
            <div className="h-10 w-px bg-brand-green" />
            <span className="text-3xl font-medium tracking-wider text-brand-green">BEHOLD</span>
          </div>
          <div className="flex justify-between items-center text-brand-primary mt-1">
            <span className="text-lg font-medium">{currentBook}</span>
            <span className="text-lg font-medium">{currentChapter}</span>
            <button
              onClick={onOpenVersionSelector}
              className="text-lg font-medium"
              aria-label={`Select Bible version, current is ${currentVersion}`}
            >
              {currentVersion}
            </button>
          </div>
          <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all duration-300"
              style={{ width: `${planChapterProgress}%` }}
            />
          </div>
        </header>
      ) : (
        <header className="flex items-center justify-between p-6 h-20 shrink-0">
          <div className="flex items-center">
            <span className="h-8 w-px bg-green-700 mr-2" />
            <span className="text-2xl font-medium tracking-wider text-brand-primary">BEHOLD</span>
          </div>
          <button onClick={() => onSearchingChange(true)} className="p-2 text-brand-primary" aria-label="Search Bible"><SearchIcon /></button>
        </header>
      )}

      <main ref={mainRef} className="flex-grow p-6 overflow-y-auto pb-40" onClick={() => selectedVerse && setSelectedVerse(null)}>
        {isSearching ? (
          <>
            {isLoadingSearch && <div className="text-center py-10 text-brand-secondary">Searching…</div>}
            {!isLoadingSearch && (
              <div className="space-y-4">
                {searchResults.length > 0 && <p aria-live="polite" className="text-brand-secondary text-sm mb-4">Found {searchResults.length} result{searchResults.length > 1 ? 's' : ''} for “{searchQuery}”</p>}
                {highlightedResults.map((result, index) => (
                  <button key={`${result.book}-${result.chapter}-${result.verse}-${index}`} onClick={() => handleResultClick(result)} className="w-full text-left bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
                    <p className="font-semibold text-brand-dark">{result.book} {result.chapter}:{result.verse}</p>
                    <p className="mt-2 text-brand-secondary text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: result.html }} />
                  </button>
                ))}
                {searchQuery && searchResults.length === 0 && <p className="text-center py-10 text-brand-secondary">No results found.</p>}
              </div>
            )}
          </>
        ) : (
          <div ref={readerContentRef} className="relative">
            {selectedVerse && (
              <VerseActionMenu 
                verse={selectedVerse.verse}
                targetElement={selectedVerse.element}
                onClose={() => setSelectedVerse(null)}
                isBookmarked={isBookmarked(selectedVerse.verse)}
                onToggleBookmark={handleToggleBookmark}
                onOpenNote={handleOpenNote}
              />
            )}
            {!isPlanReadingMode && (
              <div className="flex justify-between items-center mb-6">
                <button onClick={onOpenReferenceSelector} className="flex items-center gap-2 text-2xl font-medium text-brand-primary" aria-label={`Select book and chapter, current is ${currentBook} ${currentChapter}`}>
                  <span>{currentBook} {currentChapter}</span>
                  <ChevronDownIcon />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={onOpenVersionSelector} className="border border-brand-secondary text-brand-secondary px-4 py-1 rounded-full text-sm" aria-label={`Select Bible version, current is ${currentVersion}`}>{currentVersion}</button>
                  <div ref={settingsDropdownRef} className="relative">
                      <button onClick={() => setIsSettingsOpen(p => !p)} className="text-brand-primary p-2" aria-label="Open reader settings" aria-haspopup="true" aria-expanded={isSettingsOpen}><SettingsIcon /></button>
                      {isSettingsOpen && (
                           <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-10 p-4">
                              <label className="text-sm font-medium text-brand-secondary mb-2 block text-center">Font Size</label>
                              <div className="flex items-center justify-around">
                                  <button onClick={decreaseFontSize} disabled={fontSizeIndex === 0} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 disabled:opacity-50 text-lg" aria-label="Decrease font size">A-</button>
                                  <button onClick={increaseFontSize} disabled={fontSizeIndex === FONT_SIZES.length - 1} className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 disabled:opacity-50 text-lg" aria-label="Increase font size">A+</button>
                              </div>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            )}
            
            {isLoadingChapter ? (
                <div className="text-center py-10 text-brand-secondary">
                    <div className="animate-pulse flex space-x-4 w-full">
                        <div className="flex-1 space-y-4 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                          <div className="h-4 bg-gray-200 rounded w-4/5 mx-auto"></div>
                          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
                        </div>
                    </div>
                    <p className="mt-4">Loading chapter...</p>
                </div>
            ) : (
                <div className={`text-brand-primary leading-loose space-y-3 ${fontSizeClass}`}>
                {parsedVerses && Array.isArray(parsedVerses) && parsedVerses.length > 0 ? (
                    parsedVerses.map((verse) => {
                        if (!verse || !verse.number || !verse.text) return null;
                        try {
                            const hasNote = getNoteForVerse(currentBook, currentChapter, parseInt(verse.number, 10));
                            const verseLabel = isPlanReadingMode
                              ? `{${currentChapter}:${verse.number}}`
                              : null;
                            return (
                                <div key={verse.number} id={`verse-${verse.number}`} onClick={(e) => handleVerseClick(verse, e)} className="p-1 rounded-md cursor-pointer hover:bg-brand-nav-active-bg">
                                    {isPlanReadingMode ? (
                                      <span>
                                        <span className="text-brand-secondary">{verseLabel} </span>
                                        {verse.text}
                                      </span>
                                    ) : (
                                      <div className="flex items-center">
                                        <sup className="font-bold text-sm pr-2 text-brand-secondary">{verse.number}</sup>
                                        <span>{verse.text}</span>
                                        {hasNote && <span className="ml-2 text-brand-accent" role="img" aria-label="Note">✏️</span>}
                                      </div>
                                    )}
                                </div>
                            );
                        } catch (error) {
                            console.error('Error rendering verse:', verse, error);
                            return null;
                        }
                    })
                ) : <p>Chapter text not available or content is not in verse format.</p>}
                </div>
            )}
          </div>
        )}
      </main>

      {!isSearching && isPlanReadingMode && (
        <div className="fixed bottom-24 left-0 right-0 max-w-md mx-auto z-20 pointer-events-none">
          <div className="flex justify-center items-center gap-6 px-6 pointer-events-auto">
            <button
              onClick={handlePrevChapter}
              disabled={!canGoPrevChapter}
              aria-disabled={!canGoPrevChapter}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-primary disabled:opacity-40"
              aria-label="Previous Chapter"
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={handleToggleAudio}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-dark"
              aria-label={isPlaying ? 'Stop audio scripture' : 'Play audio scripture'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={handleNextChapter}
              disabled={!canGoNextChapter}
              aria-disabled={!canGoNextChapter}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-brand-primary disabled:opacity-40"
              aria-label="Next Chapter"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {!isSearching && !isPlanReadingMode && (
        <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto bg-brand-bg/95 backdrop-blur-sm z-20">
          <div className="flex justify-between items-center p-4 border-t border-gray-200">
            <button onClick={handlePrevChapter} disabled={!canGoPrevChapter} aria-disabled={!canGoPrevChapter} className="flex items-center gap-2 text-brand-primary disabled:text-brand-inactive p-2" aria-label="Previous Chapter"><ChevronLeftIcon /><span className="font-medium">Previous</span></button>
            <button onClick={handleToggleAudio} className="text-brand-dark p-3 bg-white rounded-full shadow-md" aria-label={isPlaying ? "Stop audio scripture" : "Play audio scripture"}>{isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
            <button onClick={handleNextChapter} disabled={!canGoNextChapter} aria-disabled={!canGoNextChapter} className="flex items-center gap-2 text-brand-primary disabled:text-brand-inactive p-2" aria-label="Next Chapter"><span className="font-medium">Next</span><ChevronRightIcon /></button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-2">{editingNoteId ? 'Edit Note' : 'Add Note'}</h2>
            {/* Formatting Toolbar */}
            <div className="flex gap-2 mb-2">
              <button onClick={() => applyFormat('bold')} className="px-2 py-1 border rounded" aria-label="Bold"><strong>B</strong></button>
              <button onClick={() => applyFormat('italic')} className="px-2 py-1 border rounded italic" aria-label="Italic">I</button>
            </div>
            <textarea
              ref={noteTextareaRef}
              className="w-full border rounded p-2 mb-4"
              rows={4}
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              placeholder="Write your note here... Use *italic* or **bold** formatting."
            />
            <div className="flex justify-end gap-2">
              {editingNoteId && <button onClick={handleDeleteNote} className="px-4 py-2 bg-red-500 text-white rounded">Delete</button>}
              <button onClick={() => setIsNoteModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={handleSaveNote} className="px-4 py-2 bg-brand-dark text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export a wrapped version with error boundary
export function ReaderPageWithErrorBoundary(props: ReaderPageProps) {
  return (
    <ReaderPageErrorBoundary>
      <ReaderPage {...props} />
    </ReaderPageErrorBoundary>
  );
}

// Export ReaderPage as named export for internal use
export { ReaderPage };