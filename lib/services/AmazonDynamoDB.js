'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AmazonDynamoDB',
  alias: 'dynamodb',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        lease: params.lease,
        duration: {
          description: 'Monthly duration',
          short: 'd',
          type: ['duration', 'h'],
          default: 730
        },
        itemSize: {
          description: 'Item size',
          type: ['bytes', 'k'],
          default: 1
        },
        writes: {
          description: 'Num write',
          type: ['ops', 's'],
          default: 0,
        },
        reads: {
          description: 'Num read',
          type: ['ops', 's'],
          default: 0,
        },
        writeUnits: {
          description: 'Num write unit',
          type: 'count',
          default: 0,
        },
        readUnits: {
          description: 'Num read unit',
          type: 'count',
          default: 0,
        },
        consistent: {
          description: 'Read must be consistent',
          type: 'bool',
          default: true
        },
        storage: {
          description: 'Storage',
          type: ['bytes', 'Go'],
          default: 1
        }
      },

      handler({ region, storage, duration, itemSize, reads, writes,
        readUnits, writeUnits, consistent, lease }) {
        // Dynamodb pricing it's little bit complex
        // 1 wu = 1 write / s / 1ko
        // 1 ru = | 1 read / s / 4ko
        //        | 2 read / s / 4ko

        const products = pricing.getOfferProducts('AmazonDynamoDB', region);
        const details = [];
        const billing = lease ? 'Reserved' : 'OnDemand';

        if (lease && (readUnits % 100) > 0) {
          return console.error('Read unit must be a multiple of 100');
        }
        if (lease && (writeUnits % 100) > 0) {
          return console.error('Write unit must be a multiple of 100');
        }

        if (readUnits && reads) {
          return console.error('--readUnits and --reads are exclusives')
        }
        if (writeUnits && writes) {
          return console.error('--writeUnits and --writes are exclusives')
        }

        if (reads) {
          const nBlocks = Math.ceil(itemSize / 4);
          readUnits = Math.ceil(reads) * nBlocks;
          if (!consistent) {
            readUnits = Math.ceil(readUnits / 2);
          }
        }

        if (writes) {
          const nBlocks = Math.ceil(itemSize);
          writeUnits = Math.ceil(reads) * nBlocks;
        }

        // Writes
        details.push(...products.eval(item =>
          item.productFamily === 'Provisioned IOPS'
          && item.attributes.group === 'DDB-WriteUnits',
          billing, { 'WriteCapacityUnit-Hrs': duration * writeUnits, Quantity: writeUnits, lease }));

        // // Reads
        details.push(...products.eval(item =>
          item.productFamily === 'Provisioned IOPS'
          && item.attributes.group === 'DDB-ReadUnits',
          billing, { 'ReadCapacityUnit-Hrs': duration * readUnits, Quantity: readUnits, lease }));

        // // Storage
        details.push(...products.eval(item =>
          item.productFamily === 'Database Storage',
          billing, { 'GB-Mo': storage }));

        return {
          lease,
          details
        };
      }
    }
  }

};
