import * as _ from 'lodash';
import * as nanoEqual from 'nano-equal';
import * as deepUpdate from 'deep-update';

import Interactions from './Interactions';
import reducer from './reducer';
import selector from './selector';

export type EntityMap<T> = {[key:string]:T};

export interface ModelConstructor {
  toModel(data:{}):{};
}

/**
 * Handles common behavior for a collection of entities.
 */
export default class EntityCollection<T> extends Interactions {

  /**
   * Ensures that all entities managed by the collection are instances of the
   * Model.
   *
   * You generally want to call this after restoring state, and before
   * initializing the store.
   */
  transformState(fullState:{}):{} {
    const entities:EntityMap<T> = this.getAll(fullState);
    if (_.size(entities) === 0) return fullState;

    const transformed = _.mapValues(entities, e => this.transform(e));
    return deepUpdate(fullState, this.mountPoint, {$set: transformed});
  }

  // Common Selectors

  @selector
  getAll(scopedState:EntityMap<T>):EntityMap<T> {
    return scopedState;
  }

  @selector
  getAllIds(scopedState:EntityMap<T>):string[] {
    return _.keys(scopedState);
  }

  @selector
  getById(scopedState:EntityMap<T>, id:string):T|void {
    return scopedState[id] || null;
  }

  // Common Reducers

  /**
   * Replaces _all_ entities currently in the collection with a new set.
   */
  @reducer
  setAll(scopedState:EntityMap<T>, entities:T|T[]):EntityMap<T> {
    if (!_.isArray(entities)) entities = [<T>entities];
    return this._transformAndIndexUpdates(entities, scopedState);
  }

  /**
   * Adds `entities` to the collection, overwriting their previous values, but
   * does not modify any other entities already in the collection.
   */
  @reducer
  set(scopedState:EntityMap<T>, entities:T|T[]):EntityMap<T> {
    if (!_.isArray(entities)) entities = [<T>entities];
    return this._transformAndIndexUpdates(entities, scopedState, true);
  }

  /**
   * Takes partial entities (deltas), and merges their data into the entities
   * already in the collection.
   *
   * Values are shallow merged.
   */
  @reducer
  update(scopedState:EntityMap<T>, deltas:T|T[]):EntityMap<T> {
    if (!_.isArray(deltas)) deltas = [<T>deltas];

    const entities = _.map(deltas, delta => {
      const identity = this.getIdentity(delta);
      const existing = scopedState[identity];
      if (!existing) {
        throw new Error(
          `${this.constructor.name}#update() was given an update for entity '${identity}', ` +
          `which does not exist in the collection`
        );
      }

      return <T>Object.assign({}, existing, delta);
    });

    return this._transformAndIndexUpdates(entities, scopedState, true);
  }

  @reducer
  delete(scopedState:EntityMap<T>, identities:string|string[]):EntityMap<T> {
    if (!_.isArray(identities)) identities = [<string>identities];
    return <EntityMap<T>>_.omitBy(scopedState, (_v, key) => _.includes(identities, key));
  }

  // Collection Configuration

  /**
   * If a model is specified, it will be used to transform entities into
   * instances of that model, rather than storing plain old objects.
   */
  Model:ModelConstructor = undefined;

  /**
   * Retrieves the identity of a particular entity.
   */
  getIdentity(entity:T):string {
    return (<any>entity).id;
  }

  /**
   * Determines whether two entities are equal (before transformation).
   */
  isEqual(entityA:T, entityB:T):boolean {
    return nanoEqual(entityA, entityB);
  }

  /**
   * Coerces entity data into an instance of its model.
   */
  transform(entity:T):T {
    if (!this.Model) return entity;
    return <T>this.Model.toModel(entity);
  }

  // Private

  /**
   * Constructs an EntityMap for `entities`, but is careful to only create new
   * objects where necessary.
   */
  _transformAndIndexUpdates(entities:T[], existingEntities:EntityMap<T>, includeExisting:boolean = false):EntityMap<T> {
    const indexed:EntityMap<T> = {};
    if (includeExisting) {
      Object.assign(indexed, existingEntities);
    }

    let changed = false;
    _.each(entities, entity => {
      const identity = this.getIdentity(entity);
      const existing = existingEntities[identity];

      if (this.isEqual(entity, existing)) {
        indexed[identity] = existing;
      } else {
        changed = true;
        indexed[identity] = this.transform(entity);
      }
    });

    if (!changed) {
      if (_.difference(_.keys(indexed), _.keys(existingEntities)).length === 0) {
        return existingEntities;
      }
    }

    return indexed;
  }

}
