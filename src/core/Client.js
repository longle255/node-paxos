import Message from './Message';
import Logger from '../logger';

let log = Logger.getLogger(module);

export default class Client {
  constructor(options) {
    this.id = options.id;
  }

  getRequest(data) {
    return new Message.Request(data);
  }
}
