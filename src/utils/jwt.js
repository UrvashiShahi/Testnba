const jwt = require('jsonwebtoken');
const log = require('./logger');

class JwtUtil {
  static async jwtVerify(token, secret) {
    log.logger.info(`Token is : ${token}`);
    if (!token) {
      throw new Error('invalid jwtdata');
    }
    try {
      const decode = jwt.verify(token, secret, { algorithm: 'HS256' });
      return decode;
    }
    catch (error) {
      throw new Error(error);
    }
  }

  static async jwtSign(payload, secret) {
    log.logger.info(`Token is : ${payload}`);
    if (!payload) {
      throw new Error('Invalid payload to JWT sign');
    }
    try {
      const encode = jwt.sign(payload, secret, { algorithm: 'HS256' });
      return encode;
    }
    catch (error) {
      throw new Error(error);
    }
  }
}

module.exports = JwtUtil;
