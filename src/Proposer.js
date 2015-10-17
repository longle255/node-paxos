let logger = NodePaxos.logger.getLogger('proposer');
import {
  MulticastReceiver, MulticastSender
}
from './Multicast';

export default class Proposer {
  constructor(options) {
    this.config = options;
    this.socket = {
      receiver: new MulticastReceiver(this.config.proposers),
      sender: new MulticastSender(this.config.proposers)
    };
    this.socket.sender.setDestination(this.config.coordinators);
  }

  start() {
    return Promise.all([this.socket.sender.start(), this.socket.receiver.start()]);
  }

  propose(message) {
    this.socket.sender.broadcast({
      type: 'propose',
      data: message
    });
  }
}
