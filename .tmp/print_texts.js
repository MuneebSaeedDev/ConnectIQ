const fs = require('fs');

const texts = fs.readFileSync('.tmp/scr070_texts_clean.txt', 'utf8').split('\n');

console.log('Total text lines:', texts.length);

// Print all text lines grouped into blocks of 50
for (let i = 0; i < texts.length; i += 50) {
  console.log(`=== CHUNK ${i} - ${i + 50} ===`);
  console.log(texts.slice(i, i + 50).join('\n'));
}
