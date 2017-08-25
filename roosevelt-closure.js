var closureCompiler = require('google-closure-compiler-js').compile,
    fs = require('fs'),
    util = require('util');

module.exports = {
  parse: function(app, fileName, filePath, callback) {
    var params = {},
        compilerOut,
        newJs,
        errors,
        warnings,
        extern,
        externs,
        i,
        l;

    // disable minify if noMinify param is present in roosevelt
    if (app.get('params').noMinify) {
      fs.createReadStream(app.get('jsPath') + fileName).pipe(fs.createWriteStream(filePath));
      newJs = fs.readFileSync(app.get('jsPath') + fileName, 'utf-8');
      callback(null, newJs);
    }

    // do the compression
    else {
      // warn for using deprecated compilation_level param and reset params to default
      if (app.get('params').jsCompiler.params.compilation_level) {
        console.warn('⚠️  Old param "compilation_level" was passed to roosevelt-closure. As of 0.3.x, breaking API changes were made to roosevelt-closure. You will need to update your roosevelt app\'s config to use the new params syntax. See https://github.com/kethinov/roosevelt#statics-parameters for details'.red);
        params.compilationLevel = 'ADVANCED';
      }
      else {
        params = app.get('params').jsCompiler.params;
      }

      if (params.externs) {
        // process externs
        if (typeof params.externs === 'string') {
          params.externs = [{src: fs.readFileSync(app.get('appDir') + params.externs, 'utf-8')}];
        }
        else {
          l = params.externs.length;
          externs = [];
          for (i = 0; i < l; i++) {
            extern = params.externs[i];
            externs.push(
              {
                src: fs.readFileSync(app.get('appDir') + extern, 'utf-8')
              }
            );
          }
          params.externs = externs;
        }
      }

      params.jsCode = [{src: fs.readFileSync(app.get('jsPath') + fileName, 'utf-8')}];

      compilerOut = closureCompiler(params);
      newJs = compilerOut.compiledCode;
      errors = compilerOut.errors;
      warnings = compilerOut.warnings;

      if (app.get('params').jsCompiler.showWarnings === true && warnings[0]) {
        console.warn('⚠️  JS Compiler Warnings:'.bold.yellow + '\n' + util.inspect(warnings));
      }

      // clear errors array if no errors present
      if (!errors[0]) {
        errors = null;
      }

      callback(errors, newJs);
    }
  }
};
