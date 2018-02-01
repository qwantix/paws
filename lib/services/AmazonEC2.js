'use strict';

const colors = require('colors');

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');
const outputs = require('../outputs');


module.exports = {
  alias: 'ec2',

  commands: {
    regions: commands.regions,
    instanceTypes: commands.instanceTypes,
    os: {
      params: {
        region: params.region,
      },
      handler({ region }) {
        const product = pricing.getOfferProducts('AmazonEC2', region);
        const set = new Set();
        product.get((item) => {
          if (item.attributes.operatingSystem) {
            set.add(item.attributes.operatingSystem);
          }
        });
        return Array.from(set);
      },
      output : {
        pretty(out) {
          outputs.list.pretty(out, { title: 'Available Operating system' });
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
        os: {
          description: 'Os used',
          default: 'Linux',
          validator(v, service, { region }) {
            const list = service.exec('os', { region });
            return ~list.indexOf(v);
          }
        },
        tenancy: {
          description: 'Tenancy',
          values: ['shared', 'host', 'dedicated'],
          default: 'shared'
        },
        qty: {
          description: 'Num instances',
          type: 'count',
          default: 1
        }
      },
      handler({ region, instanceType, lease, upfront, duration, os, tenancy, qty }) {
        const products = pricing.getOfferProducts('AmazonEC2', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';


        // Instance
        details.push(...products.eval(item =>
          item.attributes.instanceType === instanceType
          && item.attributes.operatingSystem === os
          && item.attributes.tenancy.toLowerCase() === tenancy
          ,
          billing, { Hrs: duration * qty, Quantity: qty, lease, upfront }));

        return {
          lease,
          details
        };
      }
    }
  }

};

