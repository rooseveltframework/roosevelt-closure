# roosevelt-closure [![NPM version](https://badge.fury.io/js/roosevelt-closure.png)](http://badge.fury.io/js/roosevelt-closure) [![Dependency Status](https://gemnasium.com/kethinov/roosevelt-closure.png)](https://gemnasium.com/kethinov/roosevelt-closure) [![Gittip](http://img.shields.io/gittip/kethinov.png)](https://www.gittip.com/kethinov/)

[Google Closure compiler](https://developers.google.com/closure/compiler) support for [Roosevelt MVC web framework](https://github.com/kethinov/roosevelt).

# Usage

Declare the `roosevelt-closure` module as a dependency in the package.json of your roosevelt app.

Declare your JS compiler by passing it as a param to Roosevelt:

```js
"rooseveltConfig": {
  "jsCompiler": {nodeModule: "roosevelt-closure", params: {someParam: someValue}}
}
```

See the [Closure compiler](https://www.npmjs.com/package/google-closure-compiler-js) repo API docs for documentation on available params.