import Multicast from './Multicast';
import Acceptor from './core/Acceptor';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';

export default class AcceptorNode extends Acceptor {
  constructor(options) {
    super(options);

    this.id = options.multicast.id = options.id;
    this.multicast = {
      // listen on channel of acceptors
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    this.logger = Logger.getLogger(module, this.id);
    this.multicast.receiver.addListener(Message.TYPE.PROPOSER.ACCEPT, this.onAccept.bind(this));
    this.multicast.receiver.addListener(Message.TYPE.PROPOSER.PREPARE, this.onPrepare.bind(this));
  }

  start() {
    this.logger.debug(`attempt to start Acceptor ${this.id}`);
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    this.logger.debug(`attempt to stop Acceptor ${this.id}`);
    return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
  }

  onAccept(message, source) {
    message = Message.Accept.parse(message);
    this.logger.debug(`receive accept message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    var accepted = this.getAccepted(message);
    // var dest = SystemConfig.getNode(message.proposerId);
    var dest = SystemConfig.getMulticastGroup('learners');
    this.logger.debug(`sending accepted message ${JSON.stringify(accepted)} to ${JSON.stringify(dest)}`);
    this.multicast.sender.send(dest, accepted);

  }

  onPrepare(message, source) {
    // console.logger(`${Date.now()}-${JSON.stringify(source)}`);
    message = Message.Prepare.parse(message);
    this.logger.debug(`receive prepare message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    var promise = this.getPromise(message);
    // var dest = SystemConfig.getNode(message.proposerId);
    var dest = SystemConfig.getMulticastGroup('proposers');
    this.logger.debug(`sending promise message ${JSON.stringify(promise)} to ${JSON.stringify(dest)}`);
    this.multicast.sender.send(dest, promise);
  }
}
