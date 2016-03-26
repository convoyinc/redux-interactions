import * as chai from 'chai';

// Clean up mocha stack traces.
import 'mocha-clean';

// # Chai

// We prefer Chai's `expect` interface.
global.expect = chai.expect;
// Give us all the info!
chai.config.truncateThreshold = 0;
