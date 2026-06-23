import fs from 'fs';
import path from 'path';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/surface-variant/g, 'border');
  content = content.replace(/outline-variant/g, 'border');
  content = content.replace(/on-surface-variant/g, 'muted-foreground');
  content = content.replace(/on-surface/g, 'foreground');
  content = content.replace(/text-moss/g, 'text-secondary');
  content = content.replace(/bg-moss/g, 'bg-secondary');
  content = content.replace(/border-moss/g, 'border-secondary');
  content = content.replace(/ring-moss/g, 'ring-secondary');
  content = content.replace(/text-outline/g, 'text-muted-foreground\/70');
  content = content.replace(/bg-stone/g, 'bg-muted');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const dir = './src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => path.join(dir, f));
files.forEach(replaceInFile);
