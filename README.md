roosevelt-closure [![NPM version](https://badge.fury.io/js/roosevelt-closure.png)](http://badge.fury.io/js/roosevelt-closure) [![Dependency Status](https://gemnasium.com/kethinov/roosevelt-closure.png)](https://gemnasium.com/kethinov/roosevelt-closure) [![Gittip](http://img.shields.io/gittip/kethinov.png)](https://www.gittip.com/kethinov/)
=================

[Google Closure compiler](https://developers.google.com/closure/compiler) support for [Roosevelt MVC web framework](https://github.com/kethinov/roosevelt).

Note: it's recommended to install the [Java JRE](http://www.oracle.com/technetwork/java/javase/downloads/index.html) as well. If you don't, then Roosevelt will install it as a dependency of your app which will bloat the site of your app by several tens of megabytes.

Usage
=====

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

License
=======

All original code in this module is licensed under the [Creative Commons Attribution 4.0 International License](http://creativecommons.org/licenses/by/4.0/). Commercial and noncommercial use is permitted with attribution.