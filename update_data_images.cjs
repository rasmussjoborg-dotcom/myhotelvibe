const fs = require('fs');

let content = fs.readFileSync('./src/data.ts', 'utf8');

const newImports = `
import palacioAndaluzImage from './assets/stays/palacio-andaluz.png';
import azoresEcoLodgeImage from './assets/stays/azores-eco-lodge.png';
import londonShardSuitesImage from './assets/stays/london-shard-suites.png';
import algarveFamilyResortImage from './assets/stays/algarve-family-resort.png';
import lakeComoVillaImage from './assets/stays/lake-como-villa.png';
import bardenasDesertCampImage from './assets/stays/bardenas-desert-camp.png';
import parisBoutiqueSuiteImage from './assets/stays/paris-boutique-suite.png';
import douroValleyWineImage from './assets/stays/douro-valley-wine.png';
import amalfiCliffsideImage from './assets/stays/amalfi-cliffside.png';
import scottishHighlandsLodgeImage from './assets/stays/scottish-highlands-lodge.png';
import bavarianAlpsRetreatImage from './assets/stays/bavarian-alps-retreat.png';
import corsicanBeachHideawayImage from './assets/stays/corsican-beach-hideaway.png';
import transylvanianCastleStayImage from './assets/stays/transylvanian-castle-stay.png';
import dalmatianCoastResortImage from './assets/stays/dalmatian-coast-resort.png';
`;

// Insert the new imports right after the last import in data.ts
content = content.replace(/import villaValsImage from '\.\/assets\/stays\/villa-vals\.png';/, "import villaValsImage from './assets/stays/villa-vals.png';" + newImports);

// Now replace the image variables in the INITIAL_STAYS array
// We'll parse the array or just replace the specific image properties.
// Since we used a repeating sequence of old images earlier (audoForestImage, ettHemImage, etc.) 
// we will just find the objects by their 'id' and replace the 'image: XXXX,' line.

const imageMap = {
  'palacio-andaluz': 'palacioAndaluzImage',
  'azores-eco-lodge': 'azoresEcoLodgeImage',
  'london-shard-suites': 'londonShardSuitesImage',
  'algarve-family-resort': 'algarveFamilyResortImage',
  'lake-como-villa': 'lakeComoVillaImage',
  'bardenas-desert-camp': 'bardenasDesertCampImage',
  'paris-boutique-suite': 'parisBoutiqueSuiteImage',
  'douro-valley-wine': 'douroValleyWineImage',
  'amalfi-cliffside': 'amalfiCliffsideImage',
  'scottish-highlands-lodge': 'scottishHighlandsLodgeImage',
  'bavarian-alps-retreat': 'bavarianAlpsRetreatImage',
  'corsican-beach-hideaway': 'corsicanBeachHideawayImage',
  'transylvanian-castle-stay': 'transylvanianCastleStayImage',
  'dalmatian-coast-resort': 'dalmatianCoastResortImage',
};

// Simple string replacement using regex that looks for the id and replaces the image
Object.keys(imageMap).forEach(id => {
  const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?image:\\s*)[a-zA-Z]+(,)`, 'm');
  content = content.replace(regex, `$1${imageMap[id]}$2`);
});

fs.writeFileSync('./src/data.ts', content, 'utf8');
console.log('Updated data.ts images!');
