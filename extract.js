const fs = require('fs');
const lines = fs.readFileSync('/Users/rasmussjoborg/.gemini/antigravity/brain/ba4435ea-a150-4682-859d-048ae747bc2f/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (!line) continue;
  const obj = JSON.parse(line);
  if (obj.type === 'VIEW_FILE' && obj.content && obj.content.includes('BriefStickyBar.tsx')) {
    console.log(obj.content);
  }
}
