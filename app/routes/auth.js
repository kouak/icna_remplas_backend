/**
 * /api/
 */

var express = require('express');
var c = require('../controllers');

routes = function() {
  
  var router = express.Router();

  // Request a new password token
  router.post('/reset', c.auth.createReset);

  // Process lost password token
  router.get('/reset/:token', c.auth.getByToken);

  // Update user password by token
  router.post('/reset/password', c.auth.resetPassword);

  return router;
};

module.exports = routes();
