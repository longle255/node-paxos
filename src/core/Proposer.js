import Message from './Message';
import Logger from '../logger';

let log = Logger.getLogger(module);

export default class Coordinator {
  constructor(options) {
    this.id = options.id;
    this.isLeader = false;
    this.leader = null;
    this.requestQueue = [];
    this.proposeId = 0;
    this.backlog = {};
    this.quorum = options.quorum;
  }

  addRequest(message) {
    this.requestQueue.push(message);
  }

  getNextRequest() {
    return this.requestQueue.shift();
  }

  getNextPrepare() {
    this.proposeId++;
    return new Message.Prepare(this.proposeId, 0, this.id);
  }

  getAccept(message) {
    // store promise of all acceptor
    let msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
      proposeId: message.proposeId,
      votedRound: message.votedRound,
      votedValue: message.votedValue,
      round: message.round
    };
    // save acceptor id to the array of promised acceptors of that promiseid
    if (msg.promisedAcceptors && msg.promisedAcceptors.indexOf(message.acceptorId) < 0) {
      msg.promisedAcceptors.push(message.acceptorId);
    } else {
      msg.promisedAcceptors = [message.acceptorId];
    }

    // update votedRound and votedValue regarding to new value in the promise message
    if (msg.round === message.round) {
      if (msg.votedRound < message.votedRound) {
        msg.votedRound = message.votedRound;
        msg.votedValue = message.votedValue;
      }
    } else {
      log.warn('what is going on here? how can I get here?');
    }
    // check if quorum of acceptor promise
    if (msg.promisedAcceptors.length >= this.quorum) {
      // set votedValue for the first round
      if (!msg.votedValue) {
        let request = this.getNextRequest();
        msg.votedValue = request.data;
      }
      return new Message.Accept(msg.proposeId, msg.round, msg.votedValue, this.id);
    }
  }
}
