const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector');
const fs = require('fs');

const css = fs.readFileSync('../bootstrap.min.css', 'utf8') + '\n' + fs.readFileSync('../old_style.css', 'utf8');

postcss().use(prefixer({
  prefix: '.legacy-registration-scope',
  exclude: ['body', 'html']
})).process(css, {from: undefined}).then(result => {
  fs.writeFileSync('./src/conferences/ConferenceRegisterLegacy.css', result.css);
  console.log('CSS scoped successfully');
});
