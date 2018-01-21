'use strict';

const fs = require('fs');

const yml = require('js-yaml');
const colors = require('colors');

const availableServices = require('./services');
const outputs = require('./outputs');

function applyVars(str, values) {
  if (typeof str !== 'string') return str;
  return str.replace(/\$\{([^}]+)\}/g, (_, str) => {
    return new Function(Object.keys(values), `return (${str});`)(...Object.keys(values).map(k => values[k]))
  })
}

function applyToService(service, name, def) {
  const quote = service.commands.quote;
  const defaults = {};
  for (let k in quote.params) {
    defaults[k] = quote.params[k].default;
  }

  // TODO validate input

  const params = Object.assign({}, defaults, def);

  for (let k in quote.params) {
    const p = quote.params[k];
    if (p.required && (params[k] === null || params[k] === undefined)) {
      return console.error(`Missing parameter ${name} ${k}`);
    }
  }
  const out = service.commands.quote.handler(params);
  return out;
}

// quote from file
module.exports = (file) => {
  console.log('');
  const content = yml.safeLoad(fs.readFileSync(file, 'utf8'));

  if (!content || !content.services) {
    return console.error('Missing services section');
  }

  const servicesIdx = new Map();
  for (let k in availableServices) {
    servicesIdx.set(k.toLowerCase(), availableServices[k]);
    servicesIdx.set(availableServices[k].alias.toLowerCase(), availableServices[k]);
  }

  const details = [];
  for (let serviceName in content.services) {
    if (!servicesIdx.has(serviceName.toLowerCase())) {
      return console.error('Invalid or not supported service:', serviceName);
    }
    for (let name in content.services[serviceName]) {
      const def = Object.assign({}, content.defaults || {}, content.services[serviceName][name]);
      // Apply vars
      for (let k in def) {
        def[k] = applyVars(def[k], content.vars || {})
      }
      const out = applyToService(servicesIdx.get(serviceName), `${serviceName}: ${name}`, def);
      if (!out) {
        process.exit(1);
      }
      out.label = serviceName;
      out.subLabel = name;
      outputs.quote.pretty(out);
      details.push(...out.details.map(v => {
        if (v.fee) {
          const lease = parseInt(out.lease);
          if (!isNaN(lease)) {
            v.monthlyFee = v.fee / (lease * 12);
          }
        }
        return v;
      }));
    }

  }
  console.log('');
  console.log(colors.white.bold('══════════════════════════════════'));
  //console.log(colors.white.bold('TOTAL'));
  outputs.quote.pretty({ label: 'TOTAL', details });
  console.log(colors.white.bold('──────────────────────────────────'));
  console.log('');
  return details;

}

