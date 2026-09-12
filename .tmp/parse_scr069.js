const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr069_metadata.xml', 'utf8');

const regex = /<text[^>]*id="([^"]*)"[^>]*name="([^"]*)"/g;
let match;
const lines = [];
while ((match = regex.exec(xml)) !== null) {
  lines.push(`[${match[1]}]: ${match[2]}`);
}

fs.writeFileSync('.tmp/scr069_texts.txt', lines.join('\n'), 'utf8');
console.log('Saved .tmp/scr069_texts.txt with ' + lines.length + ' entries');
