import Acceptor from './Acceptor';
import Coordinator from './Coordinator';
import Learner from './Learner';
import Client from './Client';
var logger = NodePaxos.logger.getLogger('Maestro');

export default program => {

  logger.info(program.role);
  switch (program.role) {
    case 'acceptor':
      let acceptors = [];
      _.each(NodePaxos.getConfig('system', 'acceptors'), acceptor => {
        let a = new Acceptor({
          acceptors: NodePaxos.getConfig('multicast', 'acceptors'),
          coordinators: NodePaxos.getConfig('multicast', 'coordinators')
        });
        acceptors.push(a.start());
      });
      Promise.all(acceptors).then(() => {
        logger.info('All acceptor started');
      });
      break;
    case 'learner':
      let learners = [];
      _.each(NodePaxos.getConfig('system', 'learners'), learner => {
        let l = new Learner({
          learners: NodePaxos.getConfig('multicast', 'learners')
        });
        learners.push(l.start());
      });
      Promise.all(learners).then(() => {
        logger.info('All learner started');
      });
      break;
    case 'coordinator':
      let coordinators = [];
      _.each(NodePaxos.getConfig('system', 'coordinators'), coordinator => {
        let c = new Coordinator({
          acceptors: NodePaxos.getConfig('multicast', 'acceptors'),
          coordinators: NodePaxos.getConfig('multicast', 'coordinators'),
          learners: NodePaxos.getConfig('multicast', 'learners'),
          quorum: NodePaxos.getConfig('system', 'quorum')
        });
        coordinators.push(c.start());
      });
      Promise.all(coordinators).then(() => {
        logger.info('All coordinator started');
      });
      break;
    case 'client':
      let clientsStarting = [];
      let clients = [];
      _.each(NodePaxos.getConfig('system', 'clients'), client => {
        let c = new Client({
          coordinators: NodePaxos.getConfig('multicast', 'coordinators'),
          clients: NodePaxos.getConfig('multicast', 'clients')
        });
        clients.push(c);
        clientsStarting.push(c.start());
      });
      Promise.all(clientsStarting).then(() => {
        logger.info('All client started started');
        _.each(clients, client => {
          setInterval(() => {
            var x = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
            x += 1;
            client.propose(x);
          }, 0);
        });
      });

      break;
    default:
      break;
  }
};
