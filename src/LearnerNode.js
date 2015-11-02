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
    this.calRate = options.calRate || false;
  }

  start() {
    log.debug('attempt to start Learner' + this.id);
    var tmp = 0;
    if (this.calRate) {
      this.rateInterval = setInterval(() => {
        log.info(`rate ${this.acceptedCount - tmp} - ${this.acceptedCount} proposed value`);
        tmp = this.acceptedCount;
      }, 1000);
    }
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    log.debug('attempt to stop Learner' + this.id);
    if (this.rateInterval) {
      clearInterval(this.rateInterval);
    }
    return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
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
