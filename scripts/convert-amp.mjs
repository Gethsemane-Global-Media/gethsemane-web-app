// One-time converter: takes a bolls.life-style translation dump (array of
// {translation, book, chapter, verse, text, comment}) and writes per-book JSON
// files of the form { "<chapter>": "{1} verse text {2} verse text ..." }
// consumed by data/bibleTextManager.ts.
//
// Usage: node scripts/convert-amp.mjs <input.json> [outputDir]

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Standard 66-book Protestant canon order; `book` field in the dump is 1-based.
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

const stripHtml = (s) =>
  s
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/convert-amp.mjs <input.json> [outputDir]');
  process.exit(1);
}
const outDir = process.argv[3] || path.join(process.cwd(), 'public', 'bible', 'amp');

console.log(`Reading ${inputPath} ...`);
const verses = JSON.parse(readFileSync(inputPath, 'utf8'));
console.log(`Parsed ${verses.length} verse records`);

// book name -> chapter number -> [{verse, text}]
const data = {};
let skipped = 0;
for (const record of verses) {
  const bookName = BOOKS[record.book - 1];
  if (!bookName || !record.text) {
    skipped++;
    continue;
  }
  const byChapter = (data[bookName] ??= {});
  (byChapter[record.chapter] ??= []).push({ verse: record.verse, text: stripHtml(record.text) });
}

mkdirSync(outDir, { recursive: true });
let bookCount = 0;
let totalBytes = 0;
for (const [bookName, chapters] of Object.entries(data)) {
  const out = {};
  for (const [chapter, list] of Object.entries(chapters)) {
    list.sort((a, b) => a.verse - b.verse);
    out[chapter] = list.map(({ verse, text }) => `{${verse}} ${text}`).join(' ');
  }
  const fileName = bookName.toLowerCase().replace(/\s+/g, '-') + '.json';
  const json = JSON.stringify(out);
  writeFileSync(path.join(outDir, fileName), json);
  totalBytes += json.length;
  bookCount++;
}

console.log(`Wrote ${bookCount} books (${(totalBytes / 1024 / 1024).toFixed(2)} MB) to ${outDir}`);
if (skipped) console.log(`Skipped ${skipped} records (unknown book or empty text)`);
