'use strict';

//
module.exports = {
  region: {
    short: 'r',
    description: `Region`,
    validator(v, service) {
      const regions = service.exec('regions');
      return ~regions.indexOf(v);
    },
    info(service) {
      return `paws ${service.alias} regions`;
    },
    default: null,
    required: true
  },
  instanceType: {
    description: 'Instance type',
    short: 'i',
    required: true,
    validator(v, service, { region }) {
      const list = service.exec('instanceTypes', { region }).map(v => v.instanceType)
      return ~list.indexOf(v);
    },
    info(service, { region }) {
      return `paws ${service.alias} instanceTypes -r ${region}`;
    }
  },
  lease: {
    description: 'Lease',
    values: ['1yr', '3yr']
  },
  upfront: {
    description: 'Used with --lease, specify upfront type',
    values: ['no', 'partial', 'all'],
    default: 'no'
  },
  az: {
    description: 'AZ',
    value: ['single', 'multi'],
    default: 'single'
  }
};