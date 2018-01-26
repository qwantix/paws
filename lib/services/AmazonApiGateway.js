'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AmazonApiGateway',
  alias: 'apigateway',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        qty: {
          short: 'n',
          required: false,
          type: 'count',
          default: 1,
          description: 'Num http requests'
        }
      },
      handler({ region, qty }) {
        const products = pricing.getOfferProducts('AmazonApiGateway', region);
        const details = [];

        const filter = item => item.productFamily === 'API Calls';
        const product = products.get(filter);
        details.push(...products.eval(
          filter,
          'OnDemand',
          { [product.attributes.usagetype]: qty }
        ));

        return {
          details
        };
      }
    }
  }
};

