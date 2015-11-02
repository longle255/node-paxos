import Logger from '../logger';
let log = Logger.getLogger(module);

const TYPE = {
  CLIENT: { // 1->99
    REQUEST: 1
  },
  PROPOSER: { // 101-199
    PREPARE: 101,
    ACCEPT: 102,
    DECIDE: 103
  },
  ACCEPTOR: { // 201-299
    PROMISE: 201,
    ACCEPTED: 202
  },
  LEARNER: { // 301-399
    RESPONSE: 301
  }
};

class Message {
  constructor() {
    if (this.constructor === Message) {
      throw new TypeError('Cannot construct Message instances directly');
    }
  }
  static parse() {
    throw new Error('Method is not implemented');
  }
  serialize() {
    throw new Error('Method is not implemented');
  }
}

class Prepare extends Message {
  constructor(proposeId, round, proposerId) {
    super();
    this.type = TYPE.PROPOSER.PREPARE;
    this.proposeId = proposeId;
    this.round = round;
    this.proposerId = proposerId;
  }
  static parse(message) {
    if (message.length !== 4) {
      log.debug('got invalid prepare message');
      return null;
    }
    if (message[0] !== TYPE.PROPOSER.PREPARE) {
      log.debug('got invalid prepare message type');
      return null;
    }
    return new Prepare(message[1], message[2], message[3]);
  }
  serialize() {
    return [this.type, this.proposeId, this.round, this.proposerId];
  }
}

class Accept extends Message {
  constructor(proposeId, round, value, proposerId) {
    super();
    this.type = TYPE.PROPOSER.ACCEPT;
    this.proposeId = proposeId;
    this.round = round;
    this.value = value;
    this.proposerId = proposerId;
  }
  static parse(message) {
    if (message.length !== 5) {
      log.debug('got invalid accept message');
      return null;
    }
    if (message[0] !== TYPE.PROPOSER.ACCEPT) {
      log.debug('got invalid accept message type');
      return null;
    }
    return new Accept(message[1], message[2], message[3], message[4]);
  }
  serialize() {
    return [this.type, this.proposeId, this.round, this.value, this.proposerId];
  }
}

class Promise extends Message {
  constructor(proposeId, round, votedRound, votedValue, acceptorId) {
    super();
    this.type = TYPE.ACCEPTOR.PROMISE;
    this.proposeId = proposeId;
    this.round = round;
    this.votedRound = votedRound;
    this.votedValue = votedValue;
    this.acceptorId = acceptorId;
  }
  static parse(message) {
    if (message.length !== 6) {
      log.debug('got invalid promise message');
      return null;
    }
    if (message[0] !== TYPE.ACCEPTOR.PROMISE) {
      log.debug('got invalid promise message type');
      return null;
    }
    return new Promise(message[1], message[2], message[3], message[4], message[5]);
  }
  serialize() {
    return [this.type, this.proposeId, this.round, this.votedRound, this.votedValue, this.acceptorId];
  }
}

class Accepted extends Message {
  constructor(proposeId, votedRound, votedValue, acceptorId) {
    super();
    this.type = TYPE.ACCEPTOR.ACCEPTED;
    this.proposeId = proposeId;
    this.votedRound = votedRound;
    this.votedValue = votedValue;
    this.acceptorId = acceptorId;
  }
  static parse(message) {
    if (message.length !== 5) {
      log.debug('got invalid promise message');
      return null;
    }
    if (message[0] !== TYPE.ACCEPTOR.ACCEPTED) {
      log.debug('got invalid promise message type');
      return null;
    }
    return new Accepted(message[1], message[2], message[3], message[4]);
  }
  serialize() {
    return [this.type, this.proposeId, this.votedRound, this.votedValue, this.acceptorId];
  }
}

class Request extends Message {
  constructor(data) {
    super();
    this.type = TYPE.CLIENT.REQUEST;
    this.data = data;
  }

  static parse(message) {
    if (message.length !== 2) {
      log.debug('got invalid client request');
      return null;
    }
    if (message[0] !== TYPE.CLIENT.REQUEST) {
      log.debug('got invalid client request type');
      return null;
    }
    return new Request(message[1]);
  }
  serialize() {
    return [this.type, this.data];
  }
}

class Response extends Message {
  constructor(proposeId, value) {
    super();
    this.type = TYPE.LEARNER.RESPONSE;
    this.proposeId = proposeId;
    this.value = value;
  }

  static parse(message) {
    if (message.length !== 3) {
      log.debug('got invalid client request');
      return null;
    }
    if (message[0] !== TYPE.LEARNER.RESPONSE) {
      log.debug('got invalid client request type');
      return null;
    }
    return new Response(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.proposeId, this.value];
  }
}

export default {
  Prepare, Accept, Promise, Accepted, Request, Response, TYPE
};
