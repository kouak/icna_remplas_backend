/**
 * Load models
 * Courtesy of the Ghost project
 * https://github.com/TryGhost/Ghost/blob/master/core/server/models/index.js
 */

var _ = require('lodash');

models = {

  modelsToLoad: ['user'],
  /**
   * Init
   * require each model and cache into the "models" object
   */
  init: function() {
    var self = this;
    
    var schema = require('./schema');
    schema.init();
    self.schema = schema;

    return _.each(self.modelsToLoad, function(modelFile) {
      var file = require('./' + modelFile);
      _.extend(self, file);
    });
  }
}

module.exports = models;
