'use strict';

const colors = require('colors');

module.exports = {
  error(...args) {
    console.error('\n', ...args.map(v => colors.bold.red(v)));
    console.error();
  },
  fatal(...args) {
    console.error('\n', ...args.map(v => colors.bold.red(v)));
    console.error();
    process.exit(1);
  },
  warn(...args) {
    console.warn(...args.map(v => colors.yellow(v)));
  }
}