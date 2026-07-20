const fs = require('fs');
const path = require('path');

const dirs = ['d:/Endeavor/frontend/src/admin/pages', 'd:/Endeavor/frontend/src/admin'];

dirs.forEach(dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.jsx')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes('useAdminDialog') && !content.includes('import { useAdminDialog }')) {
        const importPath = dir.includes('pages') ? '../components/AdminDialogContext' : './components/AdminDialogContext';
        const importStatement = `import { useAdminDialog } from '${importPath}';\n`;
        
        content = importStatement + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Prepended import in', file);
      }
    }
  });
});
