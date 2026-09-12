const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Find frames that are direct children of the main flex container
// Look for card containers and sections
const regex = /<frame\s+id="([^"]*)"\s+name="([^"]*)"(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?(?:\s+width="([^"]*)")?(?:\s+height="([^"]*)")?[^>]*?>([\s\S]*?)<\/frame>/g;

// Let's write a script to walk the XML hierarchy
const parserScript = `
const fs = require('fs');
const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Simple tag extractor
function getSections() {
  const titles = [];
  const textMatch = xml.matchAll(/<p\\.font-bold[^>]*>([\\s\\S]*?)<\\/p\\.font-bold>|<h[1-6][^>]*>([\\s\\S]*?)<\\/h[1-6]>/g);
  for (const m of textMatch) {
    const raw = (m[1] || m[2] || '').replace(/<[^>]+>/g, '').trim();
    if (raw) titles.push(raw);
  }
  console.log('Headings found:', titles);
}
`;
