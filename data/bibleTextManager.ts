import { bibleText as initialBibleText } from './bibleText';
import { BIBLE_VERSIONS, BibleVersion } from './bibleVersions';
import { BIBLE_BOOKS_LIST } from './bibleBooks';

export interface Verse {
  verse: number;
  text: string;
}

export interface BibleSearchResult {
  version: string;
  book: string;
  chapter: number;
  verse: string;
  text: string;
}

export const parseChapterText = (chapterText: string): Verse[] => {
  try {
    if (!chapterText || typeof chapterText !== 'string') {
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
    
    // Handle {1} or {1:1} Verse text {2} Verse text format
    if (chapterText.includes('{') && chapterText.includes('}')) {
      const verseRegex = /{(\d+(?::\d+)?)}\s*([^]*?)(?=\s*{(\d+(?::\d+)?)}|$)/g;
      const verses: Verse[] = [];
      let match;
      
      while ((match = verseRegex.exec(chapterText)) !== null) {
        const rawNum = match[1].includes(':') ? match[1].split(':')[1] : match[1];
        const verseNum = parseInt(rawNum, 10);
        const text = match[2] ? match[2].trim().replace(/\s+/g, ' ') : '';
        if (!isNaN(verseNum) && text) {
          verses.push({ verse: verseNum, text });
        }
      }
      
      if (verses.length > 0) {
        return verses;
      }
    }
    
    // Handle plain text format
    const lines = chapterText.split('\n').filter(line => line.trim());
    const verses: Verse[] = [];
    
    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const verseNum = parseInt(match[1], 10);
        const text = match[2].trim();
        verses.push({ verse: verseNum, text });
      }
    }
    
    if (verses.length === 0 && chapterText.trim()) {
      verses.push({ verse: 1, text: chapterText.trim() });
    }
    
    return verses;
  } catch (error) {
    console.error('Error parsing chapter text:', error);
    return [];
  }
};

const BIBLE_TEXT_KEY = 'gethsemane-bible-text-v1';

type BibleData = { [version: string]: { [book: string]: { [chapter: number]: string } } };

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

const LOCAL_BIBLE_VERSIONS = new Set(['AMP', 'NLT', 'KJV']);
const localBookCache: { [key: string]: { [chapter: string]: string } } = {};

const getLocalChapterText = async (version: string, book: string, chapter: number): Promise<string> => {
  const fileName = book.toLowerCase().replace(/\s+/g, '-');
  const cacheKey = `${version.toUpperCase()}/${fileName}`;

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

export const getChapterText = async (version: string, book: string, chapter: number): Promise<string> => {
  const verUpper = version.toUpperCase();
  if (LOCAL_BIBLE_VERSIONS.has(verUpper)) {
    try {
      return await getLocalChapterText(version, book, chapter);
    } catch (error) {
      console.error(`Error loading local chapter ${book} ${chapter} (${version}):`, error);
      return 'Bible text not available.';
    }
  }

  const key = `bible-chapter-${version}-${book}-${chapter}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return stored;
    }
  } catch (e) {
    console.error('Error accessing localStorage:', e);
  }

  const versionObj = BIBLE_VERSIONS.find(v => v.short.toUpperCase() === verUpper);
  if (!versionObj) {
    return 'Unsupported Bible version.';
  }
  const bibleId = versionObj.id;
  const bookId = BOOK_MAPPING[book];
  if (!bookId) {
    return 'Bible text not available. Book mapping error.';
  }
  
  const chapterId = `${bookId}.${chapter}`;
  const apiKey = import.meta.env.VITE_BIBLE_API_KEY;
  if (!apiKey) {
    return 'Bible text not available. API key missing.';
  }

  const url = `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}?content-type=text`;
  try {
    const response = await fetch(url, { headers: { accept: 'application/json', 'api-key': apiKey } });
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

/**
 * Search the full 66 books of the Bible for a given version.
 */
export const searchFullBible = async (
  version: string,
  query: string
): Promise<BibleSearchResult[]> => {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: BibleSearchResult[] = [];
  const normalizedVersion = version.toUpperCase();

  for (const book of BIBLE_BOOKS_LIST) {
    const fileName = book.toLowerCase().replace(/\s+/g, '-');
    const cacheKey = `${normalizedVersion}/${fileName}`;

    let bookData = localBookCache[cacheKey];
    if (!bookData) {
      try {
        const response = await fetch(`/bible/${normalizedVersion.toLowerCase()}/${fileName}.json`);
        if (response.ok) {
          bookData = await response.json();
          localBookCache[cacheKey] = bookData;
        }
      } catch {
        continue;
      }
    }

    if (!bookData) continue;

    for (const chapterStr in bookData) {
      const chapterText = bookData[chapterStr];
      if (chapterText && typeof chapterText === 'string' && chapterText.toLowerCase().includes(q)) {
        const verses = parseChapterText(chapterText);
        for (const verse of verses) {
          if (verse.text && verse.text.toLowerCase().includes(q)) {
            results.push({
              version: normalizedVersion,
              book,
              chapter: parseInt(chapterStr, 10),
              verse: String(verse.verse),
              text: verse.text,
            });
            if (results.length >= 250) {
              return results;
            }
          }
        }
      }
    }
  }

  return results;
};

const bundledBibleText: BibleData = initialBibleText;
let inMemoryCache: BibleData | null = null;

export const getBibleText = (): BibleData => {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  try {
    const storedText = window.localStorage.getItem(BIBLE_TEXT_KEY);
    if (storedText) {
      const parsedText = JSON.parse(storedText);
      if (Object.keys(parsedText).length > 0) {
        inMemoryCache = parsedText;
        return parsedText;
      }
    }
  } catch (error) {
    console.error("Error reading bible text from localStorage:", error);
  }

  inMemoryCache = bundledBibleText;
  return bundledBibleText;
};
