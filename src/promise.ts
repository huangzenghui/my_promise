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

export default class MyPromise {

  value: any;
  reason: any;
  state: State;

  constructor(executor: PromiseExecutorFunc) {
    this.state = State.Pending;

    const resolve: PromiseCallbackFunc = (value) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.value = value;
        this.state = State.Resolved;
      }
    }

    const reject: PromiseCallbackFunc = (reason) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.reason = reason;
        this.state = State.Rejected;
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      // 错误捕获
      reject(error)
    }
  }
}