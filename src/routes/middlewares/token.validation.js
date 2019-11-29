const log = require('../../utils/logger');
const TokenUtil = require('../../utils/access.token');

class AccessTokenValidation {
  static async validate(req, res, next) {
    log.logger.info(`Execute AccessTokenValidation.validate middleware . Request ${req}`);
    try {
      const token = await TokenUtil.generateToken();
      if (!token) {
        const err = new Error('Forbidden external access');
        err.statusCode = 401;
        next(err);
      }
      req.access_token = token;
      next();
    }
    catch (error) {
      log.logger.error(`Error in AccessTokenValidation middleware : ${error}`);
      const err = new Error('Forbidden external access');
      err.statusCode = 401;
      next(err);
    }
  }
}

module.exports = AccessTokenValidation;
