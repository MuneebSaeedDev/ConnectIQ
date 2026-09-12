const fs = require('fs');
const xml = fs.readFileSync('.tmp/scr071_metadata.xml', 'utf8');

const regex = /<text[^>]*name="([^"]*)"[^>]*\/>/g;
let m;
const texts = [];
while ((m = regex.exec(xml)) !== null) {
  texts.push(m[1]);
}
fs.writeFileSync('.tmp/scr071_texts.txt', texts.join('\n'));
console.log('Total texts extracted:', texts.length);

// Also let's extract top-level frames or section containers
const frameRegex = /<frame id="([^"]*)" name="([^"]*)"[^>]*>/g;
let f;
const frames = [];
while ((f = frameRegex.exec(xml)) !== null) {
  frames.push({ id: f[1], name: f[2] });
}
console.log('Total frames extracted:', frames.length);

// Write structured summary
