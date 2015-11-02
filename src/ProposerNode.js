import Multicast from './Multicast';
import Proposer from './core/Proposer';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';

let log = Logger.getLogger(module);
export default class ProposerNode extends Proposer {
  constructor(options) {
    super(options);
    this.address = options.address;
    this.port = options.port;
    this.multicast = {
      // listen on channel of acceptors
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    this.socket = {
      receiver: new Multicast.Receiver({
        address: this.address,
        port: this.port,
        isDirectChannel: true
      })
    };
    this.multicast.receiver.addListener(Message.TYPE.CLIENT.REQUEST, this.onRequest.bind(this));
    this.socket.receiver.addListener(Message.TYPE.ACCEPTOR.PROMISE, this.onPromise.bind(this));
  }

  start() {
    log.debug('attemp to start Proposer ' + this.id);
    return Promise.all([this.multicast.receiver.start(), this.socket.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    log.debug('attemp to stop Proposer ' + this.id);
    return Promise.all([this.multicast.receiver.stop(), this.socket.receiver.stop(), this.multicast.sender.stop()]);
  }

  onRequest(message, source) {
    message = Message.Request.parse(message);
    log.debug(`receive request message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    this.addRequest(message);
    this.processQueue();
  }

  processQueue() {
    if (this.requestQueue.length > 0) {
      process.nextTick(() => {
        var prepare = this.getNextPrepare();
        var dest = SystemConfig.getMulticastGroup('acceptors');
        log.debug(`sending prepare message ${JSON.stringify(prepare)} to ${JSON.stringify(dest)}`);
        this.multicast.sender.send(dest, prepare);
      });
    }
  }

  onPromise(message, source) {
    message = Message.Promise.parse(message);
    log.debug(`receive promise message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    var accept = this.getAccept(message);
    if (accept) { // got quorum of acceptors promise
      var dest = SystemConfig.getMulticastGroup('acceptors');
      log.debug(`sending accept message ${JSON.stringify(accept)} to ${JSON.stringify(dest)}`);
      this.multicast.sender.send(dest, accept);
    }
  }

}
