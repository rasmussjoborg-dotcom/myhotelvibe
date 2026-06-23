import fs from 'fs';

// Quick hack to parse data.ts by removing imports and evaluating it
let dataTs = fs.readFileSync('src/data.ts', 'utf8');

// remove imports
dataTs = dataTs.replace(/import\s+.*?;/g, '');
// remove type annotations
dataTs = dataTs.replace(/:\s*Stay\[\]\s*=/g, '=');

// We need to inject dummy variables for the image variables so it evals cleanly
const imageVars = [
  'audoForestImage', 'ettHemImage', 'greekIslandHideawayImage', 'hotelArcticImage',
  'lisbonDesignHouseImage', 'mallorcaFamilyResortImage', 'manshausenIslandImage',
  'romePalazzoImage', 'theRetreatImage', 'treehotelImage', 'tuscanyVineyardRetreatImage',
  'villaCopenhagenImage', 'villaValsImage', 'palacioAndaluzImage', 'azoresEcoLodgeImage',
  'londonShardSuitesImage', 'algarveFamilyResortImage', 'lakeComoVillaImage',
  'bardenasDesertCampImage', 'parisBoutiqueSuiteImage', 'douroValleyWineImage',
  'amalfiCliffsideImage', 'scottishHighlandsLodgeImage', 'bavarianAlpsRetreatImage',
  'corsicanBeachHideawayImage', 'transylvanianCastleStayImage', 'dalmatianCoastResortImage',
  'costaRicaJungleLodgeImage', 'marrakechRiadImage', 'rivieraMayaFamilyResortImage',
  'tokyoSkylineRyokanImage',
];

const varDeclarations = imageVars.map(v => `const ${v} = '${v.replace('Image', '')}';`).join('\n');

const evalScript = `
${varDeclarations}

${dataTs.replace(/export const/g, 'const')}

// Dump to JSON
console.log(JSON.stringify(INITIAL_STAYS));
`;

fs.writeFileSync('temp_eval.js', evalScript);
