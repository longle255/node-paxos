import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import Yaml from 'js-yaml';
import Utils from './Utils';

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
    if (process.env.PAXOS_MULTICAST) {
      let list = Utils.readFileToArraySync(process.env.PAXOS_MULTICAST);
      let multicast = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].length) {
          let line = list[i].trim().replace(/\s\s+/g, ' ');
          line = line.split(' ');
          let conf = {
            group: line[0],
            address: line[1],
            port: line[2]
          };
          multicast.push(conf);
        }
      }
      this.config.multicast = multicast;
    }
  }
  getNode(id) {
    return _.find(this.hosts, {
      id: id
    });
  }
  getGroup(group) {
    return this.config.system[group];
  }
  getGroupCount(group) {
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
  getAcceptorQuorum() {
    return this.config.system.acceptorQuorum;
  }
  getProposerQuorum() {
    return this.config.system.proposerQuorum;
  }
  getNodeByGroup(group, id) {
    return this.config.system[group][id];
  }
  getRootDir() {
    return process.env.PAXOS_ROOT_DIR || path.join(__dirname, '../');
  }
  getMinProposalId() {
    return this.config.system.minProposalId;
  }
}

export default new SystemConfig(path.join(__dirname, '../config'));
