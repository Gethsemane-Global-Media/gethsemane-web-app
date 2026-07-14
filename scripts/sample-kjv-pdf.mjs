import { readFileSync } from 'node:fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const buf = readFileSync('public/The-Holy-Bible-King-James-Version.pdf');
const pdf = await getDocument({ data: new Uint8Array(buf) }).promise;

// Sample the first page of each missing book
// TOC page + 21 offset = PDF page
const samples = {
  Psalms: 330,
  Hosea: 544,
  Nahum: 562,
  Malachi: 576,
  Colossians: 700,
  '1Thess': 702,
  Philemon: 712,
  '1Peter': 722,
  '1John': 726,
  '2John': 728,
  '3John': 730,
};

for (const [label, pdfPage] of Object.entries(samples)) {
  const page = await pdf.getPage(pdfPage);
  const content = await page.getTextContent();
  const pageText = content.items.map(i => i.str).join(' ');
  console.log(`\n--- ${label} (PDF page ${pdfPage}) ---\n${pageText.substring(0, 500)}`);
}
