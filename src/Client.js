import uuid from 'node-uuid';
import { Receiver, Sender } from './Multicast';

let uid = uuid.v4();
let logger = NodePaxos.logger.getLogger('client-' + uid.substr(0, 4));
export default class Client {
  constructor(options) {
    this.uuid = uid;
    this.config = options;
    this.socket = {
      listener: new Receiver(this.config.clients),
      sender: new Sender(this.config.coordinators)
    };
    this.socket.sender.setDestination(this.config.coordinators);
    this.currentRound = 0;
  }

  start() {
    return Promise.all([this.socket.sender.start(), this.socket.listener.start()]);
  }

  propose(message) {
    logger.debug(`proposing value ${message}`);
    this.socket.sender.broadcast({
      type: 'propose',
      data: message
    });
  }
}
