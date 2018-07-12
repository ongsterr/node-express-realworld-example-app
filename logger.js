const winston = require('winston');
const expressWinston = require('express-winston');
// Requiring `winston-mongodb` will expose `winston.transports.MongoDB`
require('winston-mongodb');


const level = process.env.LOG_LEVEL || 'debug';

const logger = expressWinston.logger({
  transports: [
    // new winston.transports.MongoDB({
    //   db: "",
    //   collection: "log",
    //   level: level,
    //   timestamp: () => {
    //     return (new Date()).toISOString();
    //   }
    // }),
    new winston.transports.Console({
      json: true,
      colorize: true,
      level: level,
      timestamp: () => {
        return (new Date()).toISOString();
      }
    })
  ]
});

module.exports = logger;