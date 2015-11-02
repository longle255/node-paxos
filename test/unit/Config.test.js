import SystemConfig from '../../src/Config';
describe('SystemConfig test suite', () => {
  it('should be ok', () => {
    expect(SystemConfig.config.system).to.be.exist;
  });

  it('should return correct host', () => {
    expect(SystemConfig.getNode(10001).port).to.be.eql(10001);
  });

  it('should return correct logger config', function() {
    let conf = SystemConfig.getLogConfig('Multicast.js');
    expect(conf.console.label).to.be.equal('MULTICAST');
  });

  it('should return correct Multicast group', function() {
    let conf = SystemConfig.getMulticastGroup('acceptors');
    expect(conf.group).to.be.equal('acceptors');
  });
});
