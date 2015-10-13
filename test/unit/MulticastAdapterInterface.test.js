import chai from 'chai';
import MulticastAdapterInterface from '../../src/multicast/MulticastAdapterInterface';

let should = chai.should();

describe('MulticastAdapterInterface test suite', () => {
  it('should be not able to instantiate class MulticastAdapterInterface', () => {
    (() => {
      new MulticastAdapterInterface();
    }).should.throw(Error);
  });

  it('should be able to extend class MulticastAdapterInterface', () => {
    class MulticastAdapterImpl extends MulticastAdapterInterface {
      multicast(dest, message) {
        return true;
      }
    }
    // should be able to init class and run extended funciton
    new MulticastAdapterImpl().multicast().should.equal(true);

    // should not be able to run abstract funciton
    (() => {
      new MulticastAdapterImpl().recive();
    }).should.throw(Error);
  });
});
