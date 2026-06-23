const fs = require('fs');
let code = fs.readFileSync('src/components/BriefStickyBar.tsx', 'utf8');

// Fix the bad container styling at 540
code = code.replace(
`                className={cn(
                  "bg-white border",
                  isStuck ? "rounded-full md:rounded-lg" : "rounded-xl",
                  'flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 pb-1 md:pb-0 md:px-0 md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-1 w-full'
                )}`,
`                className={cn(
                  'min-w-0 flex-1',
                  isStuck 
                    ? 'flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 pb-1 md:pb-0 md:px-0 md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-1 w-full'
                    : 'grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2'
                )}`
);

// Fix the clear button
code = code.replace(
`                  "bg-white border",
                  isStuck ? "rounded-lg" : "rounded-xl",`,
`                  "bg-white border",
                  isStuck ? "rounded-full md:rounded-lg" : "rounded-xl",`
);

fs.writeFileSync('src/components/BriefStickyBar.tsx', code);
