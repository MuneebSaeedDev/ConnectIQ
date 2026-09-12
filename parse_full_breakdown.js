const fs = require('fs');
const lines = fs.readFileSync('.tmp/scr071_texts_numbered.txt', 'utf8').split('\n');

console.log("=== FULL TEXTS BREAKDOWN ===");
for (let i = 0; i < lines.length; i += 50) {
  console.log(`--- [Lines ${i} to ${Math.min(i+50, lines.length)}] ---`);
  console.log(lines.slice(i, i+50).join('\n'));
}
