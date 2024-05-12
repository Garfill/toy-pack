import fs from 'fs'
import * as parser from "@babel/parser"; 
import traverse from '@babel/traverse'
import path from 'path';
import ejs from 'ejs'
import babel from '@babel/core'
import prettier from 'prettier'


const recordMap = new Map()

let assetsId = 0
// 构建一个文件资源
function createAssets(filePath) {
  if (recordMap.has(filePath)) {
    return recordMap.get(filePath)
  }
  // 1. 获取文件内容
  const code = fs.readFileSync(filePath, 'utf-8')

  // 2. 获取对应依赖
  //   ast 获取依赖（import）的内容
  const ast = parser.parse(code, {
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
  const  { code: transformedCode }= babel.transformFromAst(ast, code, {
    presets: [
      ["@babel/preset-env"]
    ] 
  })
  // console.log('transformedCode: >>>', transformedCode)


  // console.log(ast)
  const asset = {
    id: assetsId++,
    path: filePath,
    code: transformedCode, // 文件代码
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
const graph = createDepsGraph()



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

  // 生成code写入文件系统
  fs.writeFile('bundle.js', prettierCode, () => {
    console.log('========= bundle.js ok ========')
  })
}

build(graph)