export enum State {
  Pending,
  Resolved,
  Rejected
}

interface PromiseCallbackFunc {
  (value?: unknown): void
}

interface PromiseExecutorFunc {
  (resolved: PromiseCallbackFunc, rejected: PromiseCallbackFunc): void;
}

function handlePromise(promise: MyPromise, value: any, resolve: PromiseCallbackFunc, reject: PromiseCallbackFunc): void {
  if (promise === value) {
    // 避免循环调用
    throw new TypeError('循环调用');
  }
  if (value && typeof value.then === 'function') { // 支持类Promise对象
    value.then.call(value, resolve, reject);
  } else {
    resolve(value);
  }
}

export default class MyPromise {

  value: any;
  reason: any;
  state: State;
  resolveCallbacks: Function[] = [];
  rejectCallbacks: Function[] = [];

  constructor(executor: PromiseExecutorFunc) {
    this.state = State.Pending;

    const resolve: PromiseCallbackFunc = (value) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.value = value;
        this.state = State.Resolved;
        this.resolveCallbacks.forEach(cb => cb(this.value));
      }
    }

    const reject: PromiseCallbackFunc = (reason) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.reason = reason;
        this.state = State.Rejected;
        this.rejectCallbacks.forEach(cb => cb(this.reason));
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      // 错误捕获
      reject(error)
    }
  }

  then = (onResolved?: ((value: any) => any) | undefined | null, onRejected?: ((value: any) => any) | undefined | null): MyPromise => {
    const promise = this;
    // 链式调用，最终还是返回一个Promise
    return new MyPromise(function(resolve, reject) {

      // promise resolve 状态之后执行的回调
      const resolveCallback = (value: any): void => {
        try {
          const next = typeof onResolved === 'function' ? onResolved(value) : value;
          handlePromise(promise, next, resolve, reject);
        } catch (error) {
          reject(error)
        }
      };
      if (promise.state === State.Resolved) {
        // 状态已经是resolve直接执行
        resolveCallback(promise.value);
      } else if (promise.state === State.Pending) {
        // 等待状态变成resolved再执行
        promise.resolveCallbacks.push(resolveCallback)
      }
      
      // 与resolve类似
      const rejectCallback = (reason: any): void => {
        try {
          const next = typeof onRejected === 'function' ? onRejected(reason) : reason;
          handlePromise(promise, next, resolve, reject);
        } catch (error) {
          reject(error)
        }
      };
      if (promise.state === State.Rejected) {
        rejectCallback(promise.reason);
      } else if (promise.state === State.Pending) {
        promise.rejectCallbacks.push(rejectCallback);
      }
    })
  }

}