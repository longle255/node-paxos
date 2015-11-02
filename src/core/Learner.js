import Message from './Message';
import Logger from '../logger';

let log = Logger.getLogger(module);

export default class Learner {
  constructor(options) {
    this.id = options.id;
    this.quorum = options.quorum;
    this.backlog = {};
  }

  getDecide(message) {
    let msg = this.backlog[message.proposeId] = this.backlog[message.proposeId] || {
      isDelivered: false,
      proposeId: message.proposeId,
      value: message.votedValue,
      round: message.votedRound
    };
    if (!msg.isDelivered) {
      if (msg.round < message.votedRound) {
        msg.round = message.votedRound;
        msg.value = message.votedValue;
      } else if (msg.round === message.votedRound) {
        // save acceptor id to the array of promised acceptors of that promiseid
        if (msg.acceptedAcceptors && msg.acceptedAcceptors.indexOf(message.acceptorId) < 0) {
          msg.acceptedAcceptors.push(message.acceptorId);
        } else {
          msg.acceptedAcceptors = [message.acceptorId];
        }
        if (msg.acceptedAcceptors.length >= this.quorum) {
          msg.isDelivered = true;
          return this.deliver(msg);
        }
      }
      // discard message have lower round number
    }
  }

  deliver(message) {
    return new Message.Response(message.proposeId, message.value);
  }
}
