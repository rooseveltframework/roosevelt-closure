roosevelt-closure [![NPM version](https://badge.fury.io/js/roosevelt-closure.png)](http://badge.fury.io/js/roosevelt-closure) [![Dependency Status](https://gemnasium.com/kethinov/roosevelt-closure.png)](https://gemnasium.com/kethinov/roosevelt-closure) [![Gittip](http://img.shields.io/gittip/kethinov.png)](https://www.gittip.com/kethinov/)
===

[Google Closure compiler](https://developers.google.com/closure/compiler) support for [Roosevelt MVC web framework](https://github.com/kethinov/roosevelt).

Note: if you're using this module in your app, it's recommended that you install the [Java JRE](http://www.oracle.com/technetwork/java/javase/downloads/index.html) to your system as well. If you don't, then the JRE will automatically be installed as a dependency of your app as part of the npm install step which will bloat the size of your app by several tens of megabytes.

Usage
===

Declare this module as a dependency in your app, for example:

```js
"dependencies": {
  "roosevelt": "*",
  "roosevelt-closure": "*"
}
```

Declare your JS compiler by passing it as a param to Roosevelt:

```js
"rooseveltConfig": {
  "jsCompiler": {nodeModule: "roosevelt-closure", params: {someParam: someValue}}
}
```

See the [closurecompiler](https://github.com/dcodeIO/ClosureCompiler.js#closurecompiler-api) repo API docs for documentation on available params.