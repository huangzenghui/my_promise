#### 手写 Promise

[Promise A+ 规范](https://promisesaplus.com/)

##### 分步骤实现

1. 基础框架
2. 支持then方法
3. 链式调用
4. 增加静态方法

ps: 目前所有回调都是同步执行，如果使用 setTimeout 来模拟，回调是加到宏任务中，所以可能和 Promise 有不同；可以用 node 的 process.nextTick 或浏览器中的 MutationObserver 来模拟。
