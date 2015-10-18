import Acceptor from './Acceptor';
import Coordinator from './Coordinator';
import Learner from './Learner';
import Client from './Client';
var logger = NodePaxos.logger.getLogger('Maestro');

export default program => {

  logger.info(program.role);
  switch (program.role) {
    case 'acceptor':
      let acceptor = new Acceptor({
        acceptors: NodePaxos.getConfig('multicast', 'acceptors'),
        coordinators: NodePaxos.getConfig('multicast', 'coordinators')
      });
      acceptor.start().then(() => {
        logger.info('Acceptor started');
      });
      break;
    case 'learner':
      let learner = new Learner({
        learners: NodePaxos.getConfig('multicast', 'learners')
      });
      learner.start().then(() => {
        logger.info('Learner started');
      });
      break;
    case 'coordinator':
      let coordinator = new Coordinator({
        acceptors: NodePaxos.getConfig('multicast', 'acceptors'),
        coordinators: NodePaxos.getConfig('multicast', 'coordinators'),
        learners: NodePaxos.getConfig('multicast', 'learners'),
        quorum: NodePaxos.getConfig('system', 'quorum')
      });
      coordinator.start().then(() => {
        logger.info('Coordinator started');
      });
      break;
    case 'client':
      let client = new Client({
        coordinators: NodePaxos.getConfig('multicast', 'coordinators'),
        clients: NodePaxos.getConfig('multicast', 'clients')
      });
      client.start().then(() => {
        let x = 0;
        setInterval(() => {
          // var x = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
          x += 1;
          client.propose(x);
        }, 1);
      });
      break;
    default:
      break;
  }
};
