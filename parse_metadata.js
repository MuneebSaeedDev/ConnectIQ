const fs = require('fs');
const xml = fs.readFileSync('.tmp/scr071_metadata.xml', 'utf8');

const regex = /<text[^>]*name="([^"]*)"/g;
let match;
const texts = [];
while ((match = regex.exec(xml)) !== null) {
  texts.push(match[1]);
}
console.log("Total text names:", texts.length);
fs.writeFileSync('.tmp/scr071_texts.txt', texts.join('\n'));

// Let's also inspect all top-level sections and major subframes
const frameRegex = /<frame[^>]*name="([^"]*)"[^>]*x="([^"]*)"[^>]*y="([^"]*)"[^>]*width="([^"]*)"[^>]*height="([^"]*)"/g;
const frames = [];
while ((match = frameRegex.exec(xml)) !== null) {
  frames.push({ name: match[1], x: match[2], y: match[3], w: match[4], h: match[5] });
}
console.log("Total frames:", frames.length);
fs.writeFileSync('.tmp/scr071_frames.json', JSON.stringify(frames.slice(0, 100), null, 2));

// Print summary of key headings
console.log("\nSample text entries (first 80):");
console.log(texts.slice(0, 80).join(' | '));
