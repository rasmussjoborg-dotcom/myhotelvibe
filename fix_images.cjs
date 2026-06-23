const fs = require('fs');

let content = fs.readFileSync('./src/data.ts', 'utf8');

const imageVars = [
  'audoForestImage',
  'ettHemImage',
  'hotelArcticImage',
  'manshausenIslandImage',
  'theRetreatImage',
  'villaCopenhagenImage',
  'treehotelImage',
  'mallorcaFamilyResortImage',
  'romePalazzoImage',
  'greekIslandHideawayImage',
  'lisbonDesignHouseImage',
  'tuscanyVineyardRetreatImage',
  'villaValsImage'
];

let i = 0;
content = content.replace(/"https:\/\/images\.unsplash\.com[^"]+"/g, () => {
  const replacement = imageVars[i % imageVars.length];
  i++;
  return replacement;
});

fs.writeFileSync('./src/data.ts', content, 'utf8');
console.log('Fixed images!');
