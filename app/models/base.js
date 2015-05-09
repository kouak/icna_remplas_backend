var _        = require('lodash');
var Joi      = require('joi');
var Promise  = require('bluebird');


module.exports = function modelBase(bookshelf, params) {
  if (!bookshelf) {
    throw new Error('Must pass an initialized bookshelf instance');
  }

  var model = bookshelf.Model.extend({
    initialize: function (attrs, options) {
      var self = this;
      var _defaults = {
        id: Joi.any().optional(),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
      };

      // Meta programming settings of validation stuff
      _.each(['', 'Create', 'Update'], function(f) {
        if(self['validation' + f]) {
          self['validation' + f] = Joi.object(self['validation' + f]).keys({
            id: Joi.number().integer(),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
          });
        } else {
          self['validation' + f] = Joi.any();
        }
      });
      
      self.on('creating', function() {
        return Promise.try(function() {
            return self.validateSave();
          }).then(function() {
            return self.validateCreate();
          });
      });
      
      self.on('updating', function() {
        return Promise.try(function() {
            return self.validateSave();
          }).then(function() {
            return self.validateCreate();
          });
      });
    },

    hasTimestamps: ['createdAt', 'updatedAt'],

    validateSave: function (model) {
      var validation = Joi.validate(this.attributes, this.validation);
      if (validation.error) {
        throw new Error(validation.error);
      } else {
        return validation.value;
      }
    },

    validateCreate: function () {
      var validation = Joi.validate(this.attributes, this.validationCreate, {allowUnknown: true});
      if (validation.error) {
        throw new Error(validation.error);
      } else {
        return validation.value;
      }
    },
    
    validateUpdate: function () {
      var validation = Joi.validate(this.attributes, this.validationUpdate, {allowUnknown: true});
      if (validation.error) {
        throw new Error(validation.error);
      } else {
        return validation.value;
      }
    },
    
    // snake_case columns -> camelCase attributes
    parse: function (response) {
      return  _.reduce(response, function (memo, val, key) {
        memo[_.camelCase(key)] = val;
        return memo;
      }, {});
    },

    // camelCase attributes -> snake_case db columns
    format: function (attrs) {
      return _.reduce(attrs, function (memo, val, key) {
        memo[_.snakeCase(key)] = val;
        return memo;
      }, {});
    },
  }, {

    /* Model CRUD */

    /**
      * Naive findAll - fetches all data for `this`
      * @param {Object} filter (optional)
      * @param {Object} options (optional)
      * @return {Promise(bookshelf.Collection)} Bookshelf Collection of Models
      */
    findAll: function (filter, options) {
      return this.forge(filter).fetchAll(options);
    },

    /**
      * Naive findOne - fetch data for `this` matching data
      * @param {Object} data
      * @param {Object} options (optional)
      * @return {Promise(bookshelf.Model)} single Model
      */
    findOne: function (data, options) {
      return this.forge(data).fetch(options);
    },

    /**
      * Naive add - create and save a model based on data
      * @param {Object} data
      * @param {Object} options (optional)
      * @return {Promise(bookshelf.Model)} single Model
      */
    create: function (data, options) {
      return this.forge(data)
      .save(null, options);
    },

    /**
      * Naive update - update a model based on data
      * @param {Object} data
      * @param {Object} options
      * @return {Promise(bookshelf.Model)} edited Model
      */
    update: function (data, options) {
      _.defaults(options, {
        patch: true
      });
      return this.forge({ id: options.id }).fetch(options)
      .then(function (model) {
        if (model) {
          return model.save(data, options);
        }
      })
    },

    /**
      * Naive destroy
      * @param {Object} options
      * @return {Promise(bookshelf.Model)} empty Model
      */
    destroy: function (options) {
      return this.forge({ id: options.id })
      .destroy(options);
    }

  });

  return model;
};
