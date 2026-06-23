import fs from 'fs';
const raw = fs.readFileSync('cleaned_hotels.json', 'utf8');
const hotels = JSON.parse(raw);

const groups = {
  "1. The Nordics & The Arctic": [],
  "2. The Mediterranean Riviera": [],
  "3. The Classic European Cities": [],
  "4. The Deep Countryside & Highlands": [],
  "5. The Desert & Arid Escapes": [],
  "Other / Uncategorized": []
};

hotels.forEach(h => {
  const loc = (h.location + " " + h.region).toLowerCase();
  
  if (loc.match(/sweden|norway|iceland|greenland|lapland|finland|tromso|reykjavik|arctic/)) {
    groups["1. The Nordics & The Arctic"].push(h);
  } else if (loc.match(/amalfi|positano|lake como|corsica|santorini|riviera|mallorca|algarve|antibes|saint-raphaël|ramatuelle|croix-valmer|èze|ibiza|garda|cyclades/)) {
    groups["2. The Mediterranean Riviera"].push(h);
  } else if (loc.match(/paris|rome|london|lisbon|copenhagen|berlin|milan|avignon/)) {
    groups["3. The Classic European Cities"].push(h);
  } else if (loc.match(/tuscany|scotland|douro|bavaria|provence|cotswolds|gordes|massignac|dolomites|alps|tyrol|chamonix|zermatt|cortina|méribel|brasov|highlands/)) {
    groups["4. The Deep Countryside & Highlands"].push(h);
  } else if (loc.match(/bardenas|desert|andalusia|almeria/)) {
    groups["5. The Desert & Arid Escapes"].push(h);
  } else {
    groups["Other / Uncategorized"].push(h);
  }
});

let md = `# Comprehensive Hotel Soundscape & Vibe Directory\n\n`;
md += `This document lists every hotel currently in the database, categorized by the 5 Core Soundscapes we defined. It also includes the specific tags (Mood/Vibe/Backdrop) assigned to each hotel so you know exactly how they are classified.\n\n`;

for (const [groupName, groupHotels] of Object.entries(groups)) {
  if (groupHotels.length === 0) continue;
  md += `## ${groupName}\n\n`;
  groupHotels.forEach(h => {
    const tags = h.tags ? h.tags.join(', ') : 'None';
    md += `### ${h.name}\n`;
    md += `- **Location:** ${h.location} (${h.region || ''})\n`;
    md += `- **Vibe / Mood / Backdrop:** ${tags}\n`;
    md += `- **Who is it for:** ${h.who || 'Anyone'}\n`;
    md += `\n`;
  });
}

fs.writeFileSync('/Users/rasmussjoborg/.gemini/antigravity/brain/ba4435ea-a150-4682-859d-048ae747bc2f/hotel_soundscape_mapping.md', md);
console.log("Done");
