const fs = require('fs');
const path = require('path');

const files = [
  'C:/Users/Ali/.claude/projects/c--Users-Ali-desktop-ConnectIQ/3a01c5ec-2413-4df2-a493-ac3ba6badddf/tool-results/mcp-figma-get_metadata-1789201321700.txt',
  'C:/Users/Ali/.claude/projects/c--Users-Ali-desktop-ConnectIQ/3a01c5ec-2413-4df2-a493-ac3ba6badddf/tool-results/mcp-figma-get_metadata-1789201290570.txt'
];

let raw = null;
for (const f of files) {
  if (fs.existsSync(f)) {
    raw = fs.readFileSync(f, 'utf8');
    break;
  }
}

if (!raw) {
  // Try to find any get_metadata file
  const glob = require('glob');
  console.log('Searching for files...');
}

const parsed = JSON.parse(raw);
const xml = parsed[0].text;
fs.writeFileSync('.tmp/scr070_metadata.xml', xml, 'utf8');

const regex = /<text[^>]*id="([^"]*)"[^>]*name="([^"]*)"[^>]*>([\s\S]*?)<\/text>|<frame[^>]*id="([^"]*)"[^>]*name="([^"]*)"/g;
let match;
const lines = [];
while ((match = regex.exec(xml)) !== null) {
  if (match[1]) {
    lines.push(`TEXT [id=${match[1]}, name="${match[2]}"]: ${match[3].replace(/\s+/g, ' ').trim()}`);
  } else if (match[4]) {
    lines.push(`FRAME [id=${match[4]}, name="${match[5]}"]`);
  }
}

fs.writeFileSync('.tmp/scr070_texts.txt', lines.join('\n'), 'utf8');
console.log('Saved .tmp/scr070_metadata.xml and .tmp/scr070_texts.txt with ' + lines.length + ' entries');
