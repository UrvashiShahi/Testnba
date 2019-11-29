const express = require('express');
const ActivityCtrl = require('../controllers/activity.ctrl');

const authorizedRoute = express.Router();

authorizedRoute
  .post('/save/', ActivityCtrl.save)
  .post('/validate/', ActivityCtrl.validate)
  .post('/publish/', ActivityCtrl.publish)
  .post('/execute/', ActivityCtrl.execute)
  .post('/stop/', ActivityCtrl.stop);

module.exports = authorizedRoute;
