const fs = require('fs');
const lines = fs.readFileSync('.tmp/scr071_texts_numbered.txt', 'utf8').split('\n');

for (let i = 100; i < lines.length; i += 60) {
  console.log(`\n================= LINES ${i} to ${Math.min(i+60, lines.length)} =================`);
  console.log(lines.slice(i, i+60).join('\n'));
}
