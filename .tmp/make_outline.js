const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Parse all elements in hierarchical order
const lines = [];
const regex = /<(frame|text)\s+id="([^"]*)"\s+name="([^"]*)"(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?(?:\s+width="([^"]*)")?(?:\s+height="([^"]*)")?(\/?>)/g;
let match;
while ((match = regex.exec(xml)) !== null) {
  const type = match[1];
  const id = match[2];
  const name = match[3];
  const w = parseFloat(match[6] || 0);
  const h = parseFloat(match[7] || 0);
  const isClose = match[8] === '/>';

  if (type === 'text') {
    lines.push(`  TEXT [${id}]: "${name}"`);
  } else if (name.includes('p.font-bold') || name.includes('h1') || name.includes('h2') || name.includes('h3') || (w > 1000 && h > 100) || (w < 400 && w > 200 && h > 100)) {
    lines.push(`FRAME [${id}] "${name}" (${w}x${h})`);
  }
}

fs.writeFileSync('.tmp/scr070_outline.txt', lines.join('\n'), 'utf8');
console.log('Saved outline with', lines.length, 'lines');
