const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Parse the full structure of node 220:5908
// Let's find all high-level cards in the main column (x ~ 17, width ~ 1448) and the right rail (x ~ 1482 or similar)
const frameRegex = /<frame\s+id="([^"]*)"\s+name="([^"]*)"\s+x="([^"]*)"\s+y="([^"]*)"\s+width="([^"]*)"\s+height="([^"]*)"[^>]*?>/g;
let m;
const frames = [];
while ((m = frameRegex.exec(xml)) !== null) {
  frames.push({
    id: m[1],
    name: m[2],
    x: parseFloat(m[3]),
    y: parseFloat(m[4]),
    w: parseFloat(m[5]),
    h: parseFloat(m[6])
  });
}

console.log('Total frames:', frames.length);

// Let's find all texts inside each frame region
const textRegex = /<text\s+id="([^"]*)"\s+name="([^"]*)"\s+x="([^"]*)"\s+y="([^"]*)"\s+width="([^"]*)"\s+height="([^"]*)"/g;
const texts = [];
while ((m = textRegex.exec(xml)) !== null) {
  texts.push({
    id: m[1],
    text: m[2],
    x: parseFloat(m[3]),
    y: parseFloat(m[4]),
    w: parseFloat(m[5]),
    h: parseFloat(m[6])
  });
}

console.log('Total texts:', texts.length);

// Let's identify the main cards in the screen
const cards = frames.filter(f => (f.w > 1000 || (f.w > 200 && f.w < 500 && f.h > 100)) && f.name.includes('bg-white'));
console.log('Card count:', cards.length);

cards.forEach((c, i) => {
  console.log(`CARD ${i + 1}: [${c.id}] ${c.name} (w=${c.w}, h=${c.h}, x=${c.x}, y=${c.y})`);
});
