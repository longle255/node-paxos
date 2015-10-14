import MulticastAdapterInterface from './MulticastAdapterInterface';

let logger = NodePaxos.logger.getLogger('multicast');

export default class IpMulticastAdapter extends MulticastAdapterInterface {
  constructor(options) {

  }

  multicast(dest, message) {
    logger.info('IpMulticastAdapter multicast method called');
  }
}
