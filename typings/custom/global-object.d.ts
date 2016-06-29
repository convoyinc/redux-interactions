import * as chai from 'chai';
import * as sinon from 'sinon';

declare global {
  module NodeJS {
    export interface Global {
      expect:typeof chai.expect;
      sandbox:sinon.SinonSandbox;
    }
  }
}
