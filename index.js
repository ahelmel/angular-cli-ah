/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-ah',

  includedCommands: function() {
    return {
      'ah:build': require('./lib/commands/build')
    };
  }
};
