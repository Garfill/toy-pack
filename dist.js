(function (modules) {
  const recordMap = new Map();

  function require(id) {
    if (recordMap.has(id)) {
      return recordMap.get(id);
    }
    const [moduleFn, map] = modules[id];
    const module = {
      exports: {},
    };
    function _require(filePath) {
      return require(map[filePath]);
    }
    recordMap.set(id, module.exports);
    moduleFn(_require, module, module.exports);
    return module.exports;
  }
  require(0);
})({
  0: [
    function (require, module, exports) {
      "use strict";

      var _foo = _interopRequireDefault(require("./foo.js"));
      var _example = _interopRequireDefault(require("./example.json"));
      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }
      (0, _foo["default"])();
      console.log("main");
      console.log(_example["default"]);
    },
    { "./foo.js": 1, "./example.json": 2 },
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
    { "./bar.js": 3 },
  ],

  2: [
    function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      var _default = (exports["default"] = {
        name: "pack-json",
        msg: {
          child: "need-loader",
        },
        test: true,
      });
    },
    {},
  ],

  3: [
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
