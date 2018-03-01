'use strict';

const colors = require('colors');

module.exports = {
  quote: {
    pretty(out) {
      const styles = {
        h1: colors.bold.white,
        h1_2: colors.italic.white,
        h2: colors.underline.white,
        itemDesc: colors.italic,
        totalLabel: colors.bold
      }

      const tick = colors.dim('└─')

      if (out.label) {
        let label = styles.h1(`${out.label}/`);
        if (out.subLabel) {
          label += ' ' + styles.h1_2(out.subLabel);
        }
        console.log(label)
        console.log(colors.grey('──────────────────────────────────'))
      }
      const ind = out.label ? ' ' : '';

      const monthlyFees = out.details.filter(item => !item.fee);
      const initialFees = out.details.filter(item => item.fee);

      // Details
      if (!('showDetails' in out) || out.showDetails) {
        console.log(styles.h2(`Monthly fees:`));
        monthlyFees.forEach(item => {
          //console.log(item)
          console.log(`${ind} `, styles.itemDesc(item.description))
          console.log(`${ind}   ${tick} `, `${colors.green(item.pu)} ${colors.dim(item.currency)} * ${colors.magenta.bold(item.qty)} ${colors.italic.dim('(' + item.unit + ')')} = ${colors.green.bold(item.total.toFixed(3))} ${colors.dim(item.currency)}`)
        });
        if (initialFees.length) {
          console.log(styles.h2(`\nOne-time initial fees:`));
          initialFees.forEach(item => {
            //console.log(item)
            console.log(`${ind} `, styles.itemDesc(item.description))
            console.log(`${ind}   ${tick} `, `${colors.cyan(item.total.toFixed(3))} ${colors.dim(item.currency)}`)
          });
        }
      }
      // Summary
      console.log(styles.h2(`\nTotal:`));
      const total = monthlyFees.filter(item => !item.fee).reduce((a, b) => a + b.total, 0);
      const fee = initialFees.reduce((a, b) => a + b.total, 0);
      const monthlySmoothedFee = initialFees.map(item => {
        const lease = parseInt(item.lease);
        return !isNaN(lease) ? item.total / (lease * 12) : 0;
      }).reduce((a, b) => a + b, 0);
      console.log('')
      console.log(`${ind}${tick} ${styles.totalLabel('Total Monthly:')} $${colors.bold.green(total.toFixed(2))} ${colors.dim('/month')}`);

      if (fee) {
        console.log(`${ind}${tick} ${styles.totalLabel('Initial Fee:')} $${colors.bold.cyan(fee.toFixed(2))}`);
        if (monthlySmoothedFee) {
          console.log(`${ind}${tick} ${styles.totalLabel('Smoothed monthly:')} $${colors.bold.yellow((monthlySmoothedFee + total).toFixed(2))} ${colors.dim('/month')}`);
        }
      }
      console.log('');
    }
  },
  list: {
    pretty(out, {
      title,
      sort
    }) {
      console.log('');
      console.log(title + ':\n');
      out.sort(sort).forEach(r => {
        console.log(' - ', colors.bold.white(r))
      })
      console.log('');
    }

  }
};