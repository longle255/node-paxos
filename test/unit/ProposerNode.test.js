import ProposerNode from '../../src/ProposerNode';
import Message from '../../src/core/Message';
import Multicast from '../../src/Multicast';
import SystemConfig from '../../src/Config';

let proposerNode;
let multicastSender;

let proposerGroup = SystemConfig.getMulticastGroup('proposers');
let clientGroup = SystemConfig.getMulticastGroup('clients');

describe('ProposerNode test suite', () => {
  before(done => {
    proposerNode = new ProposerNode({
      multicast: proposerGroup,
      id: 10001,
      quorum: 1
    });

    multicastSender = new Multicast.Sender(clientGroup);
    Promise.all([proposerNode.start(), multicastSender.start()])
      .then(() => done());
  });

  after(done => {
    Promise.all([proposerNode.stop(), multicastSender.stop()])
      .then(() => done());
  });

  it('should be able to start Acceptor Node', () => {
    expect(proposerNode.id).to.be.equal(10001);
  });

  it('should be able to listen to request message', done => {
    let prepare = new Message.Request(100);
    multicastSender.send(proposerGroup, prepare);
    // TODO: check if onRequet called
    done();
  });

  it('should be able to listen to promise message', done => {
    let promise = new Message.Promise(3, 1, 0, null, 1);
    multicastSender.send(proposerGroup, promise);
    // TODO: check if onPromise called
    done();
  });
});
