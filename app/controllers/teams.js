/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var Team        = require('../models/team.js');

var teamsController = {
  findOne: function(req, res) {
    res.send({team: 'team', id: req.params.id});
  },
  
  find: function(req, res) {
    Team
    .fetchAll()
    .then(function(teams) {
      res.send(teams);
    });
  }
};

module.exports = teamsController;
