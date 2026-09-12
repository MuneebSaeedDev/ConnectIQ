const fs = require('fs');
const texts = fs.readFileSync('.tmp/scr071_texts.txt', 'utf8').split('\n');

console.log("=== ALL TEXTS IN ORDER ===");
texts.forEach((t, i) => {
  if (t.match(/^(01|02|03|04|05|06|07|08|09|10|11|12|13|14|15|16|17|18|19|20)\b/) || t.includes("Summary") || t.includes("Live Validation") || t.includes("Sticky") || t.includes("Modal")) {
    console.log(`\n--- SECTION MARKER [${i}]: ${t} ---`);
  } else {
    console.log(`[${i}] ${t}`);
  }
});
