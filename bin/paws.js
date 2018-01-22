#!/usr/bin/env node

'use strict';

const program = require('commander');
const colors = require('colors');

const services = require('../lib/services');
const util = require('../lib/util');
const pricing = require('../lib/pricing');
const outputs = require('../lib/outputs');
const quoteFile = require('../lib/quoteFile');

program.version('1.0.0');

// Little tricky override
program.executables = true;
program.executeSubCommand = function (argv, args, unknow) {
  const topCommand = args.shift();
  for (const c of this.commands) {
    if (c._name === topCommand) {
      return c.parse(Array(2).concat(args, unknow));
    }
  }
  console.log('Command not found');
  this.outputHelp();
};



function generateOption(cmd, name, def) {
  let optName = `--${name}`;
  if (def.short) {
    optName = `-${def.short}, ${optName}`;
  }
  if (def.type !== 'bool') {
    optName += def.required ? ' <value>' : ' [value]';
  }

  if (typeof def.values === 'function') {
    def.values = def.values();
  }

  if (def.values) {
    def.parser = v => ~def.values.indexOf(v) ? v : undefined;
    def.description += ` (${def.values.join(', ')})`;
  }

  cmd.option(optName, def.description, def.parser || util.getParser(def.type), def.default || null);
}

Object.keys(services).forEach((serviceName) => {
  const service = services[serviceName];


  const serviceCmd = program.command(service.alias)
    .description(`Service ${service.name}`);
  // Register as executable
  program._execs[serviceCmd._name] = true;

  Object.keys(service.commands).forEach(name => {
    const command = typeof service.commands[name] === 'function'
      ? service.commands[name](service)
      : service.commands[name];
    const c = serviceCmd.command(name);
    if (command.description) {
      c.description('Informations about service');
    }
    for (const name in command.params) {
      generateOption(c, name, command.params[name]);
    }

    generateOption(c, 'output', {
      short: 'o',
      description: 'Output',
      values: ['json', 'pretty'],
      default: 'pretty'
    })

    c.action((c) => {

      for (const o of c.options) {
        const name = o.attributeName();
        const value = c[name];
        if (o.required && ((typeof value === 'number' && isNaN(value)) || value === undefined || value === null)
          || (!o.required && value !== o.defaultValue && value === undefined)) {
          console.error(colors.red(`\n error: option --${o.name()} is invalid\n`));
          c.outputHelp(colors.red);
          process.exit(1);
        }
      }

      const params = { output: c.output };
      for (const name in command.params) {
        params[name] = c[name];
      }
      const out = command.handler(params);
      if (params.output === 'json') {
        return console.log(JSON.stringify(out));
      }
      if (command.output && command.output.pretty) {
        return command.output.pretty(out, params);
      }
      if (outputs[name] && outputs[name].pretty) {
        return outputs[name].pretty(out, params);
      }
      console.error('Undefined output');
    });

    return c;
  })


});

program.command('quote <file>')
  .description('Quote from yaml file')
  .action((file) => {
    quoteFile(file)
  })

program.parse(process.argv);
