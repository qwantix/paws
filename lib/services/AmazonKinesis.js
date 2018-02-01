'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  alias: 'kinesis',

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
        },
        shards: {
          required: false,
          type: 'count',
          default: 1,
          description: 'Num shards'
        },
        duration: {
          description: 'Monthly duration',
          short: 'd',
          type: ['duration', 'h'],
          default: 730
        },
        extraRetain: {
          description: 'Extra retain duration',
          short: 'h',
          type: ['duration', 'h'],
          default: 0
        },
      },
      handler({ region, putSize, duration, putCount, shards, extraRetain }) {
        const products = pricing.getOfferProducts('AmazonKinesis', region);
        const details = [];

        const putUnit = Math.ceil(putSize / 25);
        const billedPut = putUnit * putCount;

        extraRetain = Math.min(7 * 24, extraRetain);

        details.push(...products.eval(
          item => item.attributes.group === 'Payload Units', 'OnDemand',
          { PutRequest: billedPut / 1000000 }));
        details.push(...products.eval(
          item => item.attributes.group === 'Provisioned shard hour', 'OnDemand',
          { ShardHour: shards * duration }));
        details.push(...products.eval(
          item => item.attributes.group === 'Addon shard hour', 'OnDemand',
          { ShardHour: shards * extraRetain }));

        return {
          details
        };
      }
    }
  }

};

