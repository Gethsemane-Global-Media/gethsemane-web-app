const { PDFParse } = require('pdf-parse');
const fs = require('fs');

async function main() {
  const buf = fs.readFileSync('public/The-Holy-Bible-King-James-Version.pdf');
  const parser = new PDFParse();
  const data = await parser.parse(buf);
  // Print first 5000 chars to understand format
  console.log(JSON.stringify(data.text ? data.text.substring(0, 5000) : data).substring(0, 5000));
}
main().catch(console.error);
