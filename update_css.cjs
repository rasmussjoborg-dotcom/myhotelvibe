const fs = require('fs');

let css = fs.readFileSync('./src/index.css', 'utf8');

const newBrandTokens = `
  /* Brand (StayFirst) */
  --color-sf-surface: var(--background);
  --color-sf-rose: var(--sf-apricot);
  --color-sf-lilac: var(--sf-parchment);
  --color-sf-mint: var(--sf-olive);
  --color-evergreen: #032517;
  --color-olive: #6B8F71;
  --color-apricot: #F6D8AE;
  --color-carbon: #1E1C1A;
  --color-parchment: #F6F4F0;
  --color-moss: #1B3B2B;
  --color-stone: #F1EEE7;
  --color-cream: #F6F4F0;
  --color-charcoal: #1E1C1A;
  --color-ink: #1E1C1A;
  --color-terracotta: #D45D3D;
`;

css = css.replace(/\/\* Brand \(StayFirst\) \*\/[\s\S]*?--color-terracotta: #D45D3D;/, newBrandTokens.trim());

const newShadcnTokens = `
  /* shadcn semantic tokens */
  /* Stitch editorial canvas: warm paper, moss ink, stone surfaces */
  --background: #F6F4F0;
  --foreground: #1E1C1A;
  --card: #FFFFFF;
  --card-foreground: #1E1C1A;
  --popover: #FFFFFF;
  --popover-foreground: #1E1C1A;
  --primary: #032517;
  --primary-foreground: #FFFFFF;
  --secondary: #6B8F71;
  --secondary-foreground: #FFFFFF;
  --muted: #E8E5DF;
  --muted-foreground: #65645f;
  --accent: #F6D8AE;
  --accent-foreground: #1E1C1A;
  --destructive: #c52a3a;
  --border: #E8E5DF;
  --input: #E8E5DF;
  --ring: #032517;
  --chart-1: #032517;
  --chart-2: #6B8F71;
  --chart-3: #F6D8AE;
  --chart-4: #1E1C1A;
  --chart-5: #c52a3a;
  --radius: 0.75rem;
`;

css = css.replace(/\/\* shadcn semantic tokens \*\/[\s\S]*?--radius: 0.75rem;/, newShadcnTokens.trim());

const newAccents = `
  /* High-contrast identity accents */
  --sf-evergreen: #032517;
  --sf-olive: #6B8F71;
  --sf-apricot: #F6D8AE;
  --sf-carbon: #1E1C1A;
  --sf-parchment: #F6F4F0;
  
  /* Legacy High-contrast identity accents */
  --sf-crimson: #C52A3A;
  --sf-terracotta: #D45D3D;
  --sf-moss: #1B3B2B;
  --sf-stone: #F1EEE7;
  --sf-cream: #F6F4F0;
  --sf-grid: #E4E2DE;
`;

css = css.replace(/\/\* High-contrast identity accents \*\/[\s\S]*?--sf-grid: #E4E2DE;/, newAccents.trim());

fs.writeFileSync('./src/index.css', css, 'utf8');
console.log('index.css updated successfully.');
