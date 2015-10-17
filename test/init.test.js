import chai from 'chai';
import path from 'path';
import '../';

let should = chai.should();

describe('Application Starting Up Test Suite', function() {
  it('should populate global var correctly', function() {
    should.exist(NodePaxos);
    NodePaxos.rootDir.should.equal(path.join(__dirname, '../'));
  });

  it('should init logger correctly', function() {
    let logger = NodePaxos.logger.getLogger('multicast');
    should.exist(logger);
  });

  it('should return correct getConfig', function() {
    let config = NodePaxos.getConfig('logger', 'multicast');
    should.exist(config);
    config = NodePaxos.getConfig('multicast', 'acceptors');
    should.exist(config);
    config.port.should.equal(5000);
  });
});
