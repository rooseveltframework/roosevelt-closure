'use strict';

var closureCompiler = require('closurecompiler');

module.exports = {
  parse: function(app, fileName, callback) {
    closureCompiler.compile([app.get('jsPath') + fileName], app.get('params').jsCompiler.params || {
        compilation_level: 'ADVANCED_OPTIMIZATIONS'
      },
      function(err, newJs) {
        var newFile = app.get('jsCompiledOutput') + fileName;
        callback(err, newFile, newJs);
      }
    );
  }
};