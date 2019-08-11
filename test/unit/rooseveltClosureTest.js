/* eslint-env mocha */

const assert = require('assert')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const cleanupTestApp = require('../../node_modules/roosevelt/test/util/cleanupTestApp')
const generateTestApp = require('../../node_modules/roosevelt/test/util/generateTestApp')
const fork = require('child_process').fork
const closure = require('google-closure-compiler-js')

describe('Roosevelt Closure Section Test', function () {
  // location of the test app
  const appDir = path.join(__dirname, '../app/closureJSTest')

  // sample JS source string to test the compiler with that has a unusedvar
  const test1 = `var h = 3 + 6; var test = 9 === NaN; testing('Paul', h);`

  // path to where the file with the JS source string written on it will be
  const pathOfStaticJS = path.join(appDir, 'statics', 'js', 'a.js')

  // path to where the compiled js file will be written to
  const pathOfcompiledJS = path.join(appDir, 'statics', '.build', 'js', 'a.js')

  // options that would be passed to generateTestApp
  const options = { rooseveltPath: 'roosevelt', method: 'initServer' }

  beforeEach(function () {
    // start by generating a statics folder in the roosevelt test app directory
    fse.ensureDirSync(path.join(appDir, 'statics', 'js'))
    // generate sample js files in statics with JS source string from test1
    fs.writeFileSync(pathOfStaticJS, test1)
  })

  afterEach(function (done) {
    // delete the generated test folder once we are done so that we do not have conflicting data
    cleanupTestApp(appDir, (err) => {
      if (err) {
        throw err
      } else {
        done()
      }
    })
  })

  it('should make a compiled js file that is the same as the compiled js string I have stored in the noParamResult variable', function (done) {
    // JS string that represents the js file that was compiled with no params set
    const flags = { jsCode: [{ src: test1 }] }
    const noParamResult = closure.compile(flags)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // grab the string data from the compiled js file and compare that to the string of what a normal uglified looks like
    testApp.on('message', () => {
      const contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      const test = contentsOfCompiledJS === noParamResult.compiledCode
      assert.strictEqual(test, true)
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should compile a js file when params are undefined', function (done) {
    // JS string that represents the js file that was compiled with no params set
    const flags = { jsCode: [{ src: test1 }] }
    const noParamResult = closure.compile(flags)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // grab the string data from the compiled js file and compare that to the string of what a normal uglified looks like
    testApp.on('message', () => {
      const contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      const test = contentsOfCompiledJS === noParamResult.compiledCode
      assert.strictEqual(test, true)
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should make the same compiled js file if a param is passed to Roosevelt-UglifyJS as to if the file and params were passed to UglifyJS', function (done) {
    // JS string that represents the js file that was compiled with the compress set to false
    const flags = { jsCode: [{ src: test1 }], compilationLevel: 'WHITESPACE_ONLY' }
    const compressResult = closure.compile(flags)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
            compilationLevel: 'WHITESPACE_ONLY'
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // grab the string data from the compiled js file and compare that to the string of what a normal uglified looks like
    testApp.on('message', (app) => {
      const contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      const test = contentsOfCompiledJS === compressResult.compiledCode
      assert.strictEqual(test, true)
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should not give a "warning" string since the showWarning param is false', function (done) {
    let warning

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // an error should not be thrown by the testApp
    testApp.stderr.on('data', (data) => {
      if (data.toString().includes('Warnings')) {
        warning = true
      }
    })

    testApp.on('message', (app) => {
      if (warning) {
        assert.fail('app had thrown an error when showWarnings was set to false')
      }
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should console log a "warnings" string if there is something wrong with the code that the program is trying to parse', function (done) {
    let warning

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: true,
          params: {
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // an error should be thrown by the testApp, with a warnings in the string
    testApp.stderr.on('data', (data) => {
      if (data.toString().includes('Warnings')) {
        warning = true
      }
    })

    testApp.on('message', (app) => {
      if (!warning) {
        assert.fail('app was able to complete initialize and did not throw a warnings error')
      }
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should not change the name of a function that is from a external file I declare in the externs (String)', function (done) {
    // sample external JS source string
    const externalJS = 'function testing(nameIn,num){console.log(`Hello ` + nameIn + `You had come into class ` + num + `days`)}'

    // path for the external file
    const pathOfExternalJS = path.join(appDir, 'external.js')

    // generate the external file
    fse.ensureDirSync(path.join(appDir, 'statics', 'js'))
    fs.writeFileSync(pathOfExternalJS, externalJS)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
            compilationLevel: 'ADVANCED_OPTIMIZATIONS',
            externs: '/external.js'
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // It should have compiled, but the function declared in the externs params should not have changed
    testApp.on('message', (params) => {
      const contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      const test = contentsOfCompiledJS.includes('testing')
      assert.strictEqual(test, true)
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should not change the name of a function that is from a external file I declare in the externs (Array of String)', function (done) {
    // sample external JS source string
    const externalJS = 'function testing(nameIn,num){console.log(`Hello ` + nameIn + `You had come into class ` + num + `days`)}'

    // path for the external file
    const pathOfExternalJS = path.join(appDir, 'external.js')

    // generate the external file
    fse.ensureDirSync(path.join(appDir, 'statics', 'js'))
    fs.writeFileSync(pathOfExternalJS, externalJS)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
            compilationLevel: 'ADVANCED_OPTIMIZATIONS',
            externs: ['/external.js']
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // It should have compiled, but the function declared in the externs params should not have changed
    testApp.on('message', (params) => {
      const contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      const test = contentsOfCompiledJS.includes('testing')
      assert.strictEqual(test, true)
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })

  it('should give a "error" string if there is a massive problem with the code that the program is trying to parse (typo)', function (done) {
    // JS source script that has a error in it (typo)
    const errorTest = `function f(){ returbn 2 + 3; }`
    // path of where the file with this script will be located
    const pathOfErrorStaticJS = path.join(appDir, 'statics', 'js', 'b.js')
    let error

    // make this file before the test
    fs.writeFileSync(pathOfErrorStaticJS, errorTest)

    // generate the app
    generateTestApp({
      appDir: appDir,
      generateFolderStructure: true,
      js: {
        compiler: {
          nodeModule: '../../roosevelt-closure',
          showWarnings: false,
          params: {
          }
        }
      }
    }, options)

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })

    // the app should throw an error with a 'failed to parse' somewhere in the string
    testApp.stderr.on('data', (data) => {
      if (data.includes('failed to parse')) {
        error = true
      }
    })

    // It should not compiled, meaning that if it did, something is off with the error system
    testApp.on('message', (params) => {
      if (!error) {
        assert.fail('the app initialized with no error detected')
      }
      testApp.send('stop')
    })

    testApp.on('exit', () => {
      done()
    })
  })
})
