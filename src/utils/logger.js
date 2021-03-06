const { createLogger, format, transports } = require('winston');
const moment = require('moment-timezone');

// { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
let level = process.env.LOG_LEVEL || 'debug';

const appendTimestamp = format((info, opts) => {
  if (opts.tz) {
    // eslint-disable-next-line no-param-reassign
    info.timestamp = moment().tz(opts.tz).format();
  }
  return info;
});

function formatParams(info) {
  const {
    timestamp, message, ...args
  } = info;
  level = info.level;
  const ts = timestamp.slice(0, 19).replace('T', ' ');

  return `${ts} ${level}: ${message} ${Object.keys(args).length
    ? JSON.stringify(args, '', '')
    : ''}`;
}

const timestamp = !process.env.TIMEZONE ? 'Asia/Singapore' : process.env.TIMEZONE;

const developmentFormat = format.combine(
  appendTimestamp({ tz: timestamp }),
  format.align(),
  format.json(),
  format.printf(formatParams)
);

const productionFormat = format.combine(
  appendTimestamp({ tz: timestamp }),
  format.align(),
  format.json(),
  format.printf(formatParams)
);

let logger;
let hostLogger; // for log between web server and other system
if (process.env.NODE_ENV !== 'production') {
  logger = createLogger({
    level,
    format: developmentFormat,
    transports: [
      new transports.Console()
      // new transports.File({ filename: 'app.log' })
    ]
  });
  hostLogger = createLogger({
    level,
    format: developmentFormat,
    transports: [
      new transports.Console()
      // new transports.File({ filename: 'host.log' })
    ]
  });
}
else {
  logger = createLogger({
    level,
    format: productionFormat,
    transports: [
      new transports.Console()
      // new transports.File({ filename: 'app.log' })
    ]
  });
  hostLogger = createLogger({
    level,
    format: productionFormat,
    transports: [
      new transports.Console()
      // new transports.File({ filename: 'host.log' })
    ]
  });
}

const logMiddleware = (req, res, next) => {
  logger.info(`[Request]: URL ${req.url} Body: ${req.rawBody} Headers: ${JSON.stringify(req.headers)}`);
  res.on('finish', () => {
    logger.info(`[Response]: Status: ${res.statusCode} Body : ${res.body}`);
  });
  next();
};

module.exports = { logger, hostLogger, logMiddleware };
