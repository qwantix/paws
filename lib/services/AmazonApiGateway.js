'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');
const outputs = require('../outputs');

module.exports = {
  name: 'AmazonApiGateway',
  alias: 'apigateway',
  commands: {
    regions: commands.regions,
    cacheSizes: {
      params: {
        region: params.region
      },
      handler({ region }) {
        const product = pricing.getOfferProducts('AmazonApiGateway', region);
        const set = new Set();
        product.get((item) => {
          if (item.attributes.cacheMemorySizeGb) {
            set.add(+item.attributes.cacheMemorySizeGb);
          }
        });
        return Array.from(set);
      },
      output : {
        pretty(out) {
          outputs.list.pretty(out, { title: 'Available cache sizes (Gb)', sort: (a, b) => a === b ? 0 : (a > b ? 1 : -1) });
        }
      }
    },
    quote: {
      params: {
        region: params.region,
        qty: {
          short: 'n',
          required: false,
          type: 'count',
          default: 1,
          description: 'Num http requests'
        },
        cacheSize: {
          description: 'Cache size'
        },
        duration: {
          description: 'Cache duration',
          short: 'd',
          type: ['duration', 'h'],
          default: 730
        }
      },
      handler({ region, qty, cacheSize, duration }) {
        const products = pricing.getOfferProducts('AmazonApiGateway', region);
        const details = [];

        const filter = item => item.productFamily === 'API Calls';
        const product = products.get(filter);
        details.push(...products.eval(
          filter,
          'OnDemand',
          { [product.attributes.usagetype]: qty }
        ));

        if (cacheSize) {
          details.push(...products.eval(item =>
            item.productFamily === 'Amazon API Gateway Cache'
            && item.attributes.cacheMemorySizeGb === String(cacheSize),
            'OnDemand', { 'Hrs': duration }));
        }

        return {
          details
        };
      }
    }
  }
};

