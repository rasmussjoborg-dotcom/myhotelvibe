const fs = require('fs');
let content = fs.readFileSync('src/components/BriefStickyBar.tsx', 'utf-8');

// 1. Remove accentTheme prop from BriefChip
content = content.replace(/    compact\?:\s*boolean;\n    accentTheme\?:\s*'primary' \| 'secondary' \| 'accent' \| 'muted';\n  }\n>\(function BriefChip\(\{ label, value, icon, selectedIcon, filled = false, mutedValue = false, compact = false, accentTheme = 'primary', className, \.\.\.props \}, ref\) \{/g, `    compact?: boolean;\n  }\n>(function BriefChip({ label, value, icon, selectedIcon, filled = false, mutedValue = false, compact = false, className, ...props }, ref) {`);

// 2. Remove color objects from BriefChip
content = content.replace(/  const borderClasses = \{[\s\S]*?  const mdBorderClasses = \{[\s\S]*?  const textClasses = \{[\s\S]*?\};\n/g, '');

// 3. Revert BriefChip classes
content = content.replace(/filled && !compact \? `\$\{borderClasses\[accentTheme\]\} pr-10` : '',\n        filled && compact \? `\$\{mdBorderClasses\[accentTheme\]\} md:pr-10` : '',/g, `filled && !compact ? 'border-primary pr-10' : '',\n        filled && compact ? 'md:border-primary md:pr-10' : '',`);

// 4. Revert icon text classes in BriefChip
content = content.replace(/span className=\{cn\("shrink-0 \[\&>svg\]:w-\[16px\] \[\&>svg\]:h-\[16px\]", filled \? textClasses\[accentTheme\] : "text-foreground"\)\}/g, `span className={cn("shrink-0 [&>svg]:w-[16px] [&>svg]:h-[16px]", filled ? "text-primary" : "text-foreground")}`);
content = content.replace(/span className=\{cn\("absolute right-3.5 top-1\/2 -translate-y-1\/2 shrink-0 \[\&>svg\]:h-\[16px\] \[\&>svg\]:w-\[16px\]", textClasses\[accentTheme\]\)\}/g, `span className="absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0 text-primary [&>svg]:h-[16px] [&>svg]:w-[16px]"`);

// 5. Fix FilterMenu declaration
content = content.replace(/function FilterMenu\(\{ \n  children, \n  trigger, \n  title,\n  label,\n  description,\n  sideOffset = 24,\n  align = 'start',\n  accentTheme = 'primary'\n\}: \{\n  trigger, \n  title,\n  label,\n  description,\n  sideOffset = 24,\n  align = 'start'\n\}: \{ \n  children: React\.ReactNode; \n  trigger: React\.ReactNode; \n  title: string;\n  label\?: string;\n  description\?: string;\n  sideOffset\?: number;\n  align\?: 'start' \| 'center' \| 'end';\n  accentTheme\?: 'primary' \| 'secondary' \| 'accent' \| 'muted';\n\}\)/g, 
`function FilterMenu({ 
  children, 
  trigger, 
  title,
  label,
  description,
  sideOffset = 24,
  align = 'start'
}: { 
  children: React.ReactNode; 
  trigger: React.ReactNode; 
  title: string;
  label?: string;
  description?: string;
  sideOffset?: number;
  align?: 'start' | 'center' | 'end';
})`);

// 6. Fix FilterMenu popover content
content = content.replace(/\{label && <span className=\{cn\("sf-kicker block mb-1.5 uppercase", accentTheme === 'secondary' \? 'text-secondary-foreground' : accentTheme === 'accent' \? 'text-accent' : accentTheme === 'muted' \? 'text-foreground' : 'text-primary'\)\}>\{label\}<\/span>\}/g, `{label && <span className="sf-kicker block text-primary mb-1.5 uppercase">{label}</span>}`);
content = content.replace(/className=\{cn\("w-\[min\(520px,calc\(100vw-2rem\)\)\] rounded-xl bg-white border p-3.5", accentTheme === 'secondary' \? 'border-secondary' : accentTheme === 'accent' \? 'border-accent' : accentTheme === 'muted' \? 'border-muted' : 'border-primary'\)\}/g, `className="w-[min(520px,calc(100vw-2rem))] rounded-xl bg-white border border-primary p-3.5"`);
content = content.replace(/\{label && <span className=\{cn\("sf-kicker block mb-0.5 uppercase", accentTheme === 'secondary' \? 'text-secondary-foreground' : accentTheme === 'accent' \? 'text-accent' : accentTheme === 'muted' \? 'text-foreground' : 'text-primary'\)\}>\{label\}<\/span>\}/g, `{label && <span className="sf-kicker block text-primary mb-0.5 uppercase">{label}</span>}`);

// 7. Fix ChoicePills & MultiChoicePills definition and getAccentStyles
content = content.replace(/function ChoicePills\(\{\n  options,\n  value,\n  onSelect,\n  onClose,\n  accentTheme = 'primary',\n\}: \{\n  options: ReadonlyArray<ChoiceOption>;\n  value: string;\n  onSelect: \(next: string\) => void;\n  onClose\?: \(\) => void;\n  accentTheme\?: 'primary' \| 'secondary' \| 'accent' \| 'muted';\n\}\) \{\n  const isMobile = useMediaQuery\("\(max-width: 768px\)"\);\n\n  const getAccentStyles = [\s\S]*?const getTextStylesMobile = [\s\S]*?;\n\n  if/g, 
`function ChoicePills({
  options,
  value,
  onSelect,
  onClose,
}: {
  options: ReadonlyArray<ChoiceOption>;
  value: string;
  onSelect: (next: string) => void;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if`);

content = content.replace(/function MultiChoicePills\(\{\n  options,\n  value,\n  onSelect,\n  onClose,\n  accentTheme = 'primary',\n\}: \{\n  options: ReadonlyArray<ChoiceOption>;\n  value: string\[\];\n  onSelect: \(next: string\[\]\) => void;\n  onClose\?: \(\) => void;\n  accentTheme\?: 'primary' \| 'secondary' \| 'accent' \| 'muted';\n\}\) \{\n  const isMobile = useMediaQuery\("\(max-width: 768px\)"\);\n\n  const getAccentStyles = [\s\S]*?const getTextStylesMobile = [\s\S]*?;\n\n  if/g, 
`function MultiChoicePills({
  options,
  value,
  onSelect,
  onClose,
}: {
  options: ReadonlyArray<ChoiceOption>;
  value: string[];
  onSelect: (next: string[]) => void;
  onClose?: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if`);

// 8. Revert ChoicePills / MultiChoicePills mobile return
content = content.replace(/className=\{cn\(\n                'flex w-full items-center gap-3 border-b border-border\/50 py-4 text-\[14px\] font-medium transition-all duration-200 ease-out last:border-0 hover:bg-muted\/30 active:bg-muted\/50',\n                getTextStylesMobile\(selected\)\n              \)\}\n            >\n              \{opt.icon \? <span className=\{selected \? getTextStylesMobile\(selected\) : 'text-muted-foreground'\}>\{opt.icon\}<\/span> : null\}\n              <span className="flex-1 text-left font-semibold">\{opt.label\}<\/span>\n              \{selected && <Check className=\{cn\("h-5 w-5", getTextStylesMobile\(true\)\)\} \/>\}/g, 
`className={cn(
                'flex w-full items-center gap-3 border-b border-border/50 py-4 text-[14px] font-medium transition-all duration-200 ease-out last:border-0',
                selected
                  ? 'text-primary'
                  : 'text-foreground hover:bg-muted/30 active:bg-muted/50',
              )}
            >
              {opt.icon ? <span className={selected ? 'text-primary' : 'text-muted-foreground'}>{opt.icon}</span> : null}
              <span className="flex-1 text-left font-semibold">{opt.label}</span>
              {selected && <Check className="h-5 w-5 text-primary" />}`);

// 9. Revert ChoicePills / MultiChoicePills desktop return
content = content.replace(/className=\{cn\(\n              'inline-flex items-center justify-center gap-2 border px-4 py-2 text-\[13px\] font-semibold transition-all duration-200 ease-out rounded-full',\n              getAccentStyles\(selected\)\n            \)\}\n          >\n            \{opt.icon \? <span className=\{getIconStyles\(selected\)\}>\{opt.icon\}<\/span> : null\}/g, 
`className={cn(
              'inline-flex items-center justify-center gap-2 border px-4 py-2 text-[13px] font-semibold transition-all duration-200 ease-out',
              'rounded-full',
              selected
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'bg-card border-border text-foreground hover:border-primary/50 active:border-primary active:ring-1 active:ring-primary/30 active:bg-primary/5',
            )}
          >
            {opt.icon ? <span className={selected ? 'text-white' : 'text-primary'}>{opt.icon}</span> : null}`);

// 10. Revert BriefStickyBar accentTheme props
content = content.replace(/accentTheme="accent"/g, '');
content = content.replace(/accentTheme="secondary"/g, '');
content = content.replace(/accentTheme="muted"/g, '');

fs.writeFileSync('src/components/BriefStickyBar.tsx', content);
