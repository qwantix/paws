'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AWSLambda',
  alias: 'lambda',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        size: {
          short: 's',
          type: 'count',
          required: true,
          description: 'Size',
          default: '128'
        },
        invocations: {
          short: 'i',
          required: true,
          type: 'count',
          default: 1,
          description: 'Num invocations'
        },
        duration: {
          short: 'd',
          required: true,
          type: ['duration', 's'],
          default: 1,
          description: 'Average duration (s)'
        }
      },
      handler({ region, size, invocations, duration }) {
        const products = pricing.getOfferProducts('AWSLambda', region);
        const details = [];
        const totalDuration = Math.ceil(invocations * duration);
        const gbs = size / 1024;

        details.push(...products.eval(item =>
          item.attributes.group === 'AWS-Lambda-Requests' &&
          item.attributes.location !== 'Any',
          'OnDemand', { Requests: invocations }));


        details.push(...products.eval(item =>
          item.attributes.group === 'AWS-Lambda-Duration' &&
          item.attributes.location !== 'Any',
          'OnDemand', { Second: totalDuration * gbs }));

        return {
          details
        };
      }
    }
  }

};

