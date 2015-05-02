/**
 * /api/
 */

var express = require('express');
var c = require('../controllers');

routes = function() {
  
  var router = express.Router();

  router.get('/users', c.users.find);
  router.get('/user/:id', c.users.findOne); 

  return router;
};

module.exports = routes();
