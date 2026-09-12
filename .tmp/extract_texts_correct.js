const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr069_metadata.xml', 'utf8');

// In this XML format, text is inside <text ... name="TEXT_CONTENT" ... />
const regex = /<text[^>]*id="([^"]*)"[^>]*name="([^"]*)"/g;
let match;
const texts = [];
while ((match = regex.exec(xml)) !== null) {
  const content = match[2].trim();
  if (content && content !== '/' && content !== '') {
    texts.push({ id: match[1], content });
  }
}

console.log('Extracted text elements from name attribute:', texts.length);
const dump = texts.map((t, idx) => `[${idx + 1}] (${t.id}): ${t.content}`).join('\n');
fs.writeFileSync('.tmp/scr069_all_texts.txt', dump, 'utf8');

// Print first 80
console.log(dump.slice(0, 3000));
