import { Interactions } from '../../src';

describe(`Interactions`, () => {

  describe(`constructor`, () => {

    it(`defaults initialState to an empty object`, () => {
      const instance = new class Simple extends Interactions {};

      expect(instance.initialState).to.eql({});
      expect(Object.getPrototypeOf(instance.initialState)).to.equal(null);
    });

    it(`exposes the class by its name`, () => {
      class Simple extends Interactions {}
      const instance = new Simple;

      expect(instance['Simple']).to.equal(Simple);
    });

    it(`auto binds any methods declared on the class`, () => {
      class Autobind extends Interactions {
        notAMethod:string = 'abc123';
        doStuff():this { return this; }
      }
      const instance = new Autobind;
      const doStuff = instance.doStuff;

      expect(instance.doStuff()).to.equal(instance);
      expect(doStuff()).to.equal(instance);
      expect(instance.doStuff.call(null)).to.equal(instance);
      expect(instance.notAMethod).to.eql('abc123');
    });

  });

  describe(`.addInteractionReducer`, () => {

    it(`generates an action type constant`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      const instance = new Simple;

      expect(instance['ADD']).to.eql(`Simple:add`);
    });

    it(`ensures a globally unique action type`, () => {
      const s1 = class Simple extends Interactions {};
      s1.addInteractionReducer('add', s => s + 1);
      const s2 = class Simple extends Interactions {};
      s2.addInteractionReducer('add', s => s + 1);
      const instance1 = new s1;
      const instance2 = new s2;

      expect(instance1['ADD']).to.not.eql(instance2['ADD']);
    });

    it(`registers an interaction reducer`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      const instance = new Simple;

      expect(instance.reducer(1, {type: instance['ADD'], args: []})).to.eql(2);
    });

    it(`inherits interaction reducers`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      class SubSimple extends Simple {}
      const instance = new SubSimple;

      expect(instance.reducer(1, {type: instance['ADD'], args: []})).to.eql(2);
    });

    it(`allows overriding of inherited interaction reducers`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      class SubSimple extends Simple {}
      Simple.addInteractionReducer('add', s => s + 10);
      const instance = new SubSimple;

      expect(instance.reducer(1, {type: instance['ADD'], args: []})).to.eql(11);
    });

    it(`generates an action creator`, () => {
      class Simple extends Interactions {
        add:(...args:any[]) => any;
      }
      Simple.addInteractionReducer('add', s => s + 1);
      const instance = new Simple;

      expect(instance.add(1, 2)).to.eql({type: instance['ADD'], args: [1, 2]});
    });

  });

  describe(`#reducer`, () => {

    it(`works even without defined interaction reducers`, () => {
      const instance = new class Simple extends Interactions {};

      expect(instance.reducer(1, {type: 'foo'})).to.eql(1);
    });

    it(`honors initialState`, () => {
      const instance = new class Simple extends Interactions {
        initialState:number = 123;
      };

      expect(instance.reducer(undefined, {type: 'foo'})).to.eql(123);
      expect(instance.reducer(false, {type: 'foo'})).to.eql(false);
    });

    it(`doesn't explode on type collisions`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      const instance = new Simple;

      expect(instance.reducer(123, {type: instance['ADD']})).to.eql(123);
    });

    it(`passes args through to interaction reducers`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', (_s, _a, b) => b);
      const instance = new Simple;

      expect(instance.reducer(123, {type: instance['ADD'], args: [1, 2]})).to.eql(2);
    });

    it(`is callable when detached from its instance`, () => {
      class Simple extends Interactions {}
      Simple.addInteractionReducer('add', s => s + 1);
      const instance = new Simple;
      const reducer = instance.reducer;

      expect(reducer(1, {type: instance['ADD'], args: [1]})).to.eql(2);
    });

  });

  describe(`#scopedState`, () => {

    it(`returns scoped state`, () => {
      class Simple extends Interactions {
        mountPoint:string[] = ['a', 'b'];
      }
      const instance = new Simple;

      expect(instance.scopedState({a: {b: 1}})).to.eq(1);
    });

    it(`throws if mountPoint isn't set`, () => {
      class Simple extends Interactions {}
      const instance = new Simple;

      expect(() => {
        instance.scopedState({a: {b: 1}});
      }).to.throw(/mount/);
    });

  });

});
