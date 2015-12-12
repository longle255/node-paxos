import Acceptor from '../../../src/core/Acceptor';
import Client from '../../../src/core/Client';
import Learner from '../../../src/core/Learner';
import Proposer from '../../../src/core/Proposer';
import Message from '../../../src/core/Message';

describe('Integration test suite', () => {
  it('should run the happy path', () => {
    let proposer = new Proposer({
      id: 10,
      quorum: 2
    });
    let acceptor1 = new Acceptor({
      id: 21
    });
    let acceptor2 = new Acceptor({
      id: 22
    });
    let learner = new Learner({
      id: 30,
      quorum: 2
    });
    let client = new Client({
      id: 1
    });

    // step 1 client gen 3 request, send tp proposer
    let request = client.getRequest(100);
    expect(request.data).to.be.eql(100);
    proposer.addRequest(request);

    request = client.getRequest(200);
    proposer.addRequest(request);

    request = client.getRequest(300);
    proposer.addRequest(request);

    // proposer return prepare  with first request
    let prepare = proposer.getNextPrepare();
    expect(prepare).to.be.eql({
      proposeId: 1,
      proposerId: 10,
      type: Message.TYPE.PROPOSER.PREPARE,
      round: 0
    });

    // send prepare to acceptor
    // acceptor takes prepare and return promise
    let promise1 = acceptor1.getPromise(prepare);
    expect(promise1).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      round: 0,
      proposeId: 1,
      votedRound: 0,
      votedValue: null,
      acceptorId: 21,
      proposerId: 10
    });
    // so does acceptor 2
    let promise2 = acceptor2.getPromise(prepare);
    expect(promise2).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      round: 0,
      proposeId: 1,
      votedRound: 0,
      votedValue: null,
      acceptorId: 22,
      proposerId: 10
    });

    // proposer takes first promise, prepare accept message
    let accept = proposer.getAccept(promise1);
    expect(accept).to.not.exist;
    // and the second one
    accept = proposer.getAccept(promise2);
    expect(accept).to.be.eql({
      proposeId: 1,
      proposerId: 10,
      type: Message.TYPE.PROPOSER.ACCEPT,
      round: 0,
      value: 100
    });

    // acceptor 1 take accept message, prepare accepted message
    let accepted1 = acceptor1.getAccepted(accept);
    expect(accepted1).to.be.eql({
      type: Message.TYPE.ACCEPTOR.ACCEPTED,
      proposeId: 1,
      votedRound: 0,
      votedValue: 100,
      acceptorId: 21
    });
    // so does acceptor2
    let accepted2 = acceptor2.getAccepted(accept);
    expect(accepted2).to.be.eql({
      type: Message.TYPE.ACCEPTOR.ACCEPTED,
      proposeId: 1,
      votedRound: 0,
      votedValue: 100,
      acceptorId: 22
    });

    // learner takes first accepted
    let decided = learner.getDecide(accepted1);
    expect(decided).to.not.exist;
    // then the second one
    decided = learner.getDecide(accepted2);
    expect(decided).to.be.eql({
      proposeId: 1,
      value: 100,
      type: Message.TYPE.LEARNER.RESPONSE
    });

    //
  });
});
