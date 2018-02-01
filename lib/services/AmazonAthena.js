'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  alias: 'athena',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        volume: {
          required: true,
          type: ['bytes', 'Tb'],
          description: 'Query size'
        },
        qty: {
          short: 'n',
          required: false,
          type: 'count',
          default: 1,
          description: 'Num queries'
        }
      },
      handler({ region, volume, qty }) {
        const products = pricing.getOfferProducts('AmazonAthena', region);
        const details = [];

        // Charged for total data scanned per query with a minimum 10MB for each successful or cancelled queries
        volume = Math.max(util.parseBytes('10Mb', 'Tb'), volume);

        details.push(...products.eval(
          item => item.attributes.servicecode === 'AmazonAthena',
          'OnDemand',
          { Terabytes: volume * qty }
        ));

        return {
          details
        };
      }
    }
  }
};

