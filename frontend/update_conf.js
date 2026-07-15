const fs = require('fs');
let code = fs.readFileSync('d:/Endeavor/frontend/src/admin/pages/ConferenceManager.jsx', 'utf8');

code = code.replace(
  /scientificSessions: \[\], pricingTiers: \[\],/g,
  'scientificSessions: [], pricingTiers: [], showCommittee: true,'
);

code = code.replace(
  /const handleEditConf = \(conf\) => \{/,
  const handleEditConf = (conf) => {
    setFormData({
      ...conf,
      tittle: conf.tittle || conf.title || '',
      startDate: conf.startDate ? new Date(conf.startDate).toISOString().split('T')[0] : '',
      endDate: conf.endDate ? new Date(conf.endDate).toISOString().split('T')[0] : '',
      year: conf.year || new Date().getFullYear(),
      seriesId: conf.series ? conf.series.id : '',
      showCommittee: conf.showCommittee !== false
    });
    setEditingConf(conf);
    setShowModal(true);
    setStep(1);
    setImportantDates(conf.importantDates || []);
  }
);

// We should check how handleEditConf was originally implemented to not break it.
