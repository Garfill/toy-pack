export class ChangePlugin{
  constructor(path){
    this.filePath = path
  }
  apply(hooks){
    hooks.emitFile.tap('Change', (context) => {
      context.filePath = this.filePath
    })
  }
}