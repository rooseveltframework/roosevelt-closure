'use strict';

var closureCompiler = require('closurecompiler'),
    fs = require('fs');

module.exports = {
  parse: function(app, fileName, filePath, callback) {
    var newJs;

    // disable minify if noMinify param is present in roosevelt
    if (app.get('params').noMinify) {
      fs.createReadStream(app.get('jsPath') + fileName).pipe(fs.createWriteStream(filePath));
      newJs = fs.readFileSync(app.get('jsPath') + fileName, 'utf-8');
      callback(null, newJs);
    }

    // do the compression
    else {
      closureCompiler.compile([app.get('jsPath') + fileName], app.get('params').jsCompiler.params || {
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
        },
        function(err, newJs) {
          callback(err, newJs);
        }
      );
    }
  }
};