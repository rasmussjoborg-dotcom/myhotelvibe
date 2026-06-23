const fs = require('fs');
const path = require('path');

const srcDir = '/Users/rasmussjoborg/.gemini/antigravity/brain/ba4435ea-a150-4682-859d-048ae747bc2f/';
const destDir = './src/assets/stays/';

const files = fs.readdirSync(srcDir);

const newImages = [
  'palacio_andaluz',
  'azores_eco_lodge',
  'london_shard_suites',
  'algarve_family_resort',
  'lake_como_villa',
  'bardenas_desert_camp',
  'paris_boutique_suite',
  'douro_valley_wine',
  'amalfi_cliffside',
  'scottish_highlands_lodge',
  'bavarian_alps_retreat',
  'corsican_beach_hideaway',
  'transylvanian_castle_stay',
  'dalmatian_coast_resort'
];

newImages.forEach(imgBase => {
  // Find the file that starts with imgBase and ends with .png
  const file = files.find(f => f.startsWith(imgBase) && f.endsWith('.png') && f.length > imgBase.length + 5);
  if (file) {
    const newName = imgBase.replace(/_/g, '-') + '.png';
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, newName));
    console.log(`Copied ${file} to ${newName}`);
  } else {
    console.log(`Could not find image for ${imgBase}`);
  }
});
