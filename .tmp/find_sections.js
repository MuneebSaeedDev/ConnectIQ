const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Find all elements with their bounding boxes and names
const regex = /<(\w+)\s+id="([^"]*)"\s+name="([^"]*)"(?:\s+x="([^"]*)")?(?:\s+y="([^"]*)")?(?:\s+width="([^"]*)")?(?:\s+height="([^"]*)")?[^>]*?>/g;
let match;
const elements = [];
while ((match = regex.exec(xml)) !== null) {
  elements.push({
    tag: match[1],
    id: match[2],
    name: match[3],
    x: match[4] ? parseFloat(match[4]) : 0,
    y: match[5] ? parseFloat(match[5]) : 0,
    w: match[6] ? parseFloat(match[6]) : 0,
    h: match[7] ? parseFloat(match[7]) : 0,
  });
}

// Find card headers
console.log('--- CARDS / SECTIONS DETECTED ---');
const sectionTitles = [
  'General Information',
  'Input Dataset',
  'Transformation Mode',
  'Transformation Rules',
  'Data Cleaning',
  'Type Conversion',
  'Date Formatting',
  'Duplicate Removal',
  'Lookup Transformation',
  'Expression Editor',
  'Transformation Preview',
  'Transformation Testing',
  'Validation',
  'Runtime Configuration',
  'Monitoring',
  'Advanced Configuration',
  'Configuration Status',
  'Transformation Summary',
  'Operation Breakdown',
  'Test Summary',
  'Validation Summary'
];

for (const title of sectionTitles) {
  const el = elements.find(e => e.name === title);
  if (el) {
    console.log(`SECTION: "${title}" [id=${el.id}] at y=${el.y}`);
  }
}
