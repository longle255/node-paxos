import chai from 'chai';
import AtomicMulticastAdapter from '../../src/multicast/AtomicMulticastAdapter';

let should = chai.should();

describe('AtomicMulticastAdapter test suite', () => {
  it('should be able to instantiate class MulticastAdapterInterface', () => {
    (() => {
      new AtomicMulticastAdapter();
    }).should.not.throw(Error);
  });

  it('should not be able to call abstract method', () => {
    // should not be able to run abstract funciton
    (() => {
      new AtomicMulticastAdapter().recive();
    }).should.throw(Error);
  });

  it('should not be able to call extended method', () => {
    // should not be able to run abstract funciton
    (() => {
      new AtomicMulticastAdapter().multicast();
    }).should.not.throw(Error);
  });
});
