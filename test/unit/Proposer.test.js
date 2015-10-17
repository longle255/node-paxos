import chai from 'chai';
import Proposer from '../../src/Proposer';
var logger = NodePaxos.logger.getLogger(module);
var proposer;

describe('Proposer test suite', () => {
  it('should start proposer properly', () => {
    proposer = new Proposer({
      proposers: NodePaxos.getConfig('multicast', 'proposers'),
      coordinators: NodePaxos.getConfig('multicast', 'coordinators')
    });
    (()=>{
      proposer.start();
    }).should.not.throw(Error);
  });
});
