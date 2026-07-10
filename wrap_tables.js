const fs = require('fs');
const path = require('path');

const glob = function(dir, res = []) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) glob(p, res);
    else if (p.endsWith('.jsx')) res.push(p);
  });
  return res;
};

const files = glob('d:/Endeavor/frontend/src/admin');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('<table className="admin-table">') && !content.includes('<div className="admin-table-container">')) {
    content = content.replace(/<table className="admin-table">/g, '<div className="admin-table-container">\n            <table className="admin-table">');
    content = content.replace(/<\/table>/g, '</table>\n          </div>');
    fs.writeFileSync(f, content);
    console.log('Wrapped tables in ' + f);
  }
});
