const fs = require('fs');
const lines = fs.readFileSync('.tmp/scr071_all_texts_ordered.txt', 'utf8').split('\n');

console.log("=== LINES 340 to 600 ===");
console.log(lines.slice(340, 600).join('\n'));
