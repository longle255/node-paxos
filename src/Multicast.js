import dgram from 'dgram';
import Logger from './Logger';

let log = Logger.getLogger(module);

class Receiver {
  constructor(options) {
    log.debug('starting RECEIVER component ', options);
    this.address = options.address;
    this.port = options.port;
    this.server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.isRunning = false;
    this.handlers = {};
    this.isDirectChannel = options.isDirectChannel || false;
  }

  addListener(messageType, handler) {
    this.handlers[messageType] = handler;
  }

  start() {
    this.server.on('error', err => {
      log.error('server error:\n' + err.stack);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      log.debug(`got message ${msg} from group ${rinfo.address}:${rinfo.port}`);
      let message = msg.toString('utf8');
      try {
        message = JSON.parse(message);
      } catch (e) {
        log.error(`can\'t parse message ${message}`);
        return;
      }
      if (!message.length || message.length <= 1) {
        log.error('not paxos message type');
        return;
      }
      if (!this.handlers[message[0]]) {
        log.error(`no handler for message type ${message[0]}`);
        return;
      }
      this.handlers[message[0]](message, rinfo);
    });

    return new Promise((resolve, reject) => {
      try {
        this.server.bind(this.port, () => {
          log.debug(`RECEIVER bind success on ${this.address}:${this.port}`);
          if (!this.isDirectChannel) {
            this.server.addMembership(this.address);
          }
          this.isRunning = true;
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

class Sender {
  constructor(options) {
    log.debug('starting SENDER component ', options);
    this.address = options.address;
    this.port = options.port;
    this.server = dgram.createSocket({
      type: 'udp4',
      reuseAddr: true
    });
    this.isRunning = false;
  }

  start() {
    return new Promise((resolve, reject) => {
      try {
        this.server.bind(this.port, () => {
          log.debug(`SENDER bind success on ${this.address}:${this.port}`);
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

  stop() {
    return new Promise((resolve, reject) => {
      this.server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  send(dest, message) {
    if (!this.isRunning) {
      log.error('service is not running');
      throw new Error('service is not running');
    }
    if (arguments.length < 2) {
      log.error('requires 2 arguments');
      throw new Error('requires 2 arguments');
    }
    if (typeof message.serialize === 'function') {
      message = message.serialize();
    }
    var serializedMessage = new Buffer(JSON.stringify(message));
    this.server.send(serializedMessage, 0, serializedMessage.length, dest.port, dest.address);
    log.debug(`send message ${message} to the destination ${dest.address}:${dest.port}`);
  }
}

export default {
  Sender, Receiver
};
