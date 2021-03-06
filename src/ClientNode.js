import Multicast from './Multicast';
import Client from './core/Client';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';

let logger = Logger.getLogger(module);
export default class ClientNode extends Client {
  constructor(options) {
    super(options);
    this.multicast = {
      // listen on channel of learners
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    this.multicast.receiver.addListener(Message.TYPE.LEARNER.RESPONSE, this.onResponse.bind(this));
  }

  start() {
    logger.debug('attempt to start Client' + this.id);
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    logger.debug('attempt to stop Client' + this.id);
    return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
  }

  request(message) {
    var request = this.getRequest(message);
    var dest = SystemConfig.getMulticastGroup('proposers');
    logger.debug(`sending request message ${JSON.stringify(request)} to ${JSON.stringify(dest)}`);
    this.multicast.sender.send(dest, request);
  }

  onResponse(message, source) {
    message = Message.Response.parse(message);
    logger.debug(`receive response message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
  }
}
