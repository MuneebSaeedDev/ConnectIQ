const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Regex to extract all text tags: <text id="..." name="..." ... />
const textRegex = /<text\s+id="([^"]*)"\s+name="([^"]*)"/g;
let match;
const texts = [];
while ((match = textRegex.exec(xml)) !== null) {
  texts.push({ id: match[1], text: match[2] });
}

console.log('Extracted', texts.length, 'text nodes');
fs.writeFileSync('.tmp/scr070_texts_extracted.txt', texts.map(t => `[${t.id}] ${t.text}`).join('\n'), 'utf8');

// Also let's extract hierarchical structure (all card headings, sections, buttons, labels)
const allTagsRegex = /<(\w+)\s+id="([^"]*)"\s+name="([^"]*)"[^>]*?(\/?)>/g;
const elements = [];
while ((match = allTagsRegex.exec(xml)) !== null) {
  elements.push({ tag: match[1], id: match[2], name: match[3], selfClosing: match[4] === '/' });
}

fs.writeFileSync('.tmp/scr070_elements.txt', elements.map(e => `${e.tag.toUpperCase()} [${e.id}]: ${e.name}`).join('\n'), 'utf8');
console.log('Extracted', elements.length, 'total elements');
