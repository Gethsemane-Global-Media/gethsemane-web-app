import React, { useState, useMemo, useCallback, useEffect, ReactNode, Component, ErrorInfo } from 'react';
import { BIBLE_CHAPTERS, BIBLE_BOOKS_LIST } from '../data/bibleBooks';
import { BIBLE_VERSIONS } from '../data/bibleVersions';
import { getBibleText, getChapterText } from '../data/bibleTextManager';
import { ReaderPageWithErrorBoundary } from './ReaderPage';
import ReferencesPage from './ReferencesPage';
import ReferenceSelectorPage from './ReferenceSelectorPage';

interface SearchResult {
  version: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
}

interface BibleNavTarget {
    book: string;
    chapter: number;
    verse: number | null;
}

interface PlanReadingSession {
  planId: string;
  book: string;
  startChapter: number;
  endChapter: number;
}

interface BiblePageProps {
    initialTarget: BibleNavTarget | null;
    onNavigationHandled: () => void;
    planReadingSession?: PlanReadingSession | null;
    onDailyReadingComplete?: () => void;
}

// Error Boundary Component
class BiblePageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('BiblePage error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                        <h2 className="text-xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
                        <p className="text-gray-700 mb-4">We're having trouble loading the Bible text.</p>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-brand-primary-dark transition-colors"
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

const LAST_READ_KEY = 'behold-last-read';

const parseChapterText = (chapterText: string): { number: string; text: string }[] => {
    if (!chapterText || typeof chapterText !== 'string') return [];
    
    try {
        const verses: { number: string; text: string }[] = [];
        const verseRegex = /{(\d+(?::\d+)?)}\s*([^]*?)(?=\s*{(\d+(?::\d+)?)}|$)/g;
        let match;
        
        while ((match = verseRegex.exec(chapterText)) !== null) {
            try {
                const verseNum = match[1].includes(':') ? match[1].split(':')[1] : match[1];
                const verseText = match[2] ? match[2].trim().replace(/\s+/g, ' ') : '';
                if (verseNum && verseText) {
                    verses.push({ number: verseNum, text: verseText });
                }
            } catch (parseError) {
                console.error('Error parsing individual verse:', parseError);
                continue;
            }
        }
        
        if (verses.length === 0 && chapterText.trim()) {
            return [{ number: '1', text: chapterText.trim() }];
        }
        
        return verses;
    } catch (error) {
        console.error('Error in parseChapterText:', error);
        return [{ number: '1', text: chapterText }];
    }
};


const BiblePage: React.FC<BiblePageProps> = ({
  initialTarget,
  onNavigationHandled,
  planReadingSession = null,
  onDailyReadingComplete,
}) => {
    const [currentBook, setCurrentBook] = useState(() => {
        try { 
            const saved = localStorage.getItem(LAST_READ_KEY); 
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed && typeof parsed === 'object' && parsed.book && BIBLE_BOOKS_LIST.includes(parsed.book) 
                    ? parsed.book 
                    : 'Genesis'; 
            }
            return 'Genesis'; 
        } catch { 
            return 'Genesis'; 
        }
    });
    const [currentChapter, setCurrentChapter] = useState(() => {
        try { 
            const saved = localStorage.getItem(LAST_READ_KEY); 
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed && typeof parsed === 'object' && parsed.chapter && typeof parsed.chapter === 'number' && parsed.chapter > 0
                    ? parsed.chapter 
                    : 1; 
            }
            return 1; 
        } catch { 
            return 1; 
        }
    });
    const [currentVersion, setCurrentVersion] = useState('KJV');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    
    const [isSelectingVersion, setIsSelectingVersion] = useState(false);
    const [isSelectingReference, setIsSelectingReference] = useState(false);
    const [scrollToVerse, setScrollToVerse] = useState<number | null>(null);

    const [parsedVerses, setParsedVerses] = useState<{ number: string; text: string }[]>([]);
    const [isLoadingChapter, setIsLoadingChapter] = useState(true);

    useEffect(() => {
        try {
            localStorage.setItem(LAST_READ_KEY, JSON.stringify({ book: currentBook, chapter: currentChapter }));
        } catch (error) {
            console.error("Could not save last read position:", error);
        }
    }, [currentBook, currentChapter]);

    useEffect(() => {
        if (initialTarget) {
            handleSelectReference(initialTarget.book, initialTarget.chapter, initialTarget.verse);
            onNavigationHandled();
        }
    }, [initialTarget, onNavigationHandled]);
    
    useEffect(() => {
        const loadChapter = async () => {
            setIsLoadingChapter(true);
            try {
                // Validate inputs
                if (!currentVersion || !currentBook || !currentChapter || currentChapter < 1) {
                    throw new Error(`Invalid parameters: version=${currentVersion}, book=${currentBook}, chapter=${currentChapter}`);
                }

                // Try to load from API first
                const chapterText = await getChapterText(currentVersion, currentBook, currentChapter);
                let verses;
                if (chapterText && !chapterText.includes('not available')) {
                    verses = parseChapterText(chapterText);
                } else {
                    // Fallback to bundled text
                    console.log('Falling back to bundled Bible text');
                    const bibleData = getBibleText();
                    if (!bibleData) {
                        throw new Error('No Bible data available');
                    }
                    
                    const versionData = bibleData[currentVersion];
                    if (!versionData) {
                        throw new Error(`Version ${currentVersion} not found in bundled data`);
                    }
                    
                    const bookData = versionData[currentBook];
                    if (!bookData) {
                        throw new Error(`Book ${currentBook} not found in version ${currentVersion}`);
                    }
                    
                    const chapterTextBundled = bookData[currentChapter];
                    
                    if (chapterTextBundled) {
                        verses = parseChapterText(chapterTextBundled);
                    } else {
                        verses = [{ number: '!', text: `Text for ${currentBook} ${currentChapter} in ${currentVersion} is not available.` }];
                    }
                }
                setParsedVerses(verses || []);
            } catch (error) {
                console.error('Error loading chapter:', error);
                // Fallback to bundled text on error
                try {
                    const bibleData = getBibleText();
                    if (bibleData) {
                        const versionData = bibleData[currentVersion];
                        if (versionData) {
                            const bookData = versionData[currentBook];
                            if (bookData) {
                                const chapterTextBundled = bookData[currentChapter];
                                if (chapterTextBundled) {
                                    const verses = parseChapterText(chapterTextBundled);
                                    setParsedVerses(verses || []);
                                } else {
                                    setParsedVerses([{ number: '!', text: `Chapter ${currentChapter} not found in ${currentBook}` }]);
                                }
                            } else {
                                setParsedVerses([{ number: '!', text: `Book ${currentBook} not found` }]);
                            }
                        } else {
                            setParsedVerses([{ number: '!', text: `Version ${currentVersion} not found` }]);
                        }
                    } else {
                        setParsedVerses([{ number: '!', text: 'No Bible data available' }]);
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    setParsedVerses([{ number: '!', text: 'Failed to load Bible text' }]);
                }
            } finally {
                setIsLoadingChapter(false);
            }
        };
        loadChapter();
    }, [currentBook, currentChapter, currentVersion]);

    const totalChapters = BIBLE_CHAPTERS[currentBook] || 1;

    const isPlanReading =
      planReadingSession !== null &&
      currentBook === planReadingSession.book;

    const planChapterProgress = useMemo(() => {
      if (!isPlanReading || !planReadingSession) return 0;
      const total = planReadingSession.endChapter - planReadingSession.startChapter + 1;
      const current = currentChapter - planReadingSession.startChapter + 1;
      return Math.min(100, Math.round((current / total) * 100));
    }, [isPlanReading, planReadingSession, currentChapter]);

    const handlePrevChapter = useCallback(() => {
        if (isPlanReading && planReadingSession) {
          if (currentChapter > planReadingSession.startChapter) {
            setCurrentChapter((c) => c - 1);
          }
          return;
        }
        if (currentChapter > 1) setCurrentChapter(c => c - 1);
    }, [currentChapter, isPlanReading, planReadingSession]);

    const handleNextChapter = useCallback(() => {
        if (isPlanReading && planReadingSession) {
          if (currentChapter < planReadingSession.endChapter) {
            setCurrentChapter((c) => c + 1);
          } else {
            onDailyReadingComplete?.();
          }
          return;
        }
        if (currentChapter < totalChapters) setCurrentChapter(c => c + 1);
    }, [currentChapter, totalChapters, isPlanReading, planReadingSession, onDailyReadingComplete]);

    const handleSelectReference = useCallback((book: string, chapter: number, verse: number | null) => {
        setCurrentBook(book);
        setCurrentChapter(chapter);
        setScrollToVerse(verse);
        setIsSelectingReference(false);
    }, []);

    const handleVersionSelect = useCallback((version: string) => {
        setCurrentVersion(version);
        setIsSelectingVersion(false);
    }, []);

    const performSearch = useCallback(async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }
        setIsLoadingSearch(true);
        
        try {
            const results: SearchResult[] = [];
            const bibleData = getBibleText();
            if (!bibleData) {
                console.error('No Bible data available for search');
                setSearchResults([]);
                setIsLoadingSearch(false);
                return;
            }
            
            const versionData = bibleData[currentVersion];
            if (!versionData) {
                console.error(`Version ${currentVersion} not found for search`);
                setSearchResults([]);
                setIsLoadingSearch(false);
                return;
            }
            
            const query = searchQuery.toLowerCase();

            for (const book in versionData) {
                if (Object.prototype.hasOwnProperty.call(versionData, book)) {
                    const bookData = versionData[book];
                    if (!bookData) continue;
                    
                    for (const chapter in bookData) {
                        if (Object.prototype.hasOwnProperty.call(bookData, chapter)) {
                            const chapterText = bookData[chapter];
                            if (chapterText && typeof chapterText === 'string' && chapterText.toLowerCase().includes(query)) {
                                try {
                                    const verses = parseChapterText(chapterText);
                                    if (verses && Array.isArray(verses)) {
                                        for (const verse of verses) {
                                            if (verse && verse.text && verse.text.toLowerCase().includes(query)) {
                                                results.push({
                                                    version: currentVersion,
                                                    book,
                                                    chapter: parseInt(chapter) || 1,
                                                    verse: verse.number || '1',
                                                    text: verse.text,
                                                });
                                            }
                                        }
                                    }
                                } catch (parseError) {
                                    console.error(`Error parsing chapter ${book} ${chapter}:`, parseError);
                                }
                            }
                        }
                    }
                }
            }
            
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoadingSearch(false);
        }
    }, [searchQuery, currentVersion]);

    const handleResultClick = useCallback((result: SearchResult) => {
        setCurrentBook(result.book);
        setCurrentChapter(result.chapter);
        setScrollToVerse(parseInt(result.verse, 10));
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    }, []);

    const highlightText = (text: string, highlight: string): string => {
        if (!highlight.trim()) return text;
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return text.replace(regex, `<strong class="bg-yellow-200 text-brand-dark">$1</strong>`);
    };

    const handleCancelSearch = useCallback(() => {
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    }, []);
    
    if (isSelectingVersion) {
      return <ReferencesPage onBack={() => setIsSelectingVersion(false)} onSelectVersion={handleVersionSelect} />;
    }
    
    if (isSelectingReference) {
        return <ReferenceSelectorPage onBack={() => setIsSelectingReference(false)} onSelect={handleSelectReference} initialBook={currentBook} initialChapter={currentChapter} />;
    }

    return (
        <>
            <ReaderPageWithErrorBoundary
                currentBook={currentBook}
                currentChapter={currentChapter}
                currentVersion={currentVersion}
                totalChapters={totalChapters}
                isLoadingChapter={isLoadingChapter}
                parsedVerses={parsedVerses}
                isLoadingSearch={isLoadingSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                performSearch={performSearch}
                handleCancelSearch={handleCancelSearch}
                handleResultClick={handleResultClick}
                handlePrevChapter={handlePrevChapter}
                handleNextChapter={handleNextChapter}
                highlightText={highlightText}
                isSearching={isSearching}
                onSearchingChange={setIsSearching}
                onOpenVersionSelector={() => setIsSelectingVersion(true)}
                onOpenReferenceSelector={() => setIsSelectingReference(true)}
                scrollToVerse={scrollToVerse}
                onScrolledToVerse={() => setScrollToVerse(null)}
                isPlanReadingMode={isPlanReading}
                planChapterProgress={planChapterProgress}
                canGoPrevChapter={
                  isPlanReading && planReadingSession
                    ? currentChapter > planReadingSession.startChapter
                    : currentChapter > 1
                }
                canGoNextChapter={
                  isPlanReading && planReadingSession
                    ? true
                    : currentChapter < totalChapters
                }
            />
        </>
    );
};

// Safe wrapper component with error boundary
const BiblePageWithErrorBoundary: React.FC<BiblePageProps> = (props) => {
    return (
        <BiblePageErrorBoundary>
            <BiblePage {...props} />
        </BiblePageErrorBoundary>
    );
};

export default BiblePageWithErrorBoundary;