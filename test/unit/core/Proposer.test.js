import Proposer from '../../../src/core/Proposer';
import Message from '../../../src/core/Message';

var proposer;
describe('Proposer test suite', () => {
  beforeEach(() => {
    proposer = new Proposer({
      id: 10,
      quorum: 2
    });
    let request = new Message.Request(100);
    proposer.addRequest(new Message.Request(100));
    proposer.addRequest(new Message.Request(200));
    proposer.addRequest(new Message.Request(300));
  });

  it('constructor should set correct value', () => {
    expect(proposer.id).to.be.eql(10);
    expect(proposer.backlog).to.be.eql({});
  });

  it('message queue manipulation should work', () => {
    expect(proposer.requestQueue.length).to.be.eql(3);
    expect(proposer.getNextRequest()).to.be.eql(new Message.Request(100));
    expect(proposer.requestQueue).to.be.eql([new Message.Request(200), new Message.Request(300)]);
  });

  it('should return getPrepare correct', () => {
    let prepare = proposer.getNextPrepare();
    expect(prepare).to.be.eql({
      proposeId: 1,
      proposerId: 10,
      type: Message.TYPE.PROPOSER.PREPARE,
      round: 0
    });
  });

  it('should return getAccept wait for quorum', () => {
    let prepare = proposer.getNextPrepare();
    let accept = proposer.getAccept(prepare);
    expect(accept).to.not.exist;
  });

  it('should return getAccept with quorum of 1', () => {
    proposer.quorum = 1;
    let prepare = proposer.getNextPrepare();
    let accept = proposer.getAccept(prepare);
    expect(accept).to.be.eql({
      proposeId: 1,
      proposerId: 10,
      type: Message.TYPE.PROPOSER.ACCEPT,
      round: 0,
      value: 100
    });
  });

  it('should return getAccept with quorum of 2', () => {
    let promise = new Message.Promise(3, 1, 0, null, 1);
    let accept = proposer.getAccept(promise);
    expect(accept).to.not.exist;
    // check value in proposer
    expect(proposer.backlog[3].promisedAcceptors.length).to.be.eql(1);
    promise = new Message.Promise(3, 1, 0, null, 2); // another promise from acceptor 2
    accept = proposer.getAccept(promise);
    expect(accept).to.be.eql({
      proposeId: 3,
      proposerId: 10,
      type: Message.TYPE.PROPOSER.ACCEPT,
      round: 1,
      value: 100
    });
  });

  it('should gen correct vote request message', () => {
    var message = proposer.getRequestVote();
    expect(message.proposerId).to.be.eql(10);
  });

  it('should accept vote request', () => {
    var requestVote = new Message.RequestVote(5, true);
    // var message
    //   expect(message.proposerId).to.be.eql(5);
    //   expect(message.granted).to.be.eql(true);
  });

  it('should not accept vote request', () => {
    // var message = new Message.RequestVote(6, true);
    // expect(message.proposerId).to.be.eql(6);
    // expect(message.granted).to.be.eql(false);
  });
});
