'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  alias: 'firehose',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        putSize: {
          required: true,
          type: ['bytes', 'k'],
          description: 'Put size'
        },
        putCount: {
          required: true,
          type: 'count',
          description: 'Put count'
        }
      },
      handler({ region, putSize, putCount }) {
        const products = pricing.getOfferProducts('AmazonKinesisFirehose', region);
        const details = [];

        const unit = 5;
        putSize = Math.ceil(putSize / unit) * unit;
        const billedPut = putSize * putCount;

        details.push(...products.eval(
          item => item.attributes.group === 'Event-by-Event Processing', 'OnDemand',
          { GB: util.parseBytes(billedPut + 'k', 'Gb') }));

        return {
          details
        };
      }
    }
  }

};

