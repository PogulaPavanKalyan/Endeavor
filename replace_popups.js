const fs = require('fs');
const path = require('path');

const directories = [
  'd:/Endeavor/frontend/src/admin',
  'd:/Endeavor/frontend/src/admin/pages'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  if (!content.includes('window.confirm') && !content.includes('alert(')) {
    return; // No need to process
  }
  
  // Skip Context/Layout files that don't need this specific hook usage
  if (filePath.endsWith('AdminLayout.jsx') || filePath.endsWith('AdminDialogContext.jsx') || filePath.endsWith('AdminContext.jsx') || filePath.endsWith('ConferenceAdminLayout.jsx')) return;
  
  console.log('Processing:', filePath);

  // 1. Add import
  const importDepth = filePath.includes('/pages/') ? '../../' : '../';
  const importStatement = `import { useAdminDialog } from '${filePath.includes('/pages/') ? '../' : './'}components/AdminDialogContext';\n`;
  if (!content.includes('useAdminDialog')) {
    content = content.replace(/(import React.*?;\n)/, `$1${importStatement}`);
  }
  
  // 2. Add hook inside the component
  // Find the component function declaration: const ComponentName = () => { or export default function ComponentName() {
  // We'll use a regex to find it and inject the hook.
  const componentRegex = /((?:const\s+\w+\s*=\s*(?:\([^)]*\))?\s*=>\s*{)|(?:export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{))/;
  const match = content.match(componentRegex);
  
  if (match && !content.includes('const { confirmDialog, alertDialog } = useAdminDialog();')) {
    content = content.replace(componentRegex, `$1\n  const { confirmDialog, alertDialog } = useAdminDialog();\n`);
  }
  
  // 3. Replace window.confirm
  content = content.replace(/!\s*window\.confirm\((.*?)\)/g, '!(await confirmDialog($1))');
  content = content.replace(/window\.confirm\((.*?)\)/g, '(await confirmDialog($1))');
  
  // 4. Replace alert
  // Careful not to replace alert if it's imported or something, but usually it's just alert(...)
  content = content.replace(/\balert\((.*?)\)/g, 'await alertDialog($1)');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

directories.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      processFile(path.join(dir, file));
    }
  });
});
