const fs = require('fs');
const glob = require('glob'); // use standard fs if glob not installed
const { execSync } = require('child_process');

// Find all ts/tsx files
const files = execSync('find src -type f -name "*.ts" -o -name "*.tsx"').toString().split('\n').filter(Boolean);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Type definitions
  content = content.replace(/travelers: '' \| 'Couple' \| 'Family' \| 'Solo' \| 'Friends';/g, "budget: '' | 'Save it for the wine' | 'The sweet spot' | 'Make it rain';");
  
  // Properties and variables
  content = content.replace(/\.travelers/g, '.budget');
  content = content.replace(/travelers:/g, 'budget:');
  content = content.replace(/Preferences\['travelers'\]/g, "Preferences['budget']");
  
  // Options arrays
  content = content.replace(/WHO_OPTIONS/g, 'BUDGET_OPTIONS');
  
  // String replacements specific to who/budget
  content = content.replace(/whoPrefix/g, 'budgetPrefix');
  content = content.replace(/whoLabel/g, 'budgetLabel');
  content = content.replace(/updateWho/g, 'updateBudget');
  
  // Update PromptBuilder rendering
  // This might be easier manually for PromptBuilder
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated ' + file);
  }
}
