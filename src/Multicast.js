import dgram from 'dgram';

export class Receiver {
  constructor(options) {
    this.logger = NodePaxos.logger.getLogger('multicast');
    this.logger.debug('starting RECEIVER component ', options);
    this.config = {
      address: options.address,
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
      this.logger.error('server error:\n' + err.stack);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      this.logger.debug(`got message ${msg} from group ${rinfo.address}:${rinfo.port}`);
      let message = msg.toString('utf8');
      try {
        message = JSON.parse(message);
      } catch (e) {
        this.logger.error('can\'t parse message ${message}');
        return;
      }
      if (!message.type || !message.data || !this.handlers.hasOwnProperty(message.type)) {
        this.logger.error('not paxos message type');
        return;
      }
      this.handlers[message.type](message.data, rinfo);
    });

    return new Promise((resolve, reject) => {
      try {
        this.server.bind(this.config.port, () => {
          this.logger.info(`RECEIVER bind success on ${this.config.address}:${this.config.port}`);
          this.server.addMembership(this.config.address);
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
    this.logger = NodePaxos.logger.getLogger('multicast');
    this.logger.debug('starting SENDER component ', options);
    this.config = {
      address: options.address,
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
          this.logger.info(`SENDER bind success on ${this.config.address}:${this.config.port}`);
          this.server.setTTL(128);
          this.server.setBroadcast(true);
          this.server.setMulticastTTL(128);
          this.server.setMulticastLoopback(true);
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
      this.logger.error('invalid message');
      throw new Error('invalid message');
    }
    if (!this.isRunning) {
      this.logger.error('service is not running');
      throw new Error('service is not running');
    }
    if (!dest) {
      this.logger.error('destinationGroup is not set');
      throw new Error('destinationGroup is not set');
    }

    var serializedMessage = new Buffer(JSON.stringify(message));
    this.server.send(serializedMessage, 0, serializedMessage.length, dest.port, dest.address);
    this.logger.debug(`broadcast message ${message} to the group ${dest.address}:${dest.port}`);
  }

  send(dest, message) {
    if (!this.isRunning) {
      this.logger.error('service is not running');
      throw new Error('service is not running');
    }
    if (arguments.length < 2) {
      this.logger.error('requires 2 arguments');
      throw new Error('requires 2 arguments');
    }
    var serializedMessage = new Buffer(JSON.stringify(message));
    this.server.send(serializedMessage, 0, serializedMessage.length, dest.port, dest.address);
    this.logger.debug(`send message ${message} to the destination ${dest.address}:${dest.port}`);
  }
}
