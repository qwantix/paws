'use strict';

const colors = require('colors');

module.exports = {
  quote: {
    pretty(out) {
      if (out.label) {
        let label = colors.bold.white(out.label);
        if (out.subLabel) {
          label += ' ' + colors.italic.white(out.subLabel);
        }
        console.log(label)
        console.log(colors.grey('──────────────────────────────────'))
      }
      const ind = out.label ? '  ' : '';
      const total = out.details.filter(item => !item.fee).reduce((a, b) => a + b.total, 0);
      const fee = out.details.filter(item => item.fee).reduce((a, b) => a + b.total, 0);
      const monthlyFee = out.details.filter(item => item.fee).map(item => {
        const lease = parseInt(item.lease);
        return !isNaN(lease) ? item.total / (lease * 12) : 0;
      }).reduce((a, b) => a + b, 0);
      console.log(`${ind}» Total Monthly: $${colors.green(total.toFixed(2))}/month`);

      if (fee) {
        console.log(`${ind}» Initial Fee: $${colors.cyan(fee.toFixed(2))}`);
        if (monthlyFee) {
          console.log(`${ind}» Smoothed monthly: $${colors.yellow((monthlyFee + total).toFixed(2))}/month`);
        }
      }
      console.log('');
    }
  },
  list: {
    pretty(out, { title, sort }) {
      console.log('');
      console.log(title + ':\n');
      out.sort(sort).forEach(r => {
        console.log(' - ', colors.bold.white(r))
      })
      console.log('');
    }

  }
};