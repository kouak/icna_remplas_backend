var express = require('express');

routes = function() {
  
  var router = express.Router();
  
  router.get('/caca', function(req, res) {
    res.send({caca: 'pouet'});
  });

  return router;
};

module.exports = routes();
