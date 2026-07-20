const fs = require('fs');
const path = require('path');

const dir = 'd:/Endeavor/frontend/src/admin/pages';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes("from './components/AdminDialogContext'")) {
      content = content.replace("from './components/AdminDialogContext'", "from '../components/AdminDialogContext'");
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed import in', file);
    }
  }
});
