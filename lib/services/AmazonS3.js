'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AmazonS3',
  alias: 's3',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        volume: {
          required: true,
          type: ['bytes', 'Gb'],
          description: 'Query size'
        },
        storageClass: {
          values: ['standard', 'infrequent', 'glacier'],
          default: 'standard'
        }
      },
      handler({ region, volume, storageClass }) {
        const products = pricing.getOfferProducts('AmazonS3', region);
        const details = [];
        const map = { 'standard': 'General Purpose', 'infrequent': 'Infrequent Access', 'glacier': 'Archive' }
        // Charged for total data scanned per query with a minimum 10MB for each successful or cancelled queries
        volume = Math.max(util.parseBytes('10Mb', 'Tb'), volume);

        details.push(...products.eval(
          item => item.productFamily === 'Storage'
            && item.attributes.storageClass === map[storageClass],
          'OnDemand',
          { 'GB-Mo': volume }
        ));

        return {
          details
        };
      }
    }
  }
};

