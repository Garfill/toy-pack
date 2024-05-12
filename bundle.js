(function (modules) {
  function require(id) {
    const [moduleFn, map] = modules[id];
    const module = {
      exports: {},
    };
    function _require(filePath) {
      return require(map[filePath]);
    }
    moduleFn(_require, module, module.exports);
    return module.exports;
  }
})({
  0: [
    function (require, module, exports) {
      "use strict";

      var _foo = _interopRequireDefault(require("./foo.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      (0, _foo["default"])();
      console.log("main");
    },
    { "./foo.js": 1 },
  ],

  1: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = foo;
      var _bar = _interopRequireDefault(require("./bar.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      (0, _bar["default"])();
      console.log("msg from foo.js");
      function foo() {
        console.log("foo");
      }
    },
    { "./bar.js": 2 },
  ],

  2: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = bar;
      var _foo = _interopRequireDefault(require("./foo.js"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      function bar() {
        console.log("bar");
      }
      (0, _foo["default"])();
    },
    { "./foo.js": 1 },
  ],
});
