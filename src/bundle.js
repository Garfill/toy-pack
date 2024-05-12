// 该文件为打包器最终输出内容格式

// v1.0
// bug： 代码内部require的路径为相对路径，但是modules的key为绝对路径
; (function (modules) {
  // modules 由 打包器构建，输入到这里

  //  浏览器内部没有require
  //  内部重新实现require
  function require(filepath) {
    const moduleFn = modules[filepath]
    const module = {
      exports: {}
    }
    moduleFn(require, module, module.exports)
    return module.exports
  }

  return require('./src/main.js')
})(
  {
    './module/path': function (require, module, exports) {
      // 里面是模块的code
    }
  }
)

// v2.0
; (function (modules) {
  // modules 由 打包器构建，输入到这里

  function require(id) {
    const [moduleFn, map] = modules[id]
    const module = {
      exports: {}
    }
    function _require(filePath) {
      return require(map[filePath])
    }
    moduleFn(_require, module, module.exports)
    return module.exports
  }


  return require(0)
})(
  {
    0: [function (require, module, exports) {
      // 里面是模块的code
    }, {
      // 内部为当前模块的依赖映射
      './dep/path': 2
    }],
    2: [/* */]
  }
)


