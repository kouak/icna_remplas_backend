/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var User        = require('../models/user.js');
var _           = require('lodash');

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
  },

  create: function(req, res) {
    var allowedKeys = [
      'name',
      'firstName',
      'phone',
      'email',
      'password',
      'teamId'
    ];

    var userData = _.pick(req.params, allowedKeys);

    User
    .forge(userData)
    .save()
    .then(function(user) {
      res.send(user);
    })
    .catch(function(err) {
      res.send(JSON.stringify(err, ['message', 'arguments', 'type', 'name']));
    });
  }
};

module.exports = usersController;
