import LearnerNode from '../../src/LearnerNode';
import Message from '../../src/core/Message';
import Multicast from '../../src/Multicast';
import SystemConfig from '../../src/Config';

let learnerNode;
let multicastSender;

let learnerGroup = SystemConfig.getMulticastGroup('learners');
let acceptorGroup = SystemConfig.getMulticastGroup('acceptors');

describe('LearnerNode test suite', () => {
  before(done => {
    learnerNode = new LearnerNode({
      multicast: learnerGroup,
      id: 10021,
      quorum: 1
    });

    multicastSender = new Multicast.Sender(acceptorGroup);
    Promise.all([learnerNode.start(), multicastSender.start()])
      .then(() => done());
  });
  after(done => {
    Promise.all([learnerNode.stop(), multicastSender.stop()])
      .then(() => done());
  });

  it('should be able to start Acceptor Node', () => {
    expect(learnerNode.id).to.be.equal(10021);
  });

  it('should be able to listen to message', done => {
    let accepted = new Message.Accepted(1, 2, 3, 4);
    multicastSender.send(learnerGroup, accepted);
    done();
  });
});
