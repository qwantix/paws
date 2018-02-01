'use strict';

const fs = require('fs');

const colors = require('colors');


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
      console.error(colors.red(`Invalid command ${name}`));
      process.exit(0);
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
          console.error(colors.red(`Invalid parameter value for ${name}: ${parameters[name]}`));
          process.exit(0);
        }
      }
    }
    const out = command.handler(parameters, this);
    if (!out) {
      console.error('Process exited');
      process.exit(1);
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
