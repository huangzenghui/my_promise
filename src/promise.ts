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
  resolveCallback?: Function;
  rejectCallback?: Function;

  constructor(executor: PromiseExecutorFunc) {
    this.state = State.Pending;

    const resolve: PromiseCallbackFunc = (value) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.value = value;
        this.state = State.Resolved;
        this.resolveCallback && this.resolveCallback(this.value);
      }
    }

    const reject: PromiseCallbackFunc = (reason) => {
      if (this.state === State.Pending) { // 状态不可逆
        this.reason = reason;
        this.state = State.Rejected;
        this.rejectCallback && this.rejectCallback(this.reason);
      }
    }

    try {
      executor(resolve, reject);
    } catch (error) {
      // 错误捕获
      reject(error)
    }
  }

  then (onResolved?: ((value: any) => any) | undefined | null, onRejected?: ((value: any) => any) | undefined | null): any {
    if (this.state !== State.Pending) {
      if (this.state === State.Resolved) {
        typeof onResolved === 'function' && onResolved(this.value);
      } else {
        typeof onRejected === 'function' && onRejected(this.value);
      }
    } else {
      if (typeof onResolved === 'function') {
        this.resolveCallback = onResolved;
      }
      if (typeof onRejected === 'function') {
        this.rejectCallback = onRejected;
      }
    }
  }

}