import AcceptorNode from '../../src/AcceptorNode';
import Message from '../../src/core/Message';
import Multicast from '../../src/Multicast';
import SystemConfig from '../../src/Config';

let acceptorNode;
let multicastSender;

let proposerGroup = SystemConfig.getMulticastGroup('proposers');
let acceptorGroup = SystemConfig.getMulticastGroup('acceptors');

let proposerHost = (SystemConfig.getGroup('proposers'))[0];
describe('AcceptorNode test suite', () => {
  before(done => {
    acceptorNode = new AcceptorNode({
      multicast: acceptorGroup,
      id: 100
    });
    multicastSender = new Multicast.Sender(proposerGroup);
    Promise.all([acceptorNode.start(), multicastSender.start()])
      .then(() => done());
  });

  after(done => {
    Promise.all([acceptorNode.stop(), multicastSender.stop()])
      .then(() => done());
  });

  it('should be able to start Acceptor Node', () => {
    expect(acceptorNode.id).to.be.equal(100);
  });

  it('should be able to listen to prepare message', done => {
    let prepare = new Message.Prepare(9999, 0, proposerHost.id);
    multicastSender.send(acceptorGroup, prepare);
    // TODO: check if onPrepare called
    done();
  });

  it('should be able to listen to accept message', done => {
    let accept = new Message.Accept(9999, 0, 3, 10);
    multicastSender.send(acceptorGroup, accept);
    // TODO: check if onAccept called
    done();
  });
});
