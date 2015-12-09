import Logger from '../Logger';
let log = Logger.getLogger(module);

const TYPE = {
  CLIENT: { // 1->99
    REQUEST: 1
  },
  PROPOSER: { // 101-199
    PREPARE: 101,
    ACCEPT: 102,
    DECIDE: 103,
    REQUEST_VOTE: 104,
    VOTE: 105
  },
  ACCEPTOR: { // 201-299
    PROMISE: 201,
    ACCEPTED: 202
  },
  LEARNER: { // 301-399
    RESPONSE: 301
  }
};

function isValid(message, length, type) {
  if (message.length !== length) {
    log.debug('got invalid message length');
    return false;
  }
  if (message[0] !== type) {
    log.debug('got invalid message type');
    return false;
  }
  return true;
}

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

class RequestVote extends Message {
  constructor(proposerId) {
    super();
    this.type = TYPE.PROPOSER.REQUEST_VOTE;
    this.proposerId = proposerId;
  }
  static parse(message) {
    if (!isValid(message, 2, TYPE.PROPOSER.REQUEST_VOTE)) {
      return null;
    }
    return new RequestVote(message[1]);
  }
  serialize() {
    return [this.type, this.proposerId];
  }
}

class Vote extends Message {
  constructor(proposerId, granted) {
    super();
    this.type = TYPE.PROPOSER.VOTE;
    this.proposerId = proposerId;
    this.granted = granted;
  }
  static parse(message) {
    if (!isValid(message, 3, TYPE.PROPOSER.VOTE)) {
      return null;
    }
    return new Vote(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.proposerId, this.granted];
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
    if (!isValid(message, 4, TYPE.PROPOSER.PREPARE)) {
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
    if (!isValid(message, 5, TYPE.PROPOSER.ACCEPT)) {
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
    if (!isValid(message, 6, TYPE.ACCEPTOR.PROMISE)) {
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
    if (!isValid(message, 5, TYPE.ACCEPTOR.ACCEPTED)) {
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
    if (!isValid(message, 2, TYPE.CLIENT.REQUEST)) {
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
    if (!isValid(message, 3, TYPE.LEARNER.RESPONSE)) {
      return null;
    }
    return new Response(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.proposeId, this.value];
  }
}

export default {
  RequestVote, Vote, Prepare, Accept, Promise, Accepted, Request, Response, TYPE
};
