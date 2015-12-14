import AcceptorNode from './AcceptorNode';
import ProposerNode from './ProposerNode';
import LearnerNode from './LearnerNode';
import ClientNode from './ClientNode';
import Logger from './Logger';
import Utils from './Utils';
import SystemConfig from './Config';
import _ from 'lodash';

export default opt => {
  let logger = Logger.getLogger(module);
  let multiStart = true;
  let id = -1;
  let delay = parseInt(opt.delay, 10);
  let file = opt.file;
  if (opt.id) {
    id = opt.id;
    multiStart = false;
  }
  switch (opt.role) {
    case 'acceptors':
      let acceptors = [];
      let aMul = SystemConfig.getMulticastGroup('acceptors');
      let aIndex = 0;
      let nodeCount = 0;
      if (multiStart) {
        nodeCount = SystemConfig.getGroupCount('acceptors');
      } else {
        nodeCount = 1;
      }
      for (let i = 0; i < nodeCount; i++) {
        let options = {
          multicast: aMul,
          id: 'a-' + (multiStart ? aIndex++ : id)
        };
        let a = new AcceptorNode(options);
        acceptors.push(a.start());
      }
      Promise.all(acceptors).then(() => {
        logger.info('All acceptor started');
      });
      break;
    case 'learners':
      let learners = [];
      let lMul = SystemConfig.getMulticastGroup('learners');
      let lIndex = 0;
      if (multiStart) {
        nodeCount = SystemConfig.getGroupCount('learners');
      } else {
        nodeCount = 1;
      }
      for (let i = 0; i < nodeCount; i++) {
        let options = {
          multicast: lMul,
          quorum: SystemConfig.getAcceptorQuorum(),
          calRate: process.env.PAXOS_MODE === 'benchmark',
          minProposalId: SystemConfig.getMinProposalId(),
          id: 'l-' + (multiStart ? lIndex++ : id)
        };
        let l = new LearnerNode(options);
        learners.push(l.start());
      }
      Promise.all(learners).then(() => {
        logger.info('All learner started');
      });
      break;
    case 'proposers':
      let proposers = [];
      let pMul = SystemConfig.getMulticastGroup('proposers');
      let pIndex = 0;
      if (multiStart) {
        nodeCount = SystemConfig.getGroupCount('proposers');
      } else {
        nodeCount = 1;
      }
      for (let i = 0; i < nodeCount; i++) {
        let options = {
          multicast: pMul,
          acceptorQuorum: SystemConfig.getAcceptorQuorum(),
          proposerQuorum: SystemConfig.getProposerQuorum(),
          minProposalId: SystemConfig.getMinProposalId(),
          id: 'p-' + (multiStart ? pIndex++ : id)
        };
        let c = new ProposerNode(options);
        proposers.push(c.start());
      }

      Promise.all(proposers).then(() => {
        logger.info('All coordinator started');
      });
      break;
    case 'clients':
      let clientsStarting = [];
      let clients = [];
      let cMul = SystemConfig.getMulticastGroup('clients');
      let cIndex = 0;
      if (multiStart) {
        nodeCount = SystemConfig.getGroupCount('clients');
      } else {
        nodeCount = 1;
      }
      for (let i = 0; i < nodeCount; i++) {
        let options = {
          multicast: cMul,
          id: 'c-' + (multiStart ? cIndex++ : id)
        };
        let c = new ClientNode(options);
        clients.push(c);
        clientsStarting.push(c.start());
      }
      Promise.all(clientsStarting).then(() => {
        logger.info('All client started started');
        _.each(clients, client => {
          if (process.env.PAXOS_MODE === 'demo' || process.env.PAXOS_MODE === 'benchmark') {
            var x = 0;
            setInterval(() => {
              if (process.env.PAXOS_MODE === 'benchmark') {
                x = Date.now();
              } else {
                x += 1;
                console.log(x);
              }
              client.request(x);
            }, delay);
          } else {
            var readline = require('readline');
            var rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
              terminal: false
            });
            let count = 0;
            rl.on('line', function(line) {
              if (line.length) {
                setTimeout(() => {
                  client.request(line);
                }, 2 * ++count);
              }
            });
          }
        });
      });
      break;
    default:
      break;
  }
};
