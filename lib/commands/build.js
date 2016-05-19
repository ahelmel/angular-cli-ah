'use strict';

var exec = require('child_process').exec;
var RSVP = require('rsvp');
var https = require('https');
var inquire = require('inquirer');
var fs = require('fs');
var fse = require('fs-extra');
var path = require('path');

module.exports = {
  // info
  name: 'ah:build',
  aliases: ['ah:build'],
  description: '???',
  works: 'insideProject',

  // options
  availableOptions: [{
    name:         'environment',
    type:         String,
    default:      'dev',
    description:  '???'
  }, {
    name:         'brand',
    type:         String,
    default:      'gmx',
    description:  '???'
  }, {
    name:         'language',
    type:         String,
    default:      'de_DE',
    description:  '???'
  }],

  // run
  run: function(options, rawArgs) {
    var ui          = this.ui;
    var root        = this.project.root;
    var execOptions = { cwd: root };
    var projectName = this.project.pkg.name;
    var projectUrl  = '';
    var fsReadDir = RSVP.denodeify(fs.readdir);
    var fsCopy = RSVP.denodeify(fse.copy);

    // #0
    function beforeBuild() {
      var environment = options.environment;
      var brand = options.brand;
      var language = options.language;
      return runCommand('git status', execOptions)
        .then(stdout => {
          ui.write(`#0 printArgs\n`);
          ui.write(`   environment: ${environment}\n`);
          ui.write(`   brand: ${brand}\n`);
          ui.write(`   language: ${language}\n`);
        });
    }

    function afterBuild() {
      return runCommand('git status', execOptions)
        .then(stdout => {
          ui.write(`Built! Checkout ${projectUrl}\n`);
        });
    }

    // #1
    function buildApp() {
      var environment = options.environment;
      return runCommand('ng build --environment=' + environment, execOptions)
        .then(stdout => {
          ui.write(`#1 buildApp\n`);
        });
    }

    // #2
    function injectAppConfig() {
      return runCommand('git status', execOptions)
        .then(stdout => {
          ui.write(`#2 injectAppConfig\n`);
        });
    }

    // #3
    function copyAppConfig() {
      return runCommand('git status ', execOptions)
        .then(stdout => {
          ui.write(`#3 copyAppConfig\n`);
        });
    }

    return beforeBuild()
      .then(buildApp)
      .then(injectAppConfig)
      .then(copyAppConfig)
      .then(afterBuild);
  }
};

// helper
function runCommandLater() {
  var args = arguments;
  return function() {
    return runCommand.apply(null, args);
  }
}

function runCommand(/* child_process.exec args */) {
  var args = Array.prototype.slice.call(arguments);

  var lastIndex = args.length - 1;
  var lastArg   = args[lastIndex];
  var logOutput = false;
  if (typeof lastArg === 'boolean') {
    logOutput = lastArg;
    args.splice(lastIndex);
  }

  return new RSVP.Promise(function(resolve, reject) {
    var cb = function(err, stdout, stderr) {
      if (stderr) {
        console.log(stderr);
      }

      if (logOutput && stdout) {
        console.log(stdout);
      }

      if (err) {
        return reject(err);
      }

      return resolve(stdout);
    };

    args.push(cb);
    exec.apply(exec, args);
  }.bind(this));
}
