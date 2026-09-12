const fs = require('fs');
const lines = fs.readFileSync('.tmp/scr071_all_texts_ordered.txt', 'utf8').split('\n');

// Read in chunks of 150 lines
console.log("=== LINES 110 to 350 ===");
console.log(lines.slice(110, 350).join('\n'));
