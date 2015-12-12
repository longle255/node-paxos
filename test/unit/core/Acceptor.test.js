import Acceptor from '../../../src/core/Acceptor';
import Message from '../../../src/core/Message';

let acceptor;
describe('Acceptor test suite', () => {

  beforeEach(() => {
    acceptor = new Acceptor({
      id: 1
    });
  });

  it('constructor should set correct value', () => {
    expect(acceptor.id).to.be.eql(1);
    expect(acceptor.backlog).to.be.eql({});
  });

  it('getPromise should return correct value', () => {
    let prepare = new Message.Prepare(1, 2, 10);
    let promise = acceptor.getPromise(prepare);
    expect(promise).to.be.exist;
    expect(promise).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      round: 2,
      proposeId: 1,
      votedRound: 0,
      votedValue: null,
      acceptorId: 1,
      proposerId: 10
    });

    expect(acceptor.backlog[1]).to.be.exist;
    expect(acceptor.backlog[1].round).to.be.eql(2);

    prepare = new Message.Prepare(1, 3, 10);
    promise = acceptor.getPromise(prepare);
    expect(promise).to.be.exist;
    expect(promise).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      round: 3,
      proposeId: 1,
      votedRound: 0,
      votedValue: null,
      acceptorId: 1,
      proposerId: 10
    });
    expect(acceptor.backlog[1]).to.be.exist;
    expect(acceptor.backlog[1].round).to.be.eql(3);

    prepare = new Message.Prepare(1, 1, 10);
    promise = acceptor.getPromise(prepare);
    expect(promise).to.be.not.exist;
  });

  it('getAccepted should return correct value', () => {
    // if there are no prepare message, obviously no accepted message return
    let accept = new Message.Accept(1, 2, 3, 10);
    let accepted = acceptor.getAccepted(accept);
    expect(accepted).to.be.not.exist;

    // Scenario 1: One proposer send prepare message...
    let prepare = new Message.Prepare(1, 2, 10);
    let promise = acceptor.getPromise(prepare);
    expect(promise).to.be.exist;
    expect(promise).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      proposeId: 1,
      round: 2,
      votedRound: 0,
      votedValue: null,
      acceptorId: 1,
      proposerId: 10
    });

    // Scenario 1: ...then send accept message
    accept = new Message.Accept(1, 2, 3, 10);
    accepted = acceptor.getAccepted(accept);
    expect(accepted).to.be.exist;
    expect(accepted).to.be.eql({
      type: Message.TYPE.ACCEPTOR.ACCEPTED,
      proposeId: 1,
      votedRound: 2,
      votedValue: 3,
      acceptorId: 1
    });

    // Scenario 2: another proposer try to send accept message for smaller round
    accept = new Message.Accept(1, 1, 3, 10);
    accepted = acceptor.getAccepted(accept);
    expect(accepted).to.be.not.exist;

    // Scenario 3: can another proposer send accept message with higher round?
    // => Can't happen since there must be a promise for that message
    // then the first proposer can't get the accept message????
    // accept = new Message.Accept(1, 3, 4);
    // accepted = acceptor.getAccepted(accept);
    // expect(accepted).to.be.exist;
    // expect(accepted).to.be.eql({
    //   type: Message.TYPE.ACCEPTOR.ACCEPTED,
    //   proposeId: 1,
    //   round: 2,
    //   votedRound: 2,
    //   votedValue: 3,
    //   acceptorId: 1
    // });
  });
});
