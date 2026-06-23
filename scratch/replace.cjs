const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -type f -name "*.ts" -o -name "*.tsx"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/\.travelers/g, '.budget');
  content = content.replace(/travelers:/g, 'budget:');
  content = content.replace(/Preferences\['travelers'\]/g, "Preferences['budget']");
  
  content = content.replace(/WHO_OPTIONS/g, 'BUDGET_OPTIONS');
  
  content = content.replace(/whoPrefix/g, 'budgetPrefix');
  content = content.replace(/whoLabel/g, 'budgetLabel');
  content = content.replace(/updateWho/g, 'updateBudget');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
