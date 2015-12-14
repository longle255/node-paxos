import Multicast from './Multicast';
import Proposer from './core/Proposer';
import Message from './core/Message';
import Logger from './Logger';
import SystemConfig from './Config';
import Utils from './Utils';
import _ from 'lodash';

const PROPOSER_STATE = {
  CANDIDATE: 0,
  FOLLOWER: 1,
  LEADER: 2
};
const HEARTBEAT_TIMEOUT = 500 * process.env.PAXOS_DELAY;
const HEARTBEAT_INTERVAL = 200 * process.env.PAXOS_DELAY;
const MIN_ELECTION_LATENCY = 50 * process.env.PAXOS_DELAY;
const MAX_ELECTION_LATENCY = 150 * process.env.PAXOS_DELAY;

export default class ProposerNode extends Proposer {
  constructor(options) {
    super(options);
    this.proposerQuorum = options.proposerQuorum;
    this.address = options.address;
    this.port = options.port;
    this.id = options.multicast.id = options.id;
    this.logger = Logger.getLogger(module, this.id);
    this.multicast = {
      // listen on channel of acceptors
      receiver: new Multicast.Receiver(options.multicast),
      // broad cast message to coordinator channel
      sender: new Multicast.Sender(options.multicast)
    };
    // this.socket = {
    //   receiver: new Multicast.Receiver({
    //     address: this.address,
    //     port: this.port,
    //     isDirectChannel: true
    //   })
    // };
    this.multicast.receiver.addListener(Message.TYPE.CLIENT.REQUEST, this.onRequest.bind(this));
    this.multicast.receiver.addListener(Message.TYPE.ACCEPTOR.PROMISE, this.onPromise.bind(this));
    this.multicast.receiver.addListener(Message.TYPE.LEARNER.CATCH_UP, this.onLearnerCatchUp.bind(this));

    this.multicast.receiver.addListener(Message.TYPE.PROPOSER.REQUEST_VOTE, this.onRequestVote.bind(this));
    this.multicast.receiver.addListener(Message.TYPE.PROPOSER.REQUEST_VOTE_REPLY, this.onRequestVoteReply.bind(this));
    this.multicast.receiver.addListener(Message.TYPE.PROPOSER.HEARTBEAT, this.onHeartbeat.bind(this));

    this.electionTimeoutMs = Utils.getRandomInt(MIN_ELECTION_LATENCY, MAX_ELECTION_LATENCY);
    this.electionInterval = null;
    this.heartbeatInterval = null;
    this.electionTerm = 0;
    this.state = PROPOSER_STATE.FOLLOWER;
    this.voteGranted = [];
    this.votedFor = null;
  }

  isLeader() {
    return this.state === PROPOSER_STATE.LEADER;
  }

  onHeartbeat(message, source) {
    message = Message.Heartbeat.parse(message);
    this.logger.silly(`my leader is ${this.votedFor} receive heartbeat message ${JSON.stringify(message)} from ${source.address}:${source.port}`);

    if (!this.heartbeatTimeout) {
      this.logger.debug(`update my data, leader now is ${message.proposerId}`);
      this.votedFor = message.proposerId;
      this.electionTerm = message.electionTerm;
    }

    if (this.electionInterval) {
      clearInterval(this.electionInterval);
    }
    if (message.proposerId === this.votedFor) {
      this.runHeartbeatCheck();
    }
  }

  onRequestVote(message, source) {
    message = Message.RequestVote.parse(message);

    this.logger.debug(`receive request vote message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
    if (this.electionTerm < message.electionTerm) {
      this.resetElection(message.electionTerm);
    }
    let granted = false;
    if (this.electionTerm === message.electionTerm) {
      if (!this.votedFor) {
        this.votedFor = message.proposerId;
        granted = true;
        this.logger.debug(`voted for ${message.proposerId} to be leader`);
      }
    }
    this.runHeartbeatCheck();
    let reply = new Message.RequestVoteReply(this.electionTerm, message.proposerId, granted, this.id);
    let dest = SystemConfig.getMulticastGroup('proposers');
    this.logger.debug(`sending request vote reply message ${JSON.stringify(reply)}`);
    this.multicast.sender.send(dest, reply);
  }

  onRequestVoteReply(message, source) {
    message = Message.RequestVoteReply.parse(message);
    if (message.proposerId === this.id) {
      this.logger.debug(`receive request vote reply message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
      if (this.electionTerm < message.electionTerm) {
        this.resetElection(message.electionTerm);
      }
      if (this.electionTerm === message.electionTerm && message.granted) {
        this.voteGranted.push(message.from);
      }
      this.logger.debug(`voteGranted from ${JSON.stringify(this.voteGranted)}`);
      if (!this.isLeader() && this.voteGranted.length >= this.proposerQuorum) {
        this.becomeLeader();
      }
    }
  }

  becomeLeader() {
    this.logger.debug('I\'m leader. Start serving now');
    this.state = PROPOSER_STATE.LEADER;
    if (this.electionInterval) {
      clearInterval(this.electionInterval);
    }
    this.runHeartbeat();
  }

  resetElection(electionTerm) {
    this.electionTerm = electionTerm;
    this.state = PROPOSER_STATE.FOLLOWER;
    this.votedFor = null;
    this.voteGranted = [];
    if (this.electionInterval) {
      clearInterval(this.electionInterval);
    }
  }

  runElectionTimeout() {
    this.electionInterval = setInterval(() => {
      this.requestVote();
    }, this.electionTimeoutMs);
  }

  runHeartbeatCheck() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }
    this.heartbeatTimeout = setTimeout(() => {
      this.logger.debug(`leader ${this.votedFor} is down, running my election term`);
      this.runElectionTimeout();
    }, HEARTBEAT_TIMEOUT);
  }

  runHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      let message = new Message.Heartbeat(this.electionTerm, this.id);
      let dest = SystemConfig.getMulticastGroup('proposers');
      this.logger.silly(`sending heartbeat message ${JSON.stringify(message)}`);
      this.multicast.sender.send(dest, message);
    }, HEARTBEAT_INTERVAL);
  }

  start() {
    this.logger.debug('attemp to start Proposer ' + this.id);
    this.runElectionTimeout();
    return Promise.all([this.multicast.receiver.start(), this.multicast.sender.start()]);
  }

  stop() {
    this.logger.debug('attemp to stop Proposer ' + this.id);
    return Promise.all([this.multicast.receiver.stop(), this.multicast.sender.stop()]);
  }

  requestVote() {
    this.state = PROPOSER_STATE.CANDIDATE;
    let message = new Message.RequestVote(this.electionTerm + 1, this.id);
    let dest = SystemConfig.getMulticastGroup('proposers');
    this.logger.debug(`sending request vote message ${JSON.stringify(message)}`);
    this.multicast.sender.send(dest, message);
  }

  onRequest(message, source) {
    if (this.isLeader()) {
      message = Message.Request.parse(message);
      this.logger.debug(`receive request message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
      this.addRequest(message);
      this.processQueue();
    }
  }

  processQueue() {
    if (this.requestQueue.length > 0) {
      process.nextTick(() => {
        let prepare = this.getNextPrepare();
        let dest = SystemConfig.getMulticastGroup('acceptors');
        this.logger.debug(`sending prepare message ${JSON.stringify(prepare)} to ${JSON.stringify(dest)}`);
        this.multicast.sender.send(dest, prepare);
      });
    }
  }

  onPromise(message, source) {
    message = Message.Promise.parse(message);
    if (message.proposerId === this.id) {
      this.logger.debug(`receive promise message ${JSON.stringify(message)} from ${source.address}:${source.port}`);
      let accept = this.getAccept(message);
      if (accept) { // got quorum of acceptors promise
        let dest = SystemConfig.getMulticastGroup('acceptors');
        this.logger.debug(`sending accept message ${JSON.stringify(accept)} to ${JSON.stringify(dest)}`);
        this.multicast.sender.send(dest, accept);
      }
    } else {
      this.logger.debug('not interest');
    }
  }

  onLearnerCatchUp(message, source) {
    message = Message.CatchUp.parse(message);
    if (this.isLeader()) {
      this.logger.debug(`receive catch up message ${JSON.stringify(message)} from learner ${source.address}:${source.port}`);
      this.catchUpQueue = _.union(this.catchUpQueue, message.missingProposals);
      while (this.catchUpQueue.length > 0) {
        let prepare = this.getNextPrepare(this.catchUpQueue.shift());
        let dest = SystemConfig.getMulticastGroup('acceptors');
        this.logger.debug(`sending catchup prepare message ${JSON.stringify(prepare)} to ${JSON.stringify(dest)}`);
        this.multicast.sender.send(dest, prepare);
      }
    }
  }

}
