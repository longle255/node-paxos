import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import Yaml from 'js-yaml';

class SystemConfig {
  constructor(configDir) {
    let config = {};
    fs.readdirSync(configDir).forEach(file => {
      if (/\.yml$/.test(file)) {
        config[path.basename(file, '.yml')] = Yaml.safeLoad(fs.readFileSync(configDir + '/' + file, 'utf8'));
      }
    });
    this.config = config;
    this.hosts = _.union(config.system.proposers, config.system.acceptors, config.system.learners, config.system.clients);
  }
  getNode(id) {
    return _.find(this.hosts, {
      id: id
    });
  }
  getGroup(group) {
    return this.config.system[group];
  }
  getMulticastGroup(group) {
    return _.find(this.config.multicast, {
      group: group
    });
  }
  getLogConfig(moduleName) {
    return _.result(_.find(this.config.logger, {
      module: moduleName
    }), 'options');
  }
  getQuorum() {
    return this.config.system.quorum;
  }
}

export default new SystemConfig(path.join(__dirname, '../config'));
