import { Interactions, reducer, thunk } from '../../src';

describe(`thunk`, () => {

  it(`registers a thunk action creator`, () => {
    class Counter extends Interactions {
      @thunk
      doAdd({ amount }:any, { dispatch, _getState }:any):void {
        dispatch(this.add(amount));
      }

      @reducer
      add(scopedState:number, amount:number = 1):number {
        return scopedState + amount;
      }
    }
    const instance = new Counter();
    let val = 1;
    (instance.doAdd as any)({ amount: 5 })((action) => {
      val = instance.reducer(val, action);
    });

    expect(val).to.eq(6);
  });

  it(`complains if the decorated value isn't a simple method`, () => {
    expect(() => {
      class Counter extends Interactions {
        @thunk
        get add():number { return 123; }
      }
    }).to.throw(/@thunk/);

    expect(() => {
      class Counter extends Interactions {
        val:number;
        @thunk
        set add(val:number) { this.val = val; }
      }
    }).to.throw(/@thunk/);
  });

});
