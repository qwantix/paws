'use strict';

const fs = require('fs');

const colors = require('colors');

const cli = require('../cli');


class Service {
  constructor(name, def) {
    this._name = name;
    this._def = def;
  }
  get name() {
    return this._name;
  }
  get commands() {
    return this._def.commands;
  }
  get alias() {
    return this._def.alias;
  }

  command(name) {
    const cmd = this._def.commands[name];
    if (!cmd) {
      cli.fatal(`Invalid command ${name}`);
    }
    return cmd;
  }
  exec(commandName, parameters) {
    parameters = parameters || {};
    let command = this.command(commandName);
    if (command instanceof Function) {
      command = command(this);
    }
    for (const name in command.params) {
      if (command.params[name].validator) {
        if (!command.params[name].validator(parameters[name], this, parameters)) {
          cli.fatal(`Invalid parameter value for ${name}: ${parameters[name]}`,
            command.params[name].info ? `\n See: ${colors.white(command.params[name].info(this, parameters))}` : '');
        }
      }
    }
    const out = command.handler(parameters, this);
    if (!out) {
      cli.fatal('Process exited');
    }
    return out;
  }
}



// Services loader
fs.readdirSync(__dirname).forEach((name) => {
  if (name === 'index.js') return;
  const serviceName = name.replace(/\.js$/, '');
  exports[serviceName] = new Service(serviceName, require('./' + name));
});