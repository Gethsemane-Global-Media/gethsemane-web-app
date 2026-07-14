export const parseChapterText = (chapterText: string): Verse[] => {
  try {
    // Handle case where chapterText is undefined or null
    if (!chapterText || typeof chapterText !== 'string') {
      console.warn('Invalid chapterText provided to parseChapterText:', chapterText);
      return [];
    }
    
    // Handle scripture.api.bible format (HTML with verse spans)
    if (chapterText.includes('<span class="verse">')) {
      const verseRegex = /<span class="verse"[^>]*>(\d+)<\/span>\s*([^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*)/g;
      const verses: Verse[] = [];
      let match;
      
      while ((match = verseRegex.exec(chapterText)) !== null) {
        const verseNum = parseInt(match[1], 10);
        let text = match[2].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        if (!isNaN(verseNum) && text) {
          verses.push({ verse: verseNum, text });
        }
      }
      
      return verses;
    }
    
    // Handle {1} Verse text {2} Verse text format (from free APIs)
    if (chapterText.includes('{') && chapterText.includes('}')) {
      const parts = chapterText.split(/\{(\d+)\}/).filter(Boolean);
      const verses: Verse[] = [];
      
      for (let i = 0; i < parts.length; i += 2) {
        const verseNum = parseInt(parts[i], 10);
        const text = (parts[i + 1] || '').trim();
        if (!isNaN(verseNum) && text) {
          verses.push({ verse: verseNum, text });
        }
      }
      
      return verses;
    }
    
    // Handle plain text format (fallback)
    const lines = chapterText.split('\n').filter(line => line.trim());
    const verses: Verse[] = [];
    
    for (const line of lines) {
      // Try to extract verse number and text
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const verseNum = parseInt(match[1], 10);
        const text = match[2].trim();
        verses.push({ verse: verseNum, text });
      }
    }
    
    // If no verses found with any format, create a single verse
    if (verses.length === 0 && chapterText.trim()) {
      verses.push({ verse: 1, text: chapterText.trim() });
    }
    
    return verses;
  } catch (error) {
    console.error('Error parsing chapter text:', error);
    return [];
  }
};import { bibleText as initialBibleText } from './bibleText';
import { BIBLE_VERSIONS, BibleVersion } from './bibleVersions';
import { BIBLE_BOOKS_LIST } from './bibleBooks';

const BIBLE_TEXT_KEY = 'behold-bible-text-v1';

type BibleData = { [version: string]: { [book: string]: { [chapter: number]: string } } };

// Book mapping for scripture.api.bible format (OSIS standard)
const BOOK_MAPPING: { [key: string]: string } = {
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Solomon': 'SNG',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV'
};

// Versions served from bundled files in public/bible/<version>/ instead of the external API
const LOCAL_BIBLE_VERSIONS = new Set(['AMP', 'NLT', 'KJV']);
const localBookCache: { [key: string]: { [chapter: string]: string } } = {};

const getLocalChapterText = async (version: string, book: string, chapter: number): Promise<string> => {
  const fileName = book.toLowerCase().replace(/\s+/g, '-');
  const cacheKey = `${version}/${fileName}`;

  let bookData = localBookCache[cacheKey];
  if (!bookData) {
    const response = await fetch(`/bible/${version.toLowerCase()}/${fileName}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load local bible data for ${book} (${version})`);
    }
    bookData = await response.json();
    localBookCache[cacheKey] = bookData;
  }

  const text = bookData[String(chapter)];
  if (!text) {
    throw new Error(`Chapter ${chapter} not found in local ${version} data for ${book}`);
  }
  return text;
};

// New async function for dynamic chapter loading
export const getChapterText = async (version: string, book: string, chapter: number): Promise<string> => {
  if (LOCAL_BIBLE_VERSIONS.has(version.toUpperCase())) {
    try {
      return await getLocalChapterText(version, book, chapter);
    } catch (error) {
      console.error(`Error loading local chapter ${book} ${chapter} (${version}):`, error);
      return 'Bible text not available.';
    }
  }

  const key = `bible-chapter-${version}-${book}-${chapter}`;
  console.log(`Loading chapter: ${version} ${book} ${chapter}`);
  
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      console.log('Found cached chapter text');
      return stored;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }

  const versionObj = BIBLE_VERSIONS.find(v => v.short.toUpperCase() === version.toUpperCase());
  if (!versionObj) {
    throw new Error(`Unsupported Bible version: ${version}`);
  }
  const bibleId = versionObj.id;

  // Map book name to OSIS format
  const bookId = BOOK_MAPPING[book];
  if (!bookId) {
    console.error(`Book mapping not found for: ${book}`);
    return 'Bible text not available. Book mapping error.';
  }
  
  const chapterId = `${bookId}.${chapter}`;

  const apiKey = import.meta.env.VITE_BIBLE_API_KEY;
  console.log('API Key available:', !!apiKey);
  if (!apiKey) {
    console.error('Missing VITE_BIBLE_API_KEY environment variable');
    return 'Bible text not available. API key missing.';
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=text`;
  console.log('Fetching from:', url);

  try {
    const response = await fetch(url, { headers: { accept: 'application/json', 'api-key': apiKey } });
    console.log('Response status:', response.status);
    
    if (response.status === 403) {
      console.error('API key is invalid or rate limited');
      return 'Bible text not available. API key issue.';
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    
    const data = await response.json();
    const formatted = data.data.content;
    localStorage.setItem(key, formatted);
    return formatted;
  } catch (error) {
    console.error(`Error fetching chapter ${book} ${chapter} (${version}):`, error);
    return 'Bible text not available. Please check your connection.';
  }
};

const bundledBibleText: BibleData = initialBibleText;

let inMemoryCache: BibleData | null = null;

// Function to get the bible data, preferring in-memory, then localStorage, then bundled.
// It also populates localStorage if it's empty.
export const getBibleText = (): BibleData => {
    // 1. Check in-memory cache first for performance
    if (inMemoryCache) {
        return inMemoryCache;
    }

    // 2. Check localStorage
    try {
        const storedText = window.localStorage.getItem(BIBLE_TEXT_KEY);
        if (storedText) {
            const parsedText = JSON.parse(storedText);
            // Simple validation to ensure it's not empty/corrupted
            if (Object.keys(parsedText).length > 0) {
                inMemoryCache = parsedText;
                return parsedText;
            }
        }
    } catch (error) {
        console.error("Error reading bible text from localStorage:", error);
    }

    // 3. If not in localStorage or stored data is invalid, use bundled data and store it
    try {
        // Note: This might be slow on first load and could fail if bibleText is too large for localStorage.
        window.localStorage.setItem(BIBLE_TEXT_KEY, JSON.stringify(bundledBibleText));
        inMemoryCache = bundledBibleText;
        return bundledBibleText;
    } catch (error) {
        console.error("Error storing bible text to localStorage:", error);
        // If storing fails (e.g., storage full), just return the bundled text for this session.
        inMemoryCache = bundledBibleText;
        return bundledBibleText;
    }
};
