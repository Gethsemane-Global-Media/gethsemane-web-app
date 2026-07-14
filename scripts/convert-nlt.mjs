// One-time converter for the NLT dump: { books: { Gen: { chapters: { "1": { verses: { "1": "text" } } } } } }
// Books appear in canonical order, so abbreviations are mapped to full names by index.
// Writes per-book JSON files of the form { "<chapter>": "{1} verse text {2} verse text ..." }
// consumed by data/bibleTextManager.ts.
//
// Usage: node scripts/convert-nlt.mjs <input.json> [outputDir]

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
  'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
];

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/convert-nlt.mjs <input.json> [outputDir]');
  process.exit(1);
}
const outDir = process.argv[3] || path.join(process.cwd(), 'public', 'bible', 'nlt');

console.log(`Reading ${inputPath} ...`);
const data = JSON.parse(readFileSync(inputPath, 'utf8'));
const bookEntries = Object.entries(data.books);
if (bookEntries.length !== BOOKS.length) {
  console.warn(`Expected ${BOOKS.length} books, found ${bookEntries.length}`);
}

mkdirSync(outDir, { recursive: true });
let totalBytes = 0;
let verseCount = 0;
bookEntries.forEach(([abbr, bookData], index) => {
  const bookName = BOOKS[index];
  const out = {};
  for (const [chapter, chapterData] of Object.entries(bookData.chapters)) {
    const verses = Object.entries(chapterData.verses)
      .map(([verse, text]) => ({ verse: Number(verse), text: String(text).replace(/\s+/g, ' ').trim() }))
      .sort((a, b) => a.verse - b.verse);
    verseCount += verses.length;
    out[chapter] = verses.map(({ verse, text }) => `{${verse}} ${text}`).join(' ');
  }
  const fileName = bookName.toLowerCase().replace(/\s+/g, '-') + '.json';
  const json = JSON.stringify(out);
  writeFileSync(path.join(outDir, fileName), json);
  totalBytes += json.length;
});

console.log(`Wrote ${bookEntries.length} books, ${verseCount} verses (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to ${outDir}`);
