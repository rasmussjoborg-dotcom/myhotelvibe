import fs from 'fs';

const file = fs.readFileSync('src/data.ts', 'utf-8');
const patched = file.replace(/tradeoff:\s*([^,]+),/g, (match, p1) => {
  return `${match}\n    surroundings: 'Located in the heart of the region. Close to local amenities but maintains a private feel.',\n    timeZone: 'Local Time',\n    bookingWindow: 'Typically fully booked 2-3 months in advance during peak seasons. We recommend securing your dates early.',`;
});
fs.writeFileSync('src/data.ts', patched);
console.log('Patched data.ts');
