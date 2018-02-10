import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import chaiSubset = require('chai-subset');

import { withMocha } from '../helpers';

import './base';

// # Chai

// ## http://chaijs.com/plugins/sinon-chai
//
// Adds assertions for sinon spies.  TL;DR:
//
//   * expect(aSpy).to.have.been.calledWith('abc', 123)
//
chai.use(sinonChai);

// ## http://chaijs.com/plugins/chai-subset
//
// Adds object subset assertions.  TL;DR:
//
//   * expect(anObject).to.containSubset({abc: 123})
//
chai.use(chaiSubset);

// # Sinon

withMocha(() => {

  beforeEach(() => {
    // Prefer accessing sinon via the `sandbox` global.
    global.sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    global.sandbox.restore();
    delete global.sandbox;
  });

});
