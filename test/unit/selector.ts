import { Interactions, selector } from '../../src';

describe(`selector`, () => {

  it(`scopes to the interactions' mount point`, () => {
    class Foo extends Interactions {
      mountPoint:string[] = ['foo', 'bar'];
      @selector
      get(scopedState:any):any {
        return scopedState;
      }
    }
    const instance = new Foo;

    expect(instance.get({foo: {bar: 123}})).to.eq(123);
  });

  it(`handles dynamically changing mount points`, () => {
    class Foo extends Interactions {
      mountPoint:string[] = [];
      @selector
      get(scopedState:any):any {
        return scopedState;
      }
    }
    const instance = new Foo;

    instance.mountPoint = ['foo'];
    expect(instance.get({foo: 321})).to.eq(321);
  });

  it(`is auto bound to the interactions' instance`, () => {
    class Foo extends Interactions {
      mountPoint:string[] = ['foo', 'bar'];
      @selector
      get(scopedState:any):any {
        return scopedState;
      }
    }
    const instance = new Foo;
    const getFoo = instance.get;

    expect(getFoo({foo: {bar: 123}})).to.eq(123);
  });

});
