# toy-pack

## 打包器打包步骤：
1. 根据入口获取对应内容
2. 根据内容构建依赖图
3. 根据依赖图合并依赖代码

## loader
作用：将 **非 js 模块** 转化成 **js 模块代码**

## plugin
webpack 内部实现 Tapable ： 发布订阅模式
