'use strict';

const fs = require('fs');

fs.readdirSync(__dirname).forEach((name) => {
  if (name === 'index.js') return;
  exports[name.replace(/\.js$/, '')] = require('./' + name);
});
