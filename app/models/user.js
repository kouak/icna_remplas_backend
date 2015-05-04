var _ = require('lodash'),
    myBs = require(__dirname + '/db'), // Our Bookshelf Instance
    ModelBase = require('bookshelf-modelbase')(myBs), // Bookshelf-base model
    Joi = require('joi'),

    User;

User = ModelBase.extend({
  tableName: 'users',
  validate: {
    firstName: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    teamId: Joi.number().integer()
  }
});

module.exports = User;

