import Learner from '../../../src/core/Learner';
import Message from '../../../src/core/Message';

let learner;
describe('Learner test suite', () => {

  beforeEach(() => {
    learner = new Learner({
      id: 1,
      quorum: 2
    });
  });

  it('constructor should set correct value', () => {
    expect(learner.id).to.be.eql(1);
    expect(learner.backlog).to.be.eql({});
  });

  it('should wait for quorum of acceptor', () => {
    let accepted = new Message.Accepted(1, 2, 3, 4); // pId 1, votedRound 2, value 3, acceptor 4
    let decided = learner.getDecide(accepted);
    expect(decided).to.be.not.exist;
  });

  it('should decide with quorum of 1', () => {
    learner.quorum = 1;
    let accepted = new Message.Accepted(1, 2, 3, 4); // pId 1, votedRound 2, value 3, acceptor 4
    let decided = learner.getDecide(accepted);
    expect(decided).to.be.eql({
      proposeId: 1,
      value: 3,
      type: Message.TYPE.LEARNER.RESPONSE
    });
  });

});
