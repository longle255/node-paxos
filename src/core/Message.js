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
    REQUEST_VOTE_REPLY: 105,
    HEARTBEAT: 106
  },
  ACCEPTOR: { // 201-299
    PROMISE: 201,
    ACCEPTED: 202
  },
  LEARNER: { // 301-399
    RESPONSE: 301,
    CATCH_UP: 302
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
  constructor(electionTerm, proposerId) {
    super();
    this.type = TYPE.PROPOSER.REQUEST_VOTE;
    this.proposerId = proposerId;
    this.electionTerm = electionTerm;
  }
  static parse(message) {
    if (!isValid(message, 3, TYPE.PROPOSER.REQUEST_VOTE)) {
      return null;
    }
    return new RequestVote(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.electionTerm, this.proposerId];
  }
}

class RequestVoteReply extends Message {
  constructor(electionTerm, proposerId, granted, from) {
    super();
    this.type = TYPE.PROPOSER.REQUEST_VOTE_REPLY;
    this.proposerId = proposerId;
    this.granted = granted;
    this.electionTerm = electionTerm;
    this.from = from;
  }
  static parse(message) {
    if (!isValid(message, 5, TYPE.PROPOSER.REQUEST_VOTE_REPLY)) {
      return null;
    }
    return new RequestVoteReply(message[1], message[2], message[3], message[4]);
  }
  serialize() {
    return [this.type, this.electionTerm, this.proposerId, this.granted, this.from];
  }
}

class Heartbeat extends Message {
  constructor(electionTerm, proposerId) {
    super();
    this.type = TYPE.PROPOSER.HEARTBEAT;
    this.proposerId = proposerId;
    this.electionTerm = electionTerm;
  }
  static parse(message) {
    if (!isValid(message, 3, TYPE.PROPOSER.HEARTBEAT)) {
      return null;
    }
    return new RequestVoteReply(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.electionTerm, this.proposerId];
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
  constructor(proposeId, round, votedRound, votedValue, acceptorId, proposerId) {
    super();
    this.type = TYPE.ACCEPTOR.PROMISE;
    this.proposeId = proposeId;
    this.round = round;
    this.votedRound = votedRound;
    this.votedValue = votedValue;
    this.acceptorId = acceptorId;
    this.proposerId = proposerId;
  }
  static parse(message) {
    if (!isValid(message, 7, TYPE.ACCEPTOR.PROMISE)) {
      return null;
    }
    return new Promise(message[1], message[2], message[3], message[4], message[5], message[6]);
  }
  serialize() {
    return [this.type, this.proposeId, this.round, this.votedRound, this.votedValue, this.acceptorId, this.proposerId];
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
  constructor(data, clientId) {
    super();
    this.type = TYPE.CLIENT.REQUEST;
    this.data = data;
    this.clientId = clientId;
  }

  static parse(message) {
    if (!isValid(message, 3, TYPE.CLIENT.REQUEST)) {
      return null;
    }
    return new Request(message[1], message[2]);
  }
  serialize() {
    return [this.type, this.data, this.clientId];
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

class CatchUp extends Message {
  constructor(missingProposals) {
    super();
    this.type = TYPE.LEARNER.CATCH_UP;
    this.missingProposals = missingProposals;
  }

  static parse(message) {
    if (!isValid(message, 2, TYPE.LEARNER.CATCH_UP)) {
      return null;
    }
    return new CatchUp(message[1]);
  }
  serialize() {
    return [this.type, this.missingProposals];
  }
}

export default {
  RequestVote, RequestVoteReply, Heartbeat, Prepare, Accept, Promise, Accepted, Request, Response, CatchUp, TYPE
};
