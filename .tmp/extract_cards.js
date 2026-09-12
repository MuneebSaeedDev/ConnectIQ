const fs = require('fs');

const xml = fs.readFileSync('.tmp/scr070_metadata.xml', 'utf8');

// Parse all tags with hierarchical containment or bounding boxes
// We can find all text tags that fall within each card's y-range or find the XML substring for each card frame
const cardIds = [
  '220:6006', // Top Header
  '220:6029', // Card 1: General Information
  '220:6101', // Card 2: Input Dataset
  '220:6217', // Card 3: Transformation Mode
  '220:6241', // Card 4: Transformation Rules (Structured rule builder)
  '220:6367', // Card 5: Data Cleaning
  '220:6436', // Card 6: Type Conversion
  '220:6494', // Card 7: Date Formatting
  '220:6560', // Card 8: Duplicate Removal
  '220:6626', // Card 9: Lookup Transformation
  '220:6692', // Card 10: Expression Editor
  '220:6758', // Card 11: Transformation Preview
  '220:6857', // Card 12: Transformation Testing
  '220:6935', // Card 13: Validation (Continuous configuration validation)
  '220:6977', // Card 14: Runtime Configuration
  '220:7019', // Card 15: Monitoring
  '220:7089', // Card 16: Advanced Configuration (Accordion)
  // Right rail summary cards (w=220):
  '220:7099', // Rail Card 1: Configuration Status
  '220:7117', // Rail Card 2: Transformation Summary
  '220:7167', // Rail Card 3: Operation Breakdown
  '220:7219', // Rail Card 4: Test Summary
  '220:7242', // Rail Card 5: Validation Summary
  // Bottom panels (w=1686):
  '220:7271', // Bottom Section 1: Transformation Summary / Quick KPI Strip
  '220:7320', // Bottom Section 2: Validation / Test Results / Logs telemetry panel
];

// Extract texts for each card
const out = [];

for (const cardId of cardIds) {
  const cardStart = xml.indexOf(`id="${cardId}"`);
  if (cardStart === -1) continue;

  // Find the closing of this card or the next card start
  let cardSnippet = xml.slice(cardStart, cardStart + 15000);
  // Find text nodes inside this snippet
  const textMatches = [...cardSnippet.matchAll(/<text\s+id="([^"]*)"\s+name="([^"]*)"/g)];

  out.push(`=======================================================`);
  out.push(`CARD ID: ${cardId}`);
  out.push(`=======================================================`);
  textMatches.forEach(tm => {
    out.push(`  [${tm[1]}] ${tm[2]}`);
  });
}

fs.writeFileSync('.tmp/scr070_cards_breakdown.txt', out.join('\n'), 'utf8');
console.log('Wrote card breakdown to .tmp/scr070_cards_breakdown.txt');
