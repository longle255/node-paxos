import uuid from 'node-uuid';
import {
  Receiver, Sender
}
from './Multicast';

export default class Acceptor {
  constructor(options) {
    let uid = uuid.v4();
    this.logger = NodePaxos.logger.getLogger('acceptors-' + uid.substr(0, 4));
    this.id = uid;
    this.config = options;
    this.socket = {
      listener: new Receiver(this.config.acceptors), // listen on channel of acceptors
      coordinatorSender: new Sender(this.config.coordinators) // broad cast message to coordinator channel
    };
    this.socket.coordinatorSender.setDestination(this.config.coordinators);
    this.socket.listener.addListener('accept', this.onAccept.bind(this));
    this.socket.listener.addListener('prepare', this.onPrepare.bind(this));

    this.payload = {};
  }

  start() {
    this.logger.debug('attemp to start Acceptor' + this.id);
    return Promise.all([this.socket.coordinatorSender.start(), this.socket.listener.start()]);
  }

  onAccept(message, source) {
    this.logger.debug(`receive accept message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    let instance = this.payload[message.proposeId];
    if (instance.round <= message.round) {
      instance.round = message.round;
      instance.votedRound = message.round;
      instance.votedValue = message.votedValue;
      instance.acceptorId = this.id;
      let accept = {
        type: 'accepted',
        data: instance
      };
      this.logger.debug(`sending accepted message [${accept.type} | ${accept.data.proposeId} | ${accept.data.round}| ${accept.data.votedRound} | ${accept.data.votedValue}]`);
      // send accept messsage to the coordinator
      this.socket.coordinatorSender.broadcast(accept);
    }
  }

  onPrepare(message, source) {
    this.logger.debug(`receive prepare message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    this.payload[message.proposeId] = this.payload[message.proposeId] || {
      round: 0,
      votedRound: 0,
      votedValue: null,
      proposeId: message.proposeId
    };

    let instance = this.payload[message.proposeId];

    if (instance.round <= message.round) {
      instance.round = message.round;
      let promise = {
        type: 'promise',
        data: {
          round: instance.round,
          votedRound: instance.votedRound,
          votedValue: instance.votedValue,
          acceptorId: this.id,
          proposeId: instance.proposeId
        }
      };
      this.logger.debug(`sending promise message [${promise.type} | ${promise.data.proposeId} | ${promise.data.votedRound} | ${promise.data.votedValue}]`);
      // send accept messsage to the coordinator
      this.socket.coordinatorSender.broadcast(promise);
    }
  }
}