import fs from 'fs'
import * as parser from "@babel/parser"; 
import traverse from '@babel/traverse'
import path from 'path';
import ejs from 'ejs'
import babel from '@babel/core'
import prettier from 'prettier'

import { jsonLoader } from './loader/jsonloader.js'
import { ChangePlugin } from './plugins/change.js'

// 注册事件hook
import { SyncHook } from 'tapable';

const recordMap = new Map()

// 模拟webpack打包配置
const config = {
  modules: {
    rules: [
      {
        test: /\.json$/,
        use: jsonLoader,
      }
    ]
  },
  plugins: [
    new ChangePlugin('dist.js')
  ]
}

// 打包器内部触发事件 hook
const hooks = {
  emitFile: new SyncHook(['path'])
}

let assetsId = 0
// 构建一个文件资源
function createAssets(filePath) {
  if (recordMap.has(filePath)) {
    return recordMap.get(filePath)
  }
  // 1. 获取文件内容
  let source = fs.readFileSync(filePath, 'utf-8')

  // 非 js 文件，使用loader
  const loaders = config.modules.rules
  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      // 传入文件内容进行转换
      // loader 转化 返回内容代替 source，最后生成 assets
      source = use(source)
    }
  })

  // 2. 获取对应依赖
  //   ast 获取依赖（import）的内容
  const ast = parser.parse(source, {
    sourceType: 'unambiguous',  
  })

  const deps = [] // 存储依赖路径
  // 遍历ast
  traverse.default(ast, {
    // 每次进入节点
    // enter(path) {
    //   console.log('>>>>>>>>>>>>>', path.node)
    // }

    ImportDeclaration({ node }) {
      // import 语句 ast 
      const depsPath = node.source.value
      deps.push(depsPath)
    }
  })

  // 转化低版本语法
  const  { code }= babel.transformFromAst(ast, source, {
    presets: [
      ["@babel/preset-env"]
    ] 
  })
  // console.log('transformedCode: >>>', transformedCode)


  // console.log(ast)
  const asset = {
    id: assetsId++,
    path: filePath,
    code, // 文件代码
    deps, // 依赖路径
    map: {},
  }

  recordMap.set(filePath, asset)

  return asset
}

// 构建依赖图
function createDepsGraph() {
  const mainAssets = createAssets('./src/main.js')

  // 广度优先遍历
  const queue = [mainAssets]
  for (let i = 0; i < queue.length; i++) {
    const assets = queue[i]
    const { code, deps } = assets
    deps.forEach((depPath) => {
      const childPath = path.resolve('./src', depPath)
      const isRecord = recordMap.has(childPath) // 是否循环获取 assets
      const childDep = createAssets(childPath)
      assets.map[depPath] = childDep.id

      // 新获取的 asset 递归处理
      if (!isRecord) {
        queue.push(childDep)
      }
    })
    // console.log(assets)
  }

  return queue // 返回queue就是依赖图数组
}


// 根据 graph 构建 modules；参考bundle.js
async function build(graph) {
  const modules = graph.map((assets) => {
    return {
      filePath: assets.path,
      code: assets.code,
      id: assets.id,
      map: assets.map,
    }
  })
  const template = fs.readFileSync('./template.ejs', 'utf-8')
  const code = ejs.render(template, {
    modules
  })

  const prettierCode = await prettier.format(code, {
    parser: 'babel'
  })

  // context 可以看作是 打包器内部 compiler属性
  const pluginContext = {
    filePath: 'bundle.js'
  }
  // 特定时机触发 打包器内部的事件 hook
  hooks.emitFile.call(pluginContext)

  // 生成code写入文件系统
  fs.writeFile(pluginContext.filePath, prettierCode, () => {
    console.log('========= bundle.js ok ========')
  })
}

function initPlugins() {
  config.plugins.forEach((plugin) => {
    plugin.apply(hooks)
  })
}


function run() {
  initPlugins()
  const graph = createDepsGraph()
  build(graph)
}

run()