declare module 'chai-subset' {
  import '~chai/lib/Assertion';
  module '~chai/lib/Assertion' {
    interface Assertion {
      containSubset(subset:{}):Assertion;
    }
  }

  function chaiSubset(chai: any, utils: any): void;
  namespace chaiSubset { }
  export = chaiSubset;
}
