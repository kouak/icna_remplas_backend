var _ = require('lodash'),
    myBs = require(__dirname + '/db'), // Our Bookshelf Instance
    ModelBase = require('bookshelf-modelbase')(myBs), // Bookshelf-base model
    Joi = require('joi'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt')),

    User;

User = ModelBase.extend({
  tableName: 'users',

  initialize: function() {
    ModelBase.prototype.initialize.call(this); // Call ModelBase initialize
    this.on('creating', this.encryptPassword);
  },

  /* Validation with Joi */
  validate: {
    firstName: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    teamId: Joi.number().integer()
  },

  encryptPassword: function() {
    var self = this;
    if(!self.isNew) { return; }
    return self.hashPassword(self.get('password'))
    .then(function(hashed) {
      return self.set('password', hashed);
    });
  },

  comparePassword: function(plainText) {
    return bcrypt.compareAsync(plainText, this.get('password'));
  },

  hashPassword: function(plainText) {
    return bcrypt.genSaltAsync(10)
      .then(function(result) {
        return bcrypt.hashAsync(plainText, result);
      });
  }
});

module.exports = User;

