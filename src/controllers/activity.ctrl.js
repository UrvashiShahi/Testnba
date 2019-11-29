const ActivityService = require('../services/activity.service');
const log = require('../utils/logger');

class ActivityController {
  static async save(req, res, next) {
    try {
      const payload = await ActivityService.save(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async publish(req, res, next) {
    try {
      const payload = await ActivityService.publish(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async validate(req, res, next) {
    try {
      const payload = await ActivityService.validate(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async execute(req, res, next) {
    try {
      if (req.decoded && req.decoded.inArguments && req.decoded.inArguments.length > 0) {
        const executePayload = await ActivityService.execute(req);
        res.send(executePayload);
      }
      else {
        const executeError = `Incorrect decoded inArguments : ${req.decoded}`;
        log.logger.error(executeError);
        next(new Error(executeError));
      }
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }

  static async stop(req, res, next) {
    try {
      const payload = await ActivityService.stop(req);
      res.send(payload);
    }
    catch (exception) {
      next(new Error(`Internal Server Error: ${exception}`));
    }
  }
}

module.exports = ActivityController;
