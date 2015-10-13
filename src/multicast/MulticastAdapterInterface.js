export default class MulticastAdapterInterface {
  constructor() {
    if (this.constructor === MulticastAdapterInterface) {
      throw new TypeError('Cannot construct MulticastAdapterInterface instances directly');
    }
  }
  multicast(dest, message) {
    throw new Error('Method is not implemented');
  }
  deliver(message) {
    throw new Error('Method is not implemented');
  }
}
