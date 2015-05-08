var _           = require('lodash');
var Team        = require('../models/team.js');
var Promise     = require('bluebird');

var teamsController = {
  findOne: function(req, res) {
    res.send({team: 'team', id: req.params.id});
  },
  
  find: function(req, res) {
    var filter = {};
    if(req.query.center) {
      filter = { center_id: req.query.center };
    }
    Team
    .where(filter)
    .fetchAll()
    .then(function(teams) {
      res.send(teams);
    })
    .catch(function(err) {
      res.send(JSON.stringify(err, ['message', 'arguments', 'type', 'name']));
    });
  }
};

module.exports = teamsController;
