import Message from './Message';
import Logger from '../Logger';
import _ from 'lodash';

export default class Coordinator {
  constructor(options) {
    this.id = options.id;
    this.logger = Logger.getLogger(module, this.id);
    this.requestQueue = [];
    this.catchUpQueue = [];
    // this.isLeader = false;
    // this.leader = null;
    // this.votedFor = null;
    // this.votedTerm = null;
    // this.electionTerm = 0;
    // this.voteCount = 0;

    this.proposeId = options.minProposalId - 1;
    this.backlog = {};
    this.acceptorQuorum = options.acceptorQuorum;
    // this.state = PROPOSER_STATE.FOLLOWER;
  }

  addRequest(message) {
    this.requestQueue.push(message);
  }

  getNextRequest() {
    return this.requestQueue.shift();
  }

  getNextPrepare(proposeId) {
    if (!proposeId) {
      this.proposeId++;
      return new Message.Prepare(this.proposeId, 0, this.id);
    } else { // propose a catch up id
      if (this.backlog[proposeId]) {
        this.backlog[proposeId].promisedAcceptors = [];
      }
      return new Message.Prepare(proposeId, 0, this.id);
    }
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
      this.logger.warn('what is going on here? how can I get here?');
    }
    // check if acceptorQuorum of acceptor promise
    if (msg.promisedAcceptors.length >= this.acceptorQuorum) {
      // set votedValue for the first round
      if (!msg.votedValue) {
        let request = this.getNextRequest();
        msg.votedValue = request.data;
      }
      return new Message.Accept(msg.proposeId, msg.round, msg.votedValue, this.id);
    }
  }
}
