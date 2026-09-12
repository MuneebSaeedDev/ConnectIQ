const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Let's parse all text nodes and frames properly
// Look for <text ...>content</text>
const textMatches = [];
const regex = /<text\s+([^>]*?)>([\s\S]*?)<\/text>/gi;
let m;
while ((m = regex.exec(xml)) !== null) {
  const attrs = m[1];
  const content = m[2].replace(/<[^>]+>/g, '').trim();
  const nameMatch = attrs.match(/name="([^"]*)"/);
  const idMatch = attrs.match(/id="([^"]*)"/);
  textMatches.push({
    id: idMatch ? idMatch[1] : '',
    name: nameMatch ? nameMatch[1] : '',
    content: content
  });
}

console.log('Total text nodes:', textMatches.length);

const out = textMatches.map(t => `[${t.id}] ${t.name}: "${t.content}"`).join('\n');
fs.writeFileSync('.tmp/scr070_all_texts.txt', out, 'utf8');

// Also extract all frame names
const frameMatches = [];
const frameRegex = /<frame\s+([^>]*?)>/gi;
while ((m = frameRegex.exec(xml)) !== null) {
  const attrs = m[1];
  const nameMatch = attrs.match(/name="([^"]*)"/);
  const idMatch = attrs.match(/id="([^"]*)"/);
  if (nameMatch) {
    frameMatches.push(`[${idMatch ? idMatch[1] : ''}] ${nameMatch[1]}`);
  }
}
fs.writeFileSync('.tmp/scr070_frames.txt', frameMatches.join('\n'), 'utf8');
console.log('Total frames:', frameMatches.length);
