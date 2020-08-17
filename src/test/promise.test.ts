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

test('支持then resolve非函数', () => {
  new MyPromise((resolve) => {
    resolve(1)
  }).then().then((value) => {
    expect(value).toBe(1);
  })
})

test('支持then reject非函数', () => {
  new MyPromise((resolve, reject) => {
    reject(1)
  }).then().then(null, (reason) => {
    expect(reason).toBe(1);
  })
})

test('executor抛错的状态是rejected', () => {
  const promise = new MyPromise(() => {
    throw new Error();
  }).then(null, (reason) => {
    expect(reason).toThrowError(Error);
    expect(promise.state).toBe(State.Rejected);
  })
})

test('支持catch', () => {
  const promise = new MyPromise(() => {
    throw new Error();
  }).catch((reason) => {
    expect(reason).toThrowError(Error);
    expect(promise.state).toBe(State.Rejected);
  })
})

test('resolve的是一个Promise', () => {
  const p = new MyPromise((resolve) => {
    setTimeout(() => resolve(1), 100);
  });
  expect(MyPromise.resolve(p)).resolves.toBe(1);
})

test('resolve的是一个类Promise', () => {
  const p = { then: () => 1 };
  expect(MyPromise.resolve(p)).resolves.toBe(1);
})

describe('支持链式调用', () => {

  test('正确resolve执行回调', () => {
    const resolvedFn = jest.fn();
    const rejectFn = jest.fn();
    new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(1)
      }, 1000)
    }).then(resolvedFn, rejectFn).then(() => {
      expect(resolvedFn).toHaveBeenCalled();
      expect(rejectFn).not.toHaveBeenCalled();
    })
  })

  test('正确reject执行回调', () => {
    const resolvedFn = jest.fn();
    const rejectFn = jest.fn();
    new MyPromise((resolve, reject) => {
      setTimeout(() => {
        reject(1)
      }, 1000)
    }).then(resolvedFn, rejectFn).then(() => {
      expect(resolvedFn).not.toHaveBeenCalled();
      expect(rejectFn).toHaveBeenCalled();
    })
  })

  it('同步调用', () => {
    new MyPromise((resolve) => {
      resolve(1)
    }).then((value: any) => {
      expect(value).toBe(1);
      return 2
    }).then((value: any) => {
      expect(value).toBe(2);
    })
  })

  it('异步调用', () => {
    new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 100)
    }).then((value: any) => {
      expect(value).toBe(1);
      return 2
    }).then((value: any) => {
      expect(value).toBe(2);
    })
  })

  test('异步reject调用', (done) => {
    new MyPromise((resolve, reject) => {
      setTimeout(() => {
        reject(1);
      }, 100)
    }).then(null, (reason) => {
      expect(reason).toBe(1);
      return 2;
    }).then((value: any) => {
      expect(value).toBe(2);
      done();
    })
  })

  it('返回promise', () => {
    new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 100)
    }).then((value: any) => {
      expect(value).toBe(1);
      return new MyPromise((resolve) => {
        setTimeout(() => {
          resolve(2);
        }, 100)
      })
    }).then((value: any) => {
      expect(value).toBe(2);
    })
  })

  it('多个then回调', () => {
    const promise = new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 100)
    }).then((value: any) => {
      expect(value).toBe(1);
      return 2
    }).then((value: any) => {
      expect(value).toBe(2);
    })

    promise.then((value: any) => {
      expect(value).toBe(1);
      return 3
    }).then((value: any) => {
      expect(value).toBe(3);
    })
  })

  it('不能循环调用', () => {
    const promise1 = new MyPromise((resolve) => {
      resolve(1)
    });
    const promise2 = promise1.then(() => {
      return promise1;
    })
    promise2.then(null, (reason) => {
      expect(reason).toThrowError('循环调用');
    })
  })

  it('支持类Promise返回', () => {
    new MyPromise((resolve) => {
      resolve(1);
    }).then(() => {
      return { then(resolveFn: Function) { resolveFn(2) } }
    }).then((val) => {
      expect(val).toBe(2);
    })
  })

  it('支持静态方法 resolve', () => {
    expect(MyPromise.resolve(1)).resolves.toBe(1);
  })

  it('支持静态方法 reject', () => {
    expect(MyPromise.reject(new Error())).rejects.toThrow();
  })

  describe('支持静态方法 all', () => {
    test('resolve', (done) => {
      MyPromise.all([
        MyPromise.resolve(1),
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve(2)
          }, 100);
        }),
        MyPromise.resolve(3)
      ]).then((values) => {
        expect(values).toHaveLength(3);
        values.forEach((value: number, index: number): void => {
          expect(value).toBe(index + 1);
        });
        done();
      })
    })

    test('reject', () => {
      MyPromise.all([
        MyPromise.resolve(1),
        MyPromise.reject(2),
        MyPromise.reject(3)
      ]).catch((reason) => {
        expect(reason).toBe(2);
      })

      MyPromise.all([
        MyPromise.resolve(1),
        new MyPromise((_, reject) => {
          setTimeout(() => reject(2), 0)
        }),
        MyPromise.reject(3)
      ]).catch((reason) => {
        expect(reason).toBe(3);
      })
    })
  })

  describe('支持静态方法 race', () => {
    test('resolve', () => {
      MyPromise.race([
        MyPromise.resolve(1),
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve(2)
          }, 100);
        })
      ]).then((value) => {
        expect(value).toBe(1);
      });

      MyPromise.race([
        new MyPromise((resolve) => {
          setTimeout(() => {
            resolve(1)
          }, 100);
        }),
        MyPromise.resolve(2)
      ]).then((value) => {
        expect(value).toBe(2);
      })
    })

    test('reject', () => {
      MyPromise.all([
        MyPromise.reject(1),
        MyPromise.reject(2)
      ]).catch((reason) => {
        expect(reason).toHaveLength(1);
      })

      MyPromise.race([
        new MyPromise((_, reject) => {
          setTimeout(() => {
            reject(1)
          }, 100);
        }),
        MyPromise.reject(2)
      ]).then((reason) => {
        expect(reason).toBe(2);
      })
    })
  })
})