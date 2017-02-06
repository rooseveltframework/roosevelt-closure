var closureCompiler = require('google-closure-compiler-js').compile,
    fs = require('fs');

module.exports = {
  parse: function(app, fileName, filePath, callback) {
    var newJs,
        params;

    // disable minify if noMinify param is present in roosevelt
    if (app.get('params').noMinify) {
      fs.createReadStream(app.get('jsPath') + fileName).pipe(fs.createWriteStream(filePath));
      newJs = fs.readFileSync(app.get('jsPath') + fileName, 'utf-8');
      callback(null, newJs);
    }

    // do the compression
    else {
      console.log('params...');
      console.log(app.get('params').jsCompiler.params);

      app.get('params').jsCompiler.params = {
        compilationLevel: 'ADVANCED',
        warningLevel: 'VERBOSE'
      };
      console.log(app.get('params').jsCompiler.params);

      const flags = {
        languageIn: 'ECMASCRIPT6',
        languageOut: 'ECMASCRIPT5',
        compilationLevel: 'ADVANCED',
        warningLevel: 'VERBOSE',
        jsCode: [{src: 'var color = \'#eee\'; document.body.style.backgroundColor = color;'}],
      };
      const out = closureCompiler(flags);

      console.info(out.compiledCode);

      params = app.get('params').jsCompiler.params || {
        compilationLevel: 'ADVANCED'
      };

      console.log('src: ', fs.readFileSync(app.get('jsPath') + fileName, 'utf8'));

      params.jsCode = [{src: 'const x = 1 + 2;'}];

      console.log(closureCompiler);
      console.log(params);
      console.log(closureCompiler(params));

      /*closureCompiler.compile([app.get('jsPath') + fileName], app.get('params').jsCompiler.params || {
          compilation_level: 'ADVANCED'
        },
        function(err, newJs) {
          callback(err, newJs);
        }
      );*/
    }
  }
};
