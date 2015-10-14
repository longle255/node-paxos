import MulticastAdapterInterface from './MulticastAdapterInterface';
let logger = NodePaxos.logger.getLogger('multicast');

export default class AtomicMulticastAdapter extends MulticastAdapterInterface {
  multicast(dest, message) {
    logger.info('AtomicMulticastAdapter multicast method called');
  }
}
