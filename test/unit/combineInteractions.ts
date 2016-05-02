import { Interactions, reducer, combineInteractions } from '../../src';

describe(`combineInteractions`, () => {

  class Foos extends Interactions {
    initialState:number = 1;
    @reducer
    add(scopedState:any, val:number):any {
      return scopedState + val;
    }
  };

  class Bars extends Interactions {
    initialState:number = 2;
    @reducer
    add(scopedState:any, val:number):any {
      return scopedState + val;
    }
  };

  it(`sets up all reducers`, () => {
    const reducer = combineInteractions({foos: new Foos(), bars: new Bars()});
    const state = reducer({}, {type: 'asdf'});
    expect(state).to.deep.equal({foos: 1, bars: 2});
  });

  it(`calls all reducers`, () => {
    const foos = new Foos();
    const bars = new Bars();
    const reducer = combineInteractions({foos, bars});
    let state = {};
    state = reducer(state, (<any>foos.add)(2));
    state = reducer(state, (<any>bars.add)(2));

    expect(state).to.deep.equal({foos: 3, bars: 4});
  });

  it(`allows for nested reducers`, () => {
    const foos = new Foos();
    const bars = new Bars();
    const reducer = combineInteractions({foos, nested: {bars}});
    let state = {};
    state = reducer(state, (<any>foos.add)(2));
    state = reducer(state, (<any>bars.add)(2));

    expect(state).to.deep.equal({foos: 3, nested: {bars: 4}});
  });

  it(`updates mountPoint on each interactions instance`, () => {
    const foos = new Foos();
    const bars = new Bars();
    combineInteractions({foos, nested: {bars}});

    expect(foos.mountPoint).to.deep.equal(['foos']);
    expect(bars.mountPoint).to.deep.equal(['nested', 'bars']);
  });

});
