import bar from "./bar.js";

bar()

console.log('msg from foo.js')

export default function foo() {
  console.log('foo');
}