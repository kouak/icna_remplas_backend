/**
 * /api/
 */

var express = require('express');
var c = require('../controllers');

routes = function() {
  
  var router = express.Router();

  router.get('/users', c.users.find);
  router.get('/user/:id', c.users.findOne); 
  
  // Centers
  router.get('/centers', c.centers.find);
  router.get('/center/:id', c.centers.findOne);

  // Teams 
  router.get('/teams', c.teams.find);
  router.get('/team/:id', c.teams.findOne);
  return router;
};

module.exports = routes();
