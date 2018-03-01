'use strict';

const pricing = require('../pricing');
const params = require('../params');
const commands = require('../commands');
const outputs = require('../outputs');

module.exports = {
  alias: 'rds',
  commands: {
    regions: commands.regions,
    instanceTypes: commands.instanceTypes,
    engines: {
      params: {
        region: params.region
      },
      handler({
        region
      }) {
        const product = pricing.getOfferProducts('AmazonRDS', region);
        const set = new Set();
        product.get((item) => {
          if (item.attributes.databaseEngine) {
            set.add(item.attributes.databaseEngine);
          }
        });
        return Array.from(set);
      },
      output: {
        pretty(out) {
          outputs.list.pretty(out, {
            title: 'Available Database Engine'
          });
        }
      }
    },
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
          description: 'DB Engine',
          default: null,
          validator(v, service, {
            region
          }) {
            const list = service.exec('engines', {
              region
            });
            return ~list.indexOf(v);
          },
          info(service, {
            region
          }) {
            return `paws ${service.alias} engines  -r ${region}`;
          }
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
      handler({
        region,
        instanceType,
        lease,
        upfront,
        duration,
        az,
        engine,
        storage,
        qty
      }) {
        const products = pricing.getOfferProducts('AmazonRDS', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';

        // Instance
        details.push(...products.eval(item =>
          item.attributes.instanceType === instanceType &&
          item.attributes.databaseEngine === engine &&
          item.attributes.deploymentOption.startsWith(az !== 'single' ? 'Multi-AZ' : 'Single-AZ'),
          billing, {
            Hrs: duration,
            Quantity: qty,
            lease,
            upfront
          }));


        // Storage
        details.push(...products.eval(item =>
          item.productFamily === 'Database Storage' &&
          (item.attributes.databaseEngine === engine || item.attributes.databaseEngine === 'Any') &&
          item.attributes.deploymentOption.startsWith(az !== 'single' ? 'Multi-AZ' : 'Single-AZ'),
          billing, {
            'GB-Mo': storage
          }));

        return {
          lease,
          details
        };
      }
    }
  }

};