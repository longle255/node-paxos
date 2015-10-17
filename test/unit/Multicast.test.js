import chai from 'chai';
import {
  MulticastReceiver, MulticastSender
}
from '../../src/Multicast';

var logger = NodePaxos.logger.getLogger(module);
var multicastReceiver, multicastSender;

var testingGroup = {
  host: '239.0.0.1',
  port: 5000
};

describe('Multicast test suite', () => {
  it('should be able to init multicastReceiver and multicastSender', () => {
    multicastReceiver = new MulticastReceiver(testingGroup);
    multicastSender = new MulticastSender(testingGroup);
  });

  it('should be able to add listener', () => {
    multicastReceiver.addListener('test-message', (msg, rinfo) => {
      logger.debug(`got message from group ${msg} - ${rinfo}`);
    });
  });

  it('should throw error when broadcast message without starting server', () => {
    (() => {
      multicastSender.broadcast('test');
    }).should.throw(Error);
  });

  it('should be able to start multicastReceiver and multicastSender', done => {
    (() => {
      Promise.all([multicastSender.start(), multicastReceiver.start()])
        .then(function() {
          done();
        });
    }).should.not.throw(Error);
  });

  it('should throw error when broadcast message without destinationGroup set or invalid message type', () => {
    (() => {
      multicastSender.broadcast('will not be sent');
    }).should.throw(Error);
    multicastSender.setDestination(testingGroup);
    (() => {
      multicastSender.broadcast({
        test: 'will not be sent too'
      }).should.throw(Error);
    }).should.throw(Error);

  });

  it('should be able to send and receive message', done => {
    multicastReceiver.addListener('test', (message, sender) => {
      logger.debug(`receive testing message ${message} from sender ${sender}`);
      message.should.equal(123);
      done();
    });
    multicastSender.setDestination(testingGroup);
    multicastSender.broadcast({
      type: 'test',
      data: 123
    });
  });
});
