const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Match <text ... name="..." /> or <frame ... name="..." ...>
const tagRegex = /<(\w+)\s+([^>]*?)(\/?>)/g;
let match;
const elements = [];
while ((match = tagRegex.exec(xml)) !== null) {
  const type = match[1];
  const attrsStr = match[2];
  const isSelfClosing = match[3] === '/>';

  const idMatch = attrsStr.match(/id="([^"]*)"/);
  const nameMatch = attrsStr.match(/name="([^"]*)"/);
  const xMatch = attrsStr.match(/x="([^"]*)"/);
  const yMatch = attrsStr.match(/y="([^"]*)"/);
  const wMatch = attrsStr.match(/width="([^"]*)"/);
  const hMatch = attrsStr.match(/height="([^"]*)"/);

  elements.push({
    type,
    id: idMatch ? idMatch[1] : '',
    name: nameMatch ? nameMatch[1] : '',
    x: xMatch ? parseFloat(xMatch[1]) : 0,
    y: yMatch ? parseFloat(yMatch[1]) : 0,
    w: wMatch ? parseFloat(wMatch[1]) : 0,
    h: hMatch ? parseFloat(hMatch[1]) : 0,
    isSelfClosing
  });
}

console.log('Total elements parsed:', elements.length);

// Extract all text elements
const textElements = elements.filter(e => e.type === 'text');
console.log('Text elements:', textElements.length);

fs.writeFileSync(
  '.tmp/scr070_text_nodes.json',
  JSON.stringify(textElements, null, 2),
  'utf8'
);

const textDump = textElements
  .map(t => `[${t.id}] ${t.name}`)
  .join('\n');
fs.writeFileSync('.tmp/scr070_texts_clean.txt', textDump, 'utf8');

console.log('Done writing text dump to .tmp/scr070_texts_clean.txt');
