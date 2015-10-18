import dgram from 'dgram';
let logger = NodePaxos.logger.getLogger('multicast');

export class Receiver {
  constructor(options) {
    logger.debug('starting Receiver component ', options);
    this.config = {
      host: options.host,
      port: options.port
    };

    this.server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.isRunning = false;
    this.handlers = {};
  }

  addListener(messageType, handler) {
    this.handlers[messageType] = handler;
  }

  start() {
    this.server.on('error', err => {
      logger.error('server error:\n' + err.stack);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      logger.debug(`got message ${msg} from group ${rinfo.address}:${rinfo.port}`);
      let message = msg.toString('utf8');
      try {
        message = JSON.parse(message);
      } catch (e) {
        logger.error('can\'t parse message ${message}');
        return;
      }
      if (!message.type || !message.data || !this.handlers.hasOwnProperty(message.type)) {
        logger.error('not paxos message type');
        return;
      }
      this.handlers[message.type](message.data, rinfo);
    });

    return new Promise((resolve, reject) => {
      try {
        this.server.bind(this.config.port, () => {
          logger.info(`Receiver bind success on ${this.config.host}:${this.config.port}`);
          this.server.addMembership(this.config.host);
          this.isRunning = true;
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export class Sender {
  constructor(options) {
    logger.debug('starting Sender component ', options);
    this.config = {
      host: options.host,
      port: options.port,
      destinationGroup: options.destinationGroup
    };
    this.server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.isRunning = false;
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server.bind(this.config.port, () => {
          logger.info('server bind success');
          logger.info(`Sender bind success on ${this.config.host}:${this.config.port}`);
          this.server.setBroadcast(true);
          this.server.setMulticastTTL(128);
          this.isRunning = true;
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  setDestination(destinationGroup) {
    this.config.destinationGroup = destinationGroup;
  }

  broadcast(dest, message) {
    if (!message) {
      message = dest;
      dest = this.config.destinationGroup;
    }
    if (!message.type) {
      logger.error('invalid message');
      throw new Error('invalid message');
    }
    if (!this.isRunning) {
      logger.error('service is not running');
      throw new Error('service is not running');
    }
    if (!dest) {
      logger.error('destinationGroup is not set');
      throw new Error('destinationGroup is not set');
    }

    var serializedMessage = new Buffer(JSON.stringify(message));
    this.server.send(serializedMessage, 0, serializedMessage.length, dest.port, dest.host);
    logger.debug(`sent message ${message} to the group ${dest.host}:${dest.port}`);
  }
}
