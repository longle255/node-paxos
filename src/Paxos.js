import AcceptorNode from './AcceptorNode';
import ProposerNode from './ProposerNode';
import LearnerNode from './LearnerNode';
import ClientNode from './ClientNode';
import Logger from './Logger';
import SystemConfig from './Config';
import _ from 'lodash';

let log = Logger.getLogger(module);
export default opt => {
  switch (opt.role) {
    case 'acceptors':
      let acceptors = [];
      let aMul = SystemConfig.getMulticastGroup('acceptors');
      _.each(SystemConfig.getGroup('acceptors'), acceptor => {
        let options = _.assign(acceptor, {
          multicast: aMul
        });
        let a = new AcceptorNode(options);
        acceptors.push(a.start());
      });
      Promise.all(acceptors).then(() => {
        log.info('All acceptor started');
      });
      break;
    case 'learners':
      let learners = [];
      let lMul = SystemConfig.getMulticastGroup('learners');
      _.each(SystemConfig.getGroup('learners'), learner => {
        let options = _.assign(learner, {
          multicast: lMul,
          quorum: SystemConfig.getQuorum(),
          calRate: true
        });
        let l = new LearnerNode(options);
        learners.push(l.start());
      });
      Promise.all(learners).then(() => {
        log.info('All learner started');
      });
      break;
    case 'proposers':
      let proposers = [];
      let pMul = SystemConfig.getMulticastGroup('proposers');
      _.each(SystemConfig.getGroup('proposers'), proposer => {
        let options = _.assign(proposer, {
          multicast: pMul,
          quorum: SystemConfig.getQuorum()
        });
        let c = new ProposerNode(options);
        proposers.push(c.start());
      });
      Promise.all(proposers).then(() => {
        log.info('All coordinator started');
      });
      break;
    case 'clients':
      let clientsStarting = [];
      let clients = [];
      let cMul = SystemConfig.getMulticastGroup('clients');
      _.each(SystemConfig.getGroup('clients'), client => {
        let options = _.assign(client, {
          multicast: cMul
        });
        let c = new ClientNode(options);
        clients.push(c);
        clientsStarting.push(c.start());
      });
      Promise.all(clientsStarting).then(() => {
        log.info('All client started started');
        _.each(clients, client => {
          let x = 0;
          setInterval(() => {
            // let x = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;
            x += 1;
            client.request(x);
          }, 0);
        });
      });

      break;
    default:
      break;
  }
};
