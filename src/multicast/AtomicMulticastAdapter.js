import MulticastAdapterInterface from './MulticastAdapterInterface';

export default class AtomicMulticastAdapter extends MulticastAdapterInterface {
  multicast(dest, message) {
    console.log('AtomicMulticastAdapter multicast method called');
  }
}
