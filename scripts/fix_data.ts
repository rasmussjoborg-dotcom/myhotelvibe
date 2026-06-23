import fs from 'fs';

let file = fs.readFileSync('src/data.ts', 'utf-8');

const injectedBlock = `\n    surroundings: 'Located in the heart of the region. Close to local amenities but maintains a private feel.',\n    timeZone: 'Local Time',\n    bookingWindow: 'Typically fully booked 2-3 months in advance during peak seasons. We recommend securing your dates early.',`;

// Remove the injected blocks
file = file.split(injectedBlock).join('');

// Now properly add them after the tradeoff line. 
// A tradeoff line looks like: tradeoff: 'some string',
// We can match tradeoff: '.*?',
file = file.replace(/(tradeoff:\s*'.*?',)/g, (match) => {
  return `${match}\n    surroundings: 'Located in the heart of the region. Close to local amenities but maintains a private feel.',\n    timeZone: 'Local Time',\n    bookingWindow: 'Typically fully booked 2-3 months in advance during peak seasons. We recommend securing your dates early.',`;
});

fs.writeFileSync('src/data.ts', file);
console.log('Fixed data.ts');
