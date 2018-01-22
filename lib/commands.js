'use strict';

const colors = require('colors');

const util = require('./util');
const pricing = require('./pricing');
const params = require('./params');
const outputs = require('./outputs');

module.exports = {
  regions: (service) => ({
    params: {},
    handler: () => {
      const regions = pricing.getOfferRegions(service.name);
      return regions;
    },
    output: {
      pretty(out) {
        outputs.list.pretty(out, { title: 'Available regions:' })
      }
    }
  }),
  instanceTypes: (service) => ({
    params: {
      region: params.region,
      current: {
        description: 'Current generation',
        default: true
      },
      details: {
        type: 'bool',
        description: 'Show details',
        default: false
      },
      search: {
        description: 'Search by instance name'
      },
      family: {
        description: 'Family (general, memory, storage, compute, gpu, ...)'
      },
      os: {
        description: 'Operating system filter'
      },
      // vcpu: {
      //   description: 'CPU filter'
      // },
    },
    handler({ region, current, search, family, os }) {
      const product = pricing.getOfferProducts(service.name, region);
      const map = new Map();

      const searchFilter = search ? new RegExp(search, 'i') : null;
      const familyFilter = family ? new RegExp(family, 'i') : null;
      const osFilter = os ? new RegExp(os, 'i') : null;

      product.get((item) => {
        const att = item.attributes;
        if (!att.instanceType)
          return;
        if (!~att.instanceType.indexOf('.')) // Ignore global
          return;
        if (current && att.currentGeneration !== 'Yes')
          return;

        if (searchFilter && !searchFilter.test(att.instanceType)) {
          return;
        }
        if (familyFilter && !familyFilter.test(att.instanceFamily)) {
          return;
        }
        if (osFilter && !osFilter.test(att.operatingSystem)) {
          return;
        }

        if (!map.has(att.instanceType)) {
          map.set(att.instanceType, {
            instanceType: att.instanceType,
            instanceFamily: att.instanceFamily,
            currentGeneration: att.currentGeneration,
            vcpu: att.vcpu,
            physicalProcessor: att.physicalProcessor,
            clockSpeed: att.clockSpeed,
            memory: att.memory,
            storage: att.storage,
            io: att.io,
            networkPerformance: att.networkPerformance,
            processorArchitecture: att.processorArchitecture,
            dedicatedEbsThroughput: att.dedicatedEbsThroughput,
            ecu: att.ecu,
            enhancedNetworkingSupported: att.enhancedNetworkingSupported,
            normalizationSizeFactor: att.normalizationSizeFactor,
            processorFeatures: att.processorFeatures,
            options: []
          });

        }
        map.get(att.instanceType).options.push({
          tenancy: att.tenancy,
          operatingSystem: att.operatingSystem,
          licenseModel: att.licenseModel,
          preInstalledSw: att.preInstalledSw,
          deploymentOption: att.deploymentOption,
          databaseEngine: att.databaseEngine
        })
      });

      return Array.from(map.values());
    },
    output : {
      pretty(out, { details }) {
        console.log('\nAvailable instances:\n');
        const showValue = (name, value, color) => {
          if (value instanceof Set) {
            value = value.size ? Array.from(value).join(', ') : null
          }
          if (value) {
            console.log(`\t${colors.italic(util.strpad(name, 27))}:\t${colors[color || 'white'](value)}`);
          }
        }
        out
          .sort((a, b) => a.instanceType > b.instanceType ? 1 : -1)
          .forEach((inst) => {
            console.log(' - ', colors.white.bold(inst.instanceType));

            if (details) {
              showValue('Family', inst.instanceFamily, 'blue');
              showValue('Current Generation', inst.currentGeneration);
              showValue('vCPU', inst.vcpu, 'green');
              showValue('ecu', inst.ecu, 'green');
              showValue('Physical Processor', inst.physicalProcessor);
              showValue('Processor Features', inst.processorFeatures);
              showValue('Architecture', inst.processorArchitecture);
              showValue('Clock Speed', inst.clockSpeed, 'green');
              showValue('Memory', inst.memory, 'green');
              showValue('Storage', inst.storage, 'green');
              showValue('I/O', inst.io, 'green');
              showValue('Dedicated Ebs Throughput', inst.dedicatedEbsThroughput);
              showValue('Network Performance', inst.networkPerformance, 'green');
              showValue('Enhanced Networking', inst.enhancedNetworkingSupported);
              showValue('Normalization Size Factor', inst.normalizationSizeFactor);

              showValue('Operating System', new Set(inst.options.map(o => o.operatingSystem)), 'yellow');
              showValue('Deployment Option', new Set(inst.options.map(o => o.deploymentOption)), 'yellow');
              showValue('Database Engine', new Set(inst.options.map(o => o.databaseEngine)), 'yellow');

              //console.log(inst.options)
            }
          })
      }
    }
  })
}