/* eslint-env mocha */

const assert = require('assert')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const cleanupTestApp = require('../util/cleanupTestApp')
const generateTestApp = require('../util/generateTestApp')
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
    const flags = { jsCode: [ { src: test1 } ] }
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // grab the string data from the compiled js file and compare that to the string of what a normal uglified looks like
    testApp.on('message', () => {
      let contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      let test = contentsOfCompiledJS === noParamResult.compiledCode
      assert.equal(test, true)
      testApp.kill()
      done()
    })
  })

  it('should make the same compiled js file if a param is passed to Roosevelt-UglifyJS as to if the file and params were passed to UglifyJS', function (done) {
    // JS string that represents the js file that was compiled with the compress set to false
    const flags = { jsCode: [ { src: test1 } ], compilationLevel: 'WHITESPACE_ONLY' }
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // grab the string data from the compiled js file and compare that to the string of what a normal uglified looks like
    testApp.on('message', (app) => {
      let contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      let test = contentsOfCompiledJS === compressResult.compiledCode
      assert.equal(test, true)
      testApp.kill()
      done()
    })
  })

  it('should console log a "warnings" string if there is something wrong with the code that the program is trying to parse', function (done) {
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // an error should be thrown by the testApp, with a warnings in the string
    testApp.stderr.on('data', (data) => {
      if (data.toString().includes('Warnings')) {
        testApp.kill()
        done()
      }
    })

    // It should not be able to complete initialization, meaning if it does, we have an error in the error handling
    testApp.on('message', (params) => {
      assert.fail('app was able to complete initialize and did not throw a warnings error')
      testApp.kill()
      done()
    })
  })

  it('should not give a "warning" string since the showWarning param is false', function (done) {
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // an error should not be thrown by the testApp
    testApp.stderr.on('data', (data) => {
      if (data.toString().includes('Warnings')) {
        assert.fail('app had thrown an error when showWarnings was set to false')
        testApp.kill()
        done()
      }
    })

    // It should be able to complete initialization, meaning that the test had succeeded if it has completed initialization
    testApp.on('message', (params) => {
      testApp.kill()
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // It should have compiled, but the function declared in the externs params should not have changed
    testApp.on('message', (params) => {
      let contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      let test = contentsOfCompiledJS.includes('testing')
      assert.equal(test, true)
      testApp.kill()
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // It should have compiled, but the function declared in the externs params should not have changed
    testApp.on('message', (params) => {
      let contentsOfCompiledJS = fs.readFileSync(pathOfcompiledJS, 'utf8')
      let test = contentsOfCompiledJS.includes('testing')
      assert.equal(test, true)
      testApp.kill()
      done()
    })
  })

  it('should give a "error" string if there is a massive problem with the code that the program is trying to parse (typo)', function (done) {
    // JS source script that has a error in it (typo)
    const errorTest = `function f(){ returbn 2 + 3; }`
    // path of where the file with this script will be located
    const pathOfErrorStaticJS = path.join(appDir, 'statics', 'js', 'b.js')
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
    }, 'initServer')

    // fork the app and run it as a child process
    const testApp = fork(path.join(appDir, 'app.js'), {'stdio': ['pipe', 'pipe', 'pipe', 'ipc']})

    // the app should throw an error with a 'failed to parse file' somewhere in the string
    testApp.stderr.on('data', (data) => {
      if (data.includes('failed')) {
        testApp.kill()
        done()
      }
    })

    // It should not compiled, meaning that if it did, something is off with the error system
    testApp.on('message', (params) => {
      assert.fail('the app was able to initialize, meaning that roosevelt-closure was not able to detect the error')
      testApp.kill()
      done()
    })
  })
})
