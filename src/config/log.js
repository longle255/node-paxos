import winston from 'winston';
import _ from 'lodash';

winston.setLevels({
  debug: 0,
  info: 1,
  silly: 2,
  warn: 3,
  error: 4
});

winston.addColors({
  debug: 'green',
  info: 'cyan',
  silly: 'magenta',
  warn: 'yellow',
  error: 'red'
});

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  level: 'debug',
  colorize: true
});

/**
 * get logger for specific category
 * @param  {string} category category tag will be appended to logging line
 * @return {logger} logger instance
 */
winston.getLogger = (category) => {
  return winston.loggers.get(category);
};

export default (configFile) => {
  let configs = require(configFile);
  _.each(configs, (config) => {
    winston.loggers.add(config.module, config.options);
  });
  return winston;
};
