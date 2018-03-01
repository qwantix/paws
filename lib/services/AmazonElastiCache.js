'use strict';

const pricing = require('../pricing');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  alias: 'cache',

  commands: {
    regions: commands.regions,
    instanceTypes: commands.instanceTypes,
    quote: {
      params: {
        region: params.region,
        instanceType: params.instanceType,
        lease: params.lease,
        duration: {
          description: 'Monthly duration',
          short: 'd',
          type: ['duration', 'h'],
          default: 730
        },
        qty: {
          description: 'Num instances',
          type: 'count',
          default: 1
        }
      },
      handler({
        region,
        instanceType,
        lease,
        duration,
        qty
      }) {
        const products = pricing.getOfferProducts('AmazonElastiCache', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';
        // Instance
        details.push(...products.eval(item =>
          item.attributes.instanceType === instanceType,
          billing, {
            Hrs: duration * qty,
            Quantity: qty,
            lease
          }));

        return {
          lease,
          details
        };
      }
    }
  }

};