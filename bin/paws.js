#!/usr/bin/env node

'use strict';

const program = require('commander');
const colors = require('colors');
const updateNotifier = require('update-notifier');

const services = require('../lib/services');
const util = require('../lib/util');
const cli = require('../lib/cli');
const pricing = require('../lib/pricing');
const outputs = require('../lib/outputs');
const quoteFile = require('../lib/quoteFile');

const pkg = require('../package');

const notifier = updateNotifier({ pkg, updateCheckInterval: 1 });

program.version(pkg.version);

// Little tricky override
program.executables = true;
program.executeSubCommand = function (argv, args, unknow) {
  const topCommand = args.shift();
  for (const c of this.commands) {
    if (c._name === topCommand) {
      return c.parse(Array(2).concat(args, unknow));
    }
  }
  cli.error('Command not found');
  this.outputHelp();
};



function generateOption(cmd, name, def) {
  let optName = `--${name}`;
  if (def.short) {
    optName = `-${def.short}, ${optName}`;
  }
  if (def.type !== 'bool' || (def.type === 'bool' && def.default)) {
    optName += def.required ? ' <value>' : ' [value]';
  }

  if (typeof def.values === 'function') {
    def.values = def.values();
  }
  let description = def.description;
  if (def.values) {
    def.parser = v => ~def.values.indexOf(v) ? v : undefined;
    description += ` (${def.values.join(', ')})`;
  }
  cmd.option(optName, description, def.parser || util.getParser(def.type), def.default || null);
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
          cli.error(`error: option --${o.name()} is invalid\n`);
          c.outputHelp(colors.red);
          process.exit(1);
        }
      }

      const params = { output: c.output };
      for (const name in command.params) {
        params[name] = c[name];
      }

      const out = service.exec(name, params);

      if (params.output === 'json') {
        console.log(JSON.stringify(out));
        return process.exit();
      }
      if (command.output && command.output.pretty) {
        return command.output.pretty(out, params);
      }
      if (outputs[name] && outputs[name].pretty) {
        return outputs[name].pretty(out, params);
      }
      cli.error('error: Undefined output');
    });
    return c;
  })
});

program.command('quote <file>')
  .description('Quote from yaml file')
  .action((file) => {
    quoteFile(file)
  });


program.parse(process.argv);

notifier.notify();