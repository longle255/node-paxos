import Multicast from '../../src/Multicast';
import Logger from '../../src/Logger';

let logger = Logger.getLogger(module);
let multicastReceiver;
let multicastSender;

let testingGroup = {
  address: '239.0.0.1',
  port: 5000
};

describe('Multicast test suite', () => {

  after(done => {
    Promise.all([multicastReceiver.stop(), multicastSender.stop()])
      .then(() => done());
  });

  it('should be able to init multicastReceiver and multicastSender', () => {
    multicastReceiver = new Multicast.Receiver(testingGroup);
    multicastSender = new Multicast.Sender(testingGroup);
  });

  it('should be able to add listener', () => {
    multicastReceiver.addListener('test-message', (msg, rinfo) => {
      logger.debug(`got message from group ${msg} - ${rinfo}`);
    });
  });

  it('should throw error when broadcast message without starting server', () => {
    expect(() => {
      multicastSender.broadcast('test');
    }).to.throw(Error);
  });

  it('should be able to start multicastReceiver and multicastSender', done => {
    expect(() => {
      Promise.all([multicastSender.start(), multicastReceiver.start()])
        .then(function() {
          done();
        });
    }).to.not.throw(Error);
  });

  it('should be able to send and receive message', done => {
    multicastReceiver.addListener(1, (message, sender) => {
      logger.debug(`receive testing message ${message} from sender ${sender}`);
      expect(message).to.be.eql([1, 1, 2]);
      done();
    });
    multicastSender.send(testingGroup, [1, 1, 2]);
    // done();
  });
});
