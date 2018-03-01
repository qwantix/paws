'use strict';

const pricing = require('../pricing');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  alias: 'redshift',
  commands: {
    regions: commands.regions,
    instanceTypes: commands.instanceTypes,
    quote: {
      params: {
        region: params.region,
        instanceType: params.instanceType,
        lease: params.lease,
        upfront: params.upfront,
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
        upfront,
        duration,
        qty
      }) {
        const products = pricing.getOfferProducts('AmazonRedshift', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';
        // Instance
        details.push(...products.eval(item =>
          item.attributes.instanceType === instanceType,
          billing, {
            Hrs: duration,
            Quantity: qty,
            lease,
            upfront
          }));

        return {
          lease,
          details
        };
      }
    }
  }

};