import MulticastAdapterInterface from './MulticastAdapterInterface';
import log from 'winston';

export default class AtomicMulticastAdapter extends MulticastAdapterInterface {
  multicast(dest, message) {
    log.info('AtomicMulticastAdapter multicast method called');
  }
}
