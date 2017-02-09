var closureCompiler = require('google-closure-compiler-js').compile,
    fs = require('fs');

module.exports = {
  parse: function(app, fileName, filePath, callback) {
    var newJs,
        params = {};

    // disable minify if noMinify param is present in roosevelt
    if (app.get('params').noMinify) {
      fs.createReadStream(app.get('jsPath') + fileName).pipe(fs.createWriteStream(filePath));
      newJs = fs.readFileSync(app.get('jsPath') + fileName, 'utf-8');
      callback(null, newJs);
    }

    // do the compression
    else {
      if (!app.get('params').jsCompiler.params) {
        params.compilationLevel = 'ADVANCED';
      }
      else {
        params = app.get('params').jsCompiler.params;
      }

      params.jsCode = [{src: fs.readFileSync(app.get('jsPath') + fileName, 'utf-8')}];

      const out = closureCompiler(params);
      newJs = out.compiledCode;

      callback(out.errors[0], newJs);
    }
  }
};
