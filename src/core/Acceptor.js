import Message from './Message';
import Logger from '../Logger';

export default class Acceptor {
  constructor(options) {
    this.logger = Logger.getLogger(module);
    this.id = options.id;
    this.backlog = {};
    this.promises = {};
    this.accepted = {};
  }

  getAccepted(message) {
    let msg = this.backlog[message.proposeId];
    if (!msg) {
      return null;
    }
    if (msg.round <= message.round) {
      msg.votedRound = message.round;
      msg.votedValue = message.value;
      msg.acceptorId = this.id;
      return new Message.Accepted(msg.proposeId, msg.votedRound, msg.votedValue, this.id);
    }
  }

  getPromise(message) {
    let msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
      round: 0,
      votedRound: 0,
      votedValue: null,
      proposeId: message.proposeId,
      proposerId: message.proposerId
    };
    if (msg.round <= message.round) {
      msg.round = message.round;
      return new Message.Promise(msg.proposeId, msg.round, msg.votedRound, msg.votedValue, this.id, message.proposerId);
    }
    // TODO: return nack
    return null;
  }
}
