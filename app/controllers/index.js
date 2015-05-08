/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var _ = require('lodash');

controllers = {

  controllersToLoad: [
    'centers',
    'users',
    'auth',
    'teams'
  ],
  /**
   * Init
   * require each model and cache into the "models" object
   */
  init: function() {
    var self = this;
    
    return _.each(self.controllersToLoad, function(controllerFile) {
      var file = require('./' + controllerFile);
      var o = {};
      o[controllerFile] = file;
      _.extend(self, o);
    });
  }
}

// Load everything
controllers.init();
module.exports = controllers;
