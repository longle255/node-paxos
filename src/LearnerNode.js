import Multicast from './Multicast';
import Learner from './core/Learner';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';

let log = Logger.getLogger(module);
export default class LearnerNode extends Learner {
  constructor(options) {
    super(options);
    this.multicast = {
      // listen on channel of learners
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    this.multicast.receiver.addListener(Message.TYPE.ACCEPTOR.ACCEPTED, this.onAccepted.bind(this));
    this.acceptedCount = 0;
  }

  start() {
    log.debug('attempt to start Learner' + this.id);
    var tmp = 0;
    setInterval(() => {
      log.info(`rate ${this.acceptedCount - tmp} - ${this.acceptedCount} proposed value`);
      tmp = this.acceptedCount;
    }, 1000);
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  onAccepted(message, source) {
    message = Message.Accepted.parse(message);
    log.debug(`receive accepted message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    var decision = this.getDecide(message);
    if (decision) {
      log.debug(`decision ${JSON.stringify(decision)}`);
      this.acceptedCount += 1;
    }
  }

}
