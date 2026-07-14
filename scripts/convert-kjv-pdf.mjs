// Extracts KJV text from the public-domain PDF into per-book JSON files.
// Processes page by page: each page starts with a header that identifies the book.
// Usage: node scripts/convert-kjv-pdf.mjs [pdfPath] [outputDir]

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy',
  'Joshua','Judges','Ruth','1 Samuel','2 Samuel',
  '1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra',
  'Nehemiah','Esther','Job','Psalms','Proverbs',
  'Ecclesiastes','Song of Songs','Isaiah','Jeremiah',
  'Lamentations','Ezekiel','Daniel','Hosea','Joel',
  'Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk',
  'Zephaniah','Haggai','Zechariah','Malachi',
  'Matthew','Mark','Luke','John','Acts',
  'Romans','1 Corinthians','2 Corinthians','Galatians',
  'Ephesians','Philippians','Colossians','1 Thessalonians',
  '2 Thessalonians','1 Timothy','2 Timothy','Titus',
  'Philemon','Hebrews','James','1 Peter','2 Peter',
  '1 John','2 John','3 John','Jude','Revelation',
];

// Aliases that appear in the PDF
const ALIASES = {
  'song of solomon': 'Song of Songs',
};

// Build a lookup: lowercased name -> canonical
const BOOK_LOWER = new Map(BOOKS.map(b => [b.toLowerCase(), b]));
for (const [alias, canonical] of Object.entries(ALIASES)) {
  BOOK_LOWER.set(alias, canonical);
}

// Build a regex to detect any book name at the start of a string
// (page headers always start with "Page N   BookName" or "BookName   Page N")
const bookPatternParts = [...BOOK_LOWER.keys()]
  .sort((a, b) => b.length - a.length) // longest first to avoid partial matches
  .map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const BOOK_IN_HEADER_RE = new RegExp(
  `(?:Page\\s+\\d+\\s+(${bookPatternParts.join('|')})|(${bookPatternParts.join('|')})\\s+Page\\s+\\d+)`,
  'i'
);

function detectBookInHeader(text) {
  const m = text.match(BOOK_IN_HEADER_RE);
  if (!m) return null;
  const raw = (m[1] || m[2]).toLowerCase().trim();
  return BOOK_LOWER.get(raw) ?? null;
}

const pdfPath = process.argv[2] || 'public/The-Holy-Bible-King-James-Version.pdf';
const outDir = process.argv[3] || 'public/bible/kjv';

console.log(`Reading ${pdfPath} ...`);
const buf = readFileSync(pdfPath);
const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;
console.log(`PDF has ${pdf.numPages} pages`);

// bookName -> chapter -> [{verse, text}]
const bookData = {};
let currentBook = null;

// Verse marker regex: {chapter:verse}
const VERSE_RE = /(\{\d+:\d+\})/g;

for (let p = 1; p <= pdf.numPages; p++) {
  const page = await pdf.getPage(p);
  const content = await page.getTextContent();
  const text = content.items.map(i => i.str).join(' ');

  // Detect book from this page's header
  const detectedBook = detectBookInHeader(text.substring(0, 120));
  if (detectedBook) {
    currentBook = detectedBook;
  }

  if (!currentBook) continue; // still in preface / TOC

  // Extract verses: split on {chapter:verse} tokens
  const parts = text.split(VERSE_RE);
  let chapter = null;
  let verse = null;
  let verseText = '';

  for (const part of parts) {
    const vm = part.match(/^\{(\d+):(\d+)\}$/);
    if (vm) {
      // Save previous verse
      if (chapter !== null && verse !== null && verseText.trim()) {
        const chapArr = ((bookData[currentBook] ??= {})[chapter] ??= []);
        chapArr.push({ verse, text: verseText.trim() });
      }
      chapter = parseInt(vm[1], 10);
      verse = parseInt(vm[2], 10);
      verseText = '';
    } else {
      if (verse !== null) {
        // Strip watermarks; keep only content after stripping headers
        const clean = part
          .replace(/Downloaded from www\.holybooks\.com[^\n]*/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        verseText += ' ' + clean;
      }
    }
  }
  // Flush the last verse on this page (may continue on next page — that's OK,
  // duplicate verse entries per chapter are deduplicated later)
  if (chapter !== null && verse !== null && verseText.trim()) {
    const chapArr = ((bookData[currentBook] ??= {})[chapter] ??= []);
    chapArr.push({ verse, text: verseText.trim() });
  }

  if (p % 100 === 0) process.stdout.write(`  ${p}/${pdf.numPages}\r`);
}
console.log('');

// Merge verse text pieces (a verse can span two pages, producing two partial entries)
for (const chapters of Object.values(bookData)) {
  for (const [ch, entries] of Object.entries(chapters)) {
    // Group by verse number, concatenate in page order
    const merged = {};
    for (const { verse, text } of entries) {
      merged[verse] = merged[verse] ? merged[verse] + ' ' + text : text;
    }
    chapters[ch] = Object.entries(merged)
      .map(([v, t]) => ({ verse: Number(v), text: t.replace(/\s+/g, ' ').trim() }))
      .sort((a, b) => a.verse - b.verse);
  }
}

// Write output files
mkdirSync(outDir, { recursive: true });
let totalBytes = 0;
let totalVerses = 0;
let booksWritten = 0;

for (const bookName of BOOKS) {
  const chapters = bookData[bookName];
  if (!chapters || Object.keys(chapters).length === 0) {
    console.warn(`WARNING: No data for ${bookName}`);
    continue;
  }
  const out = {};
  for (const [ch, verses] of Object.entries(chapters)) {
    out[ch] = verses.map(({ verse, text }) => `{${verse}} ${text}`).join(' ');
    totalVerses += verses.length;
  }
  const fileName = bookName.toLowerCase().replace(/\s+/g, '-') + '.json';
  const json = JSON.stringify(out);
  writeFileSync(`${outDir}/${fileName}`, json);
  totalBytes += json.length;
  booksWritten++;
}

console.log(`Wrote ${booksWritten} books, ${totalVerses} verses (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to ${outDir}`);
if (booksWritten < 66) {
  const missing = BOOKS.filter(b => !bookData[b] || Object.keys(bookData[b]).length === 0);
  console.warn('Missing:', missing.join(', '));
}
