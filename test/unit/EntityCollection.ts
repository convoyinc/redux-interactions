import * as redux from 'redux';

import { EntityCollection, combineInteractions } from '../../src';

describe(`EntityCollection`, () => {

  class Model {
    static toModel(data:{}):Model {
      Object.setPrototypeOf(data, this.prototype);
      return data;
    }
  }

  class Collection extends EntityCollection<Model> {
    Model:typeof Model = Model;
  }

  let instance, store;
  beforeEach(() => {
    instance = new Collection();

    const reducer = combineInteractions({
      entities: {collection: instance},
    });
    store = redux.createStore(reducer);
  });

  describe(`transformState`, () => {

    it(`transforms entities`, () => {
      const state = {
        entities: {
          collection: {
            1: {id: 1, value: 11},
            2: {id: 2, value: 22},
          },
        },
      };
      const transformed = instance.transformState(state);

      expect(transformed.entities.collection['1']).to.be.an.instanceOf(Model);
      expect(transformed.entities.collection['2']).to.be.an.instanceOf(Model);
    });

    it(`doesn't mind if there are no entities`, () => {
      const state = {};
      const transformed = instance.transformState(state);
      expect(transformed).to.equal(state);
    });

  });

  describe(`getAll`, () => {

    it(`retrieves the entity map`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      expect(instance.getAll(store.getState())).to.deep.equal({
        1: {id: 1, value: 11},
        2: {id: 2, value: 22},
      });
    });

    it(`returns an empty object if there is no state`, () => {
      expect(instance.getAll(store.getState())).to.deep.equal({});
    });

  });

  describe(`getAllIds`, () => {

    it(`retrieves all entity identities`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      expect(instance.getAllIds(store.getState())).to.deep.equal(['1', '2']);
    });

    it(`returns an array object if there is no state`, () => {
      expect(instance.getAllIds(store.getState())).to.deep.equal([]);
    });

  });

  describe(`getById`, () => {

    it(`retrieves individual entities`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      expect(instance.getById(store.getState(), '2')).to.deep.equal({id: 2, value: 22});
    });

    it(`returns null if there is no state`, () => {
      expect(instance.getById(store.getState(), '2')).to.equal(null);
    });

  });

  function commonSetBehavior(actionName:string):void {
    it(`adds entities to the collection`, () => {
      store.dispatch(instance[actionName]([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      expect(instance.getAll(store.getState())).to.deep.equal({
        1: {id: 1, value: 11},
        2: {id: 2, value: 22},
      });
    });

    it(`coerces entities to be models`, () => {
      store.dispatch(instance[actionName]([{id: 1, value: 11}]));
      expect(instance.getById(store.getState(), '1')).to.be.an.instanceOf(Model);
    });

    it(`preserves object references if there is no change`, () => {
      store.dispatch(instance[actionName]([{id: 1, value: 11}]));
      const entity = instance.getById(store.getState(), '1');
      store.dispatch(instance[actionName]([{id: 1, value: 11}]));

      expect(entity).to.equal(instance.getById(store.getState(), '1'));
      store.dispatch(instance[actionName]([{id: 1, value: 10}]));
      expect(entity).to.not.equal(instance.getById(store.getState(), '1'));
    });

    it(`preserves the entire state object if nothing changed`, () => {
      store.dispatch(instance[actionName]([{id: 1, value: 11}]));
      const state = instance.getAll(store.getState());
      store.dispatch(instance[actionName]([{id: 1, value: 11}]));

      expect(state).to.equal(instance.getAll(store.getState()));
      store.dispatch(instance[actionName]([{id: 1, value: 10}]));
      expect(state).to.not.equal(instance.getAll(store.getState()));
    });
  }

  describe(`setAll`, () => {
    commonSetBehavior('setAll');

    it(`overwrites any other entities in the collection`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      store.dispatch(instance.setAll([
        {id: 2, value: 22},
        {id: 3, value: 33},
      ]));

      expect(instance.getAll(store.getState())).to.deep.equal({
        2: {id: 2, value: 22},
        3: {id: 3, value: 33},
      });
    });

  });

  describe(`set`, () => {
    commonSetBehavior('set');

    it(`preserves any other entities in the collection`, () => {
      store.dispatch(instance.set([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      store.dispatch(instance.set([
        {id: 2, value: 22},
        {id: 3, value: 33},
      ]));

      expect(instance.getAll(store.getState())).to.deep.equal({
        1: {id: 1, value: 11},
        2: {id: 2, value: 22},
        3: {id: 3, value: 33},
      });
    });

  });

  describe(`update`, () => {

    it(`updates existing entities`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      store.dispatch(instance.update({id: 1, value: 20}));
      expect(instance.getAll(store.getState())).to.deep.equal({
        1: {id: 1, value: 20},
        2: {id: 2, value: 22},
      });
    });

    it(`preserves object references if nothing changed`, () => {
      store.dispatch(instance.set([{id: 1, value: 11}]));
      const entity = instance.getById(store.getState(), '1');
      store.dispatch(instance.update([{id: 1}]));

      expect(entity).to.equal(instance.getById(store.getState(), '1'));
      store.dispatch(instance.update([{id: 1, more: 'abc1223'}]));
      expect(entity).to.not.equal(instance.getById(store.getState(), '1'));
    });

  });

  describe(`delete`, () => {

    it(`removes entities`, () => {
      store.dispatch(instance.setAll([
        {id: 1, value: 11},
        {id: 2, value: 22},
      ]));
      store.dispatch(instance.delete('2'));
      expect(instance.getAll(store.getState())).to.deep.equal({
        1: {id: 1, value: 11},
      });
    });

  });

});
