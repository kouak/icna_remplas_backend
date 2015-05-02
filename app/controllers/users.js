/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var User        = require('../models/user.js');

var usersController = {
  findOne: function(req, res) {
    res.send({user: 'user', id: req.params.id});
  },
  
  find: function(req, res) {
    User
    .fetchAll()
    .then(function(users) {
      res.send(users);
    });
  }
};

module.exports = usersController;
