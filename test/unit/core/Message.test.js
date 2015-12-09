import Message from '../../../src/core/Message';

describe('Message test suite', () => {
  it('class Message.RequestVote should be functional', () => {
    let message = [Message.TYPE.PROPOSER.REQUEST_VOTE, 10];
    expect(() => {
      let prepare = new Message.RequestVote(10);
      expect(prepare.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.RequestVote.parse([0])).to.be.eql(null);
    expect(Message.RequestVote.parse([1, 1])).to.be.eql(null);
    expect(Message.RequestVote.parse(message)).to.be.eql({
      type: Message.TYPE.PROPOSER.REQUEST_VOTE,
      proposerId: 10
    });
  });

  it('class Message.Vote should be functional', () => {
    let message = [Message.TYPE.PROPOSER.VOTE, 10, true];
    expect(() => {
      let prepare = new Message.Vote(10, true);
      expect(prepare.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Vote.parse([0, 1])).to.be.eql(null);
    expect(Message.Vote.parse([1, 1, 2])).to.be.eql(null);
    expect(Message.Vote.parse(message)).to.be.eql({
      type: Message.TYPE.PROPOSER.VOTE,
      proposerId: 10,
      granted: true
    });
  });

  it('class Message.Prepare should be functional', () => {
    let message = [Message.TYPE.PROPOSER.PREPARE, 1, 2, 10];
    expect(() => {
      let prepare = new Message.Prepare(1, 2, 10);
      expect(prepare.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Prepare.parse([0, 1])).to.be.eql(null);
    expect(Message.Prepare.parse([1, 1, 2, 10])).to.be.eql(null);
    expect(Message.Prepare.parse(message)).to.be.eql({
      type: Message.TYPE.PROPOSER.PREPARE,
      proposeId: 1,
      round: 2,
      proposerId: 10
    });
  });

  it('class Message.Accept should be functional', () => {
    let message = [Message.TYPE.PROPOSER.ACCEPT, 1, 2, 3, 10];
    expect(() => {
      let accept = new Message.Accept(1, 2, 3, 10);
      expect(accept.round).to.be.eql(2);
      expect(accept.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Accept.parse(message)).to.be.eql({
      type: Message.TYPE.PROPOSER.ACCEPT,
      proposeId: 1,
      round: 2,
      value: 3,
      proposerId: 10
    });
  });

  it('class Message.Promise should be functional', () => {
    let message = [Message.TYPE.ACCEPTOR.PROMISE, 1, 2, 3, 4, 5];
    expect(() => {
      let promise = new Message.Promise(1, 2, 3, 4, 5);
      expect(promise.round).to.be.eql(2);
      expect(promise.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Promise.parse(message)).to.be.eql({
      type: Message.TYPE.ACCEPTOR.PROMISE,
      proposeId: 1,
      round: 2,
      votedRound: 3,
      votedValue: 4,
      acceptorId: 5
    });
  });

  it('class Message.Accepted should be functional', () => {
    let message = [Message.TYPE.ACCEPTOR.ACCEPTED, 1, 2, 3, 4];
    expect(() => {
      let accepted = new Message.Accepted(1, 2, 3, 4);
      expect(accepted.votedRound).to.be.eql(2);
      expect(accepted.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Accepted.parse(message)).to.be.eql({
      type: Message.TYPE.ACCEPTOR.ACCEPTED,
      proposeId: 1,
      votedRound: 2,
      votedValue: 3,
      acceptorId: 4
    });
  });

  it('class Message.Request should be functional', () => {
    let message = [Message.TYPE.CLIENT.REQUEST, 100];
    expect(() => {
      let request = new Message.Request(100);
      expect(request.data).to.be.eql(100);
      expect(request.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Request.parse(message)).to.be.eql({
      type: Message.TYPE.CLIENT.REQUEST,
      data: 100
    });

    // request with object data
    message = [Message.TYPE.CLIENT.REQUEST, {
      a: 100
    }];
    expect(() => {
      let request = new Message.Request({
        a: 100
      });
      expect(request.data).to.be.eql({
        a: 100
      });
      expect(request.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Request.parse(message)).to.be.eql({
      type: Message.TYPE.CLIENT.REQUEST,
      data: {
        a: 100
      }
    });
  });

  it('class Message.Response should be functional', () => {
    let message = [Message.TYPE.LEARNER.RESPONSE, 1, 2];
    expect(() => {
      let response = new Message.Response(1, 2);
      expect(response.value).to.be.eql(2);
      expect(response.serialize()).to.be.eql(message);
    }).to.not.throw(Error);
    expect(Message.Response.parse(message)).to.be.eql({
      type: Message.TYPE.LEARNER.RESPONSE,
      proposeId: 1,
      value: 2
    });
  });

});
