'use strict';

const pricing = require('../pricing');
const util = require('../util');
const params = require('../params');
const commands = require('../commands');

module.exports = {
  name: 'AmazonCloudWatch',
  alias: 'cloudwatch',
  commands: {
    regions: commands.regions,
    quote: {
      params: {
        region: params.region,
        alarms: {
          description: 'Num alarms',
          type: 'count',
          default: 0
        },
        hrAlarms: {
          description: 'Num high resolution alarms',
          type: 'count',
          default: 0
        },
        customMetrics: {
          description: 'Num custom metrics',
          type: 'count',
          default: 0
        },
        apiRequests: {
          description: 'Num api requests',
          type: 'count',
          default: 0
        },
        injestedLogs: {
          description: 'Injested logs volume',
          type: ['bytes', 'Go'],
          default: 0
        },
        archivedLogs: {
          description: 'Archived logs volume',
          type: ['bytes', 'Go'],
          default: 0
        }
      },
      handler({ region, alarms, hrAlarms, customMetrics, apiRequests, injestedLogs, archivedLogs }) {
        const products = pricing.getOfferProducts('AmazonCloudWatch', region);
        const details = [];

        // Alarms
        details.push(...products.eval(item =>
          item.productFamily === 'Alarm'
          && item.attributes.alarmType === 'Standard',
          'OnDemand', { Alarms: alarms }));

        // High resolution alarms
        details.push(...products.eval(item =>
          item.productFamily === 'Alarm'
          && item.attributes.alarmType === 'High Resolution',
          'OnDemand', { Alarms: hrAlarms }));

        // Custom metrics
        details.push(...products.eval(item =>
          item.productFamily === 'Metric'
          && item.attributes.group === 'Metric',
          'OnDemand', { Metrics: customMetrics }));

        // API Requests
        details.push(...products.eval(item =>
          item.attributes.group === 'CW-Requests',
          'OnDemand', { Requests: Math.ceil(apiRequests / 1000) }));

        // Injested logs
        details.push(...products.eval(item =>
          item.productFamily === 'Data Payload'
          && ~item.attributes.usagetype.indexOf('DataProcessing-Bytes'),
          'OnDemand', { 'GB': injestedLogs }));

        // Archived logs
        details.push(...products.eval(item =>
          item.productFamily === 'Storage Snapshot',
          'OnDemand', { 'GB-Mo': archivedLogs }));


        return {
          details
        };
      }
    }
  }

};
