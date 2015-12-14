import Client from '../../../src/core/Client';
import Message from '../../../src/core/Message';

let client;
describe('Client test suite', () => {

  beforeEach(() => {
    client = new Client({
      id: 1
    });
  });

  it('constructor should set correct value', () => {
    expect(client.id).to.be.eql(1);
  });

  it('should gen correct request message', () => {
    let request = client.getRequest(100);
    expect(request.data).to.be.eql(100);
    expect(request.serialize()).to.be.eql([Message.TYPE.CLIENT.REQUEST, 100, client.id]);
  });

});
