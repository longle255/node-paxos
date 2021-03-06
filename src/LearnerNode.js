import Multicast from './Multicast';
import Learner from './core/Learner';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';

export default class LearnerNode extends Learner {
  constructor(options) {
    super(options);
    this.logger = Logger.getLogger(module, this.id);
    this.multicast = {
      // listen on channel of learners
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    this.multicast.receiver.addListener(Message.TYPE.ACCEPTOR.ACCEPTED, this.onAccepted.bind(this));
    this.acceptedCount = 0;
    this.calRate = options.calRate || false;
    this.checkCatchUp = false;
    this.runningCatchUp = false;
    this.httpServer = null;

    this.latencyAggregate = 0;
    // this.setupHttpServer();
  }

  start() {
    this.logger.debug('attempt to start Learner' + this.id);
    var tmp = 0;
    if (this.calRate) {
      this.rateInterval = setInterval(() => {
        let rate = this.acceptedCount - tmp;
        let latency = this.latencyAggregate / rate;
        this.logger.info(`rate ${rate} proposed value, at latency ${latency.toFixed(2)}`);
        tmp = this.acceptedCount;
        this.latencyAggregate = 0;
      }, 1000);
    }
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    this.logger.debug('attempt to stop Learner' + this.id);
    if (this.rateInterval) {
      clearInterval(this.rateInterval);
    }
    return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
  }

  onAccepted(message, source) {
    message = Message.Accepted.parse(message);
    this.logger.debug(`receive accepted message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    var decision = this.getDecide(message);
    if (decision) {
      if (!this.checkCatchUp) {
        this.runCatchUp();
      }
      if (this.runningCatchUp && this.getMissingProposals().length === 0) { // finish catching up
        this.runningCatchUp = false;
        for (let i = this.minProposalId; i <= this.currentMaxProposalId; i++) {
          if (process.env.PAXOS_MODE === 'test') {
            console.log(this.delivered[i]);
          }
        }
      } else if (!this.runningCatchUp) {
        if (process.env.PAXOS_MODE === 'test') {
          console.log(decision.value);
        }
      }
      this.logger.debug(`decision ${JSON.stringify(decision)}`);
      if (this.calRate) {
        this.acceptedCount += 1;
        this.latencyAggregate += Date.now() - parseInt(decision.value, 10);
      }
    }
  }

  runCatchUp() {
    this.checkCatchUp = true;
    let missingProposals = this.getMissingProposals();
    if (missingProposals.length) {
      this.runningCatchUp = true;
      this.logger.debug('have to run catching up with those missing proposals ' + missingProposals);
      let dest = SystemConfig.getMulticastGroup('proposers');
      let message = new Message.CatchUp(missingProposals);
      this.multicast.sender.send(dest, message);
    }
  }
}
