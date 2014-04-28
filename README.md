roosevelt-closure
=================

[Google Closure compiler](https://developers.google.com/closure/compiler) support for [Roosevelt MVC web framework](https://github.com/kethinov/roosevelt).

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