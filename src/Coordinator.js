import uuid from 'node-uuid';
import {
  Receiver, Sender
}
from './Multicast';

let uid = uuid.v4();
let logger = NodePaxos.logger.getLogger('coordinators-' + uid.substr(0, 4));

export default class Coordinator {
  constructor(options) {
    this.id = uid;
    this.config = options;
    this.socket = {
      listener: new Receiver(this.config.coordinators), // listen on channel of coordinator
      acceptorSender: new Sender(this.config.acceptors),
      learnerSender: new Sender(this.config.learners)
    };
    this.socket.acceptorSender.setDestination(this.config.acceptors); // broadcast message to channel of acceptor
    this.socket.learnerSender.setDestination(this.config.learners); // broadcast message to channel of acceptor
    this.isLeader = false;
    this.leader = null;
    this.socket.listener.addListener('propose', this.onClientRequest.bind(this));
    this.socket.listener.addListener('promise', this.onAcceptorPromise.bind(this));
    this.socket.listener.addListener('accepted', this.onAcceptorAccepted.bind(this));
    this.messageQueue = [];
    this.currentIndex = 0;
    this.payload = [];
  }

  start() {
    return Promise.all([
      this.socket.listener.start(),
      this.socket.acceptorSender.start(),
      this.socket.learnerSender.start()
    ]);
  }

  onClientRequest(message, source) {
    logger.debug(`receive propose message ${JSON.stringify(message)} from ${source.host}:${source.port}`);
    this.messageQueue.push(message);
    this.sendPrepare();
  }

  onAcceptorPromise(message, source) {
    logger.debug(`receive promise message ${JSON.stringify(message)} from ${source.host}:${source.port}`);

    // store promise of all acceptor
    this.payload[message.proposeId] = this.payload[message.proposeId] || {
      proposeId: message.proposeId,
      votedRound: message.votedRound,
      votedValue: message.votedValue,
      round: message.round
    };

    let instance = this.payload[message.proposeId];

    // save acceptor id to the array of promised acceptors of that promiseid
    if (instance.promisedAcceptors && instance.promisedAcceptors.indexOf(message.acceptorId) < 0) {
      instance.promisedAcceptors.push(message.acceptorId);
    } else {
      instance.promisedAcceptors = [message.acceptorId];
    }

    // update votedRound and votedValue regarding to new value in the promise message
    if (instance.round === message.round) {
      if (instance.votedRound < message.votedRound) {
        instance.votedRound = message.votedRound;
        instance.votedValue = message.votedValue;
      }
    }

    // check if quorum of acceptor promise
    logger.debug(`got promises from ${instance.promisedAcceptors.length} in total of quorum of ${this.config.quorum}`);
    if (instance.promisedAcceptors.length >= this.config.quorum) {
      // set votedValue for the first round
      if (!instance.votedValue) {
        instance.votedValue = this.messageQueue.pop();
      }

      // send accept message (2A phase) to acceptors
      let accept = {
        type: 'accept',
        data: {
          proposeId: instance.proposeId,
          votedValue: instance.votedValue,
          votedRound: instance.votedRound,
          round: instance.round
        }
      };
      logger.debug(`sending accept message [${accept.type} | ${accept.data.proposeId} | ${accept.data.round} | ${accept.data.votedRound} | ${accept.data.votedValue}]`);
      this.socket.acceptorSender.broadcast(accept);
    }
    // this.currentIndex++;
  }

  onAcceptorAccepted(message, source) {
    logger.debug(`receiving accepted message [${message.proposeId} | ${message.round}| ${message.votedRound} | ${message.votedValue}]`);

    let instance = this.payload[message.proposeId];
    // save acceptor id to the array of promised acceptors of that promiseid
    if (instance.acceptedAcceptors && instance.acceptedAcceptors.indexOf(message.acceptorId) < 0) {
      instance.acceptedAcceptors.push(message.acceptorId);
    } else {
      instance.acceptedAcceptors = [message.acceptorId];
    }

    if (!instance.delivered && instance.acceptedAcceptors.length >= this.config.quorum) {
      this.deliver(instance);
      instance.delivered = true;
    }
  }

  sendPrepare() {
    let message = {
      type: 'prepare',
      data: {
        proposeId: this.currentIndex,
        round: 1
      }
    };
    this.socket.acceptorSender.broadcast(message);
    logger.debug(`sending prepare message [${message.type} | ${message.data.proposeId} | ${message.data.round}]`);
  }

  deliver(message) {
    let deliver = {
      type: 'deliver',
      data: message
    };
    logger.debug(`sending deliver message [${deliver.type} | ${deliver.data.votedValue}]`);
    this.socket.learnerSender.broadcast(deliver);

    //set index to next message
    this.currentIndex++;
  }
}
