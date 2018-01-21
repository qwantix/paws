'use strict';

//
module.exports = {
  region: {
    short: 'r',
    description: `Region`,
    //parser: v => (~regions.indexOf(v)) ? v : null,
    default: null,
    required: true
  },
  instanceType: {
    description: 'Instance type',
    short: 'i',
    required: true
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