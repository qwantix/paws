'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AmazonRDS',
  alias: 'rds',
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
        az: params.az,
        engine: {
          required: true,
          description: 'AZ',
          value: ['MariaDB', 'Oracle', 'MySQL', 'SQL Server', 'PostgreSQL'],
          default: null
        },
        qty: {
          description: 'Num instances',
          type: 'count',
          default: 1
        },
        storage: {
          description: 'Storage',
          required: true,
          type: ['bytes', 'Go'],
        }
      },
      handler({ region, instanceType, lease, upfront, duration, az, engine, storage, qty }) {
        const products = pricing.getOfferProducts('AmazonRDS', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';

        // Instance
        details.push(...products.eval(item =>
          item.attributes.instanceType === instanceType
          && item.attributes.databaseEngine === engine
          && item.attributes.deploymentOption.startsWith(az !== 'single' ? 'Multi-AZ' : 'Single-AZ'),
          billing, { Hrs: duration, Quantity: qty, lease, upfront }));


        // Storage
        details.push(...products.eval(item =>
          item.productFamily === 'Database Storage'
          && (item.attributes.databaseEngine === engine || item.attributes.databaseEngine === 'Any')
          && item.attributes.deploymentOption.startsWith(az !== 'single' ? 'Multi-AZ' : 'Single-AZ'),
          billing, { 'GB-Mo': storage }));

        return {
          lease,
          details
        };
      }
    }
  }

};
