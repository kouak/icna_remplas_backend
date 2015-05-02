var express = require('express');

routes = function() {
  
  var router = express.Router();
  
  // Load our API
  var api = require('./api');

  // Load Auth specific stuff
  var auth = require('./auth');

  // Load our API
  router.use('/api', api);

  // Auth
  router.use('/auth', auth);

  return router;
};

module.exports = routes();
