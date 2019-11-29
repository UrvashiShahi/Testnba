
const path = require('path');
const express = require('express');
const JwtValidation = require('../routes/middlewares/jwt.validation');
const AccessTokenValidation = require('../routes/middlewares/token.validation');
const authorizedRoute = require('./routes.auth');

module.exports = (app) => {
  app.use('/nba', express.static(path.join(process.cwd(), 'src/public')));
  /*app.get('/public/logs/:logName', (req, res) => {
    const { logName } = req.params;
    res.sendFile(path.resolve(__dirname, `../../logs/${logName}`));
  });*/
  app.use('/nba/journeybuilder', [JwtValidation.validate, AccessTokenValidation.validate], authorizedRoute);
};
