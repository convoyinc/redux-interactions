/// <reference path="../main/ambient/chai/index.d.ts" />
/// <reference path="../main/ambient/sinon/index.d.ts" />

declare var expect:Chai.ExpectStatic;
declare var sandbox:Sinon.SinonSandbox;

declare module NodeJS {
  export interface Global {
    expect:Chai.ExpectStatic;
    sandbox:Sinon.SinonSandbox;
  }
}

declare module Chai {
  export interface Config {
    showDiff:boolean;
    truncateThreshold:number;
  }
}
