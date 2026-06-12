const fs = require('fs');
const pages = ['SessionManager','RegistrationManager','AbstractManager','ContactManager','BrochureManager','SponsorManager','HeroManager','StatisticsManager','TrustBadgeManager','SettingsManager'];

pages.forEach(name => {
  const content = `import React from 'react';\n\nconst ${name} = () => (\n  <div className="admin-page">\n    <div className="admin-page-header">\n      <h2>${name}</h2>\n    </div>\n    <div className="admin-card">\n      <p>Module coming soon.</p>\n    </div>\n  </div>\n);\n\nexport default ${name};\n`;
  fs.writeFileSync(`d:/ed/one/endeavor/src/admin/pages/${name}.jsx`, content);
});
