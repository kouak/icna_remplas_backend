/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var Center        = require('../models/center.js');

var centersController = {
  findOne: function(req, res) {
    res.send({center: 'center', id: req.params.id});
  },
  
  find: function(req, res) {
    Center
    .fetchAll()
    .then(function(centers) {
      res.send(centers);
    });
  }
};

module.exports = centersController;
