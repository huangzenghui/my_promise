import MyPromise, { State } from '../promise'

test('Promise 初始状态是pending', () => {
  const promise = new MyPromise(() => {})
  expect(promise.state).toBe(State.Pending);
});

test('Promise resolve 之后状态是resolved', () => {
  const value = 'resolve'
  const promise = new MyPromise((resolve) => {
    resolve(value)
  })
  expect(promise.state).toBe(State.Resolved);
  expect(promise.value).toBe(value);
});

test('Promise reject 之后状态是rejected', () => {
  const reason = 'reject'
  const promise = new MyPromise((resolve, reject) => {
    reject(reason)
  })
  expect(promise.state).toBe(State.Rejected);
  expect(promise.reason).toBe(reason);
});

describe('Promise resolve或reject 之后状态不可逆', () => {

  let resolveFn: Function | null = null
  let rejectFn: Function | null = null
  let promise: MyPromise | null = null
  const value = 'value'

  beforeAll(() => {
    promise = new MyPromise((resolve, reject) => {
      resolve(value);
      resolveFn = resolve;
      rejectFn = reject;
    })
  })

  test('状态已改变', () => {
    expect(promise?.state).toBe(State.Resolved);
    expect(promise?.value).toBe(value);
  })

  test('重新resolve，状态也不会改变', () => {
    const newValue = 'newValue'
    resolveFn && resolveFn(newValue);
    expect(promise?.state).toBe(State.Resolved);
    expect(promise?.value).toBe(value);
    expect(promise?.value === newValue).toBeFalsy();
  })

  test('重新reject，状态也不会改变', () => {
    const newReason = 'newReason'
    rejectFn && rejectFn(newReason);
    expect(promise?.state).toBe(State.Resolved);
    expect(promise?.value).toBe(value);
    expect(promise?.reason === newReason).toBeFalsy();
  })

})

test('支持同步then回调', () => {
  const value = 'resolve'
  new MyPromise((resolve) => {
    resolve(value)
  }).then((cbValue) => {
    expect(cbValue).toBe(value)
  })
})

test('支持异步then回调', () => {
  const value = 'resolve'
  new MyPromise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, 1000)
  }).then((cbValue) => {
    expect(cbValue).toBe(value)
  })
})