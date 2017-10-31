roosevelt-closure
===
[![Build Status](https://travis-ci.org/rooseveltframework/roosevelt-closure.svg?branch=master)](https://travis-ci.org/rooseveltframework/roosevelt-closure) [![npm](https://img.shields.io/npm/v/roosevelt-closure.svg)](https://www.npmjs.com/package/roosevelt-closure)

[Google Closure compiler](https://developers.google.com/closure/compiler) support for [Roosevelt MVC web framework](https://github.com/rooseveltframework/roosevelt).

# Usage

Declare the `roosevelt-closure` module as a dependency in the package.json of your roosevelt app.

Then declare your JS compiler by passing it as a param to Roosevelt:

```js
"rooseveltConfig": {
  "jsCompiler": {nodeModule: "roosevelt-closure", params: {someParam: someValue}}
}
```

See the [Closure compiler](https://www.npmjs.com/package/google-closure-compiler-js) repo API docs for documentation on available params.
