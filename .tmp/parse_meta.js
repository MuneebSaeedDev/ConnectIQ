const fs = require('fs');
const glob = require('path');

const candidates = [
  'C:/Users/Ali/.claude/projects/c--Users-Ali-desktop-ConnectIQ/e580947d-ce94-4064-a75e-b53ce50d494a/tool-results/mcp-figma-get_metadata-1789201331531.txt',
  'C:/Users/Ali/.claude/projects/c--Users-Ali-desktop-ConnectIQ/e580947d-ce94-4064-a75e-b53ce50d494a/tool-results/mcp-figma-get_metadata-1789201364955.txt'
];

let targetFile = null;
for (const c of candidates) {
  if (fs.existsSync(c)) {
    targetFile = c;
    break;
  }
}

if (!targetFile) {
  console.error('Target file not found in candidates');
  process.exit(1);
}

const raw = fs.readFileSync(targetFile, 'utf8');
const parsed = JSON.parse(raw);
const xml = parsed[0].text;

fs.writeFileSync('.tmp/scr069_metadata.xml', xml, 'utf8');
console.log('Saved .tmp/scr069_metadata.xml length:', xml.length);

const lines = [];
const regex = /characters="([^"]*)"/g;
let match;
while ((match = regex.exec(xml)) !== null) {
  const t = match[1].replace(/&#10;/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  if (t.trim()) {
    lines.push(t);
  }
}

fs.writeFileSync('.tmp/scr069_texts.txt', lines.join('\n---\n'), 'utf8');
console.log('Extracted unique texts count:', lines.length);
