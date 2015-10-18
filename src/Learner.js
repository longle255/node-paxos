import uuid from 'node-uuid';
import {
  Receiver, Sender
}
from './Multicast';

let uid = uuid.v4();
let logger = NodePaxos.logger.getLogger('learner-' + uid.substr(0, 4));
export default class Learner {
  constructor(options) {
    this.uuid = uid;
    this.config = options;
    this.socket = {
      listener: new Receiver(this.config.learners)
    };
    this.socket.listener.addListener('deliver', this.onValueDelivered.bind(this));
    this.receivedMessages = 0;
  }

  start() {
    setInterval(() => logger.info(`learned ${this.receivedMessages} proposed value`), 1000);
    return Promise.all([this.socket.listener.start()]);
  }

  onValueDelivered(message, source) {
    logger.debug(`receiving deliver message [${message.proposeId} | ${message.votedValue}]`);
    this.receivedMessages += 1;
  }
}
