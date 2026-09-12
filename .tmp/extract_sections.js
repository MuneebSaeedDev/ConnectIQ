const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Parse text tags: <text ... name="...">CONTENT</text>
const textRegex = /<text[^>]*id="([^"]*)"[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g;
let match;
const texts = [];
while ((match = textRegex.exec(xml)) !== null) {
  const content = match[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  if (content) {
    texts.push({ id: match[1], name: match[2], content });
  }
}

console.log('Total text elements:', texts.length);

// Let's write a full human-readable dump
const dump = texts.map((t, idx) => `[${idx + 1}] (id: ${t.id}, name: "${t.name}"): "${t.content}"`).join('\n');
fs.writeFileSync('.tmp/scr070_all_texts.txt', dump, 'utf8');

// Let's find headings and sections
console.log('--- HEADINGS & TITLES ---');
texts.filter(t => t.name.startsWith('h1') || t.name.startsWith('h2') || t.name.startsWith('h3') || t.name.includes('bold') || t.name.includes('font-bold') || t.name.includes('font-semibold') || t.content.length < 50 && (t.content.includes('Section') || t.content.includes('Node') || t.content.includes('Configuration') || t.content.includes('Transformation'))).forEach(t => {
  console.log(`[${t.id}] ${t.name} -> "${t.content}"`);
});
