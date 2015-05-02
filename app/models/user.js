var _ = require('lodash'),
    myBs = require(__dirname + '/db'), // Our Bookshelf Instance
    ModelBase = require('bookshelf-modelbase')(myBs), // Bookshelf-base model

    User;

User = ModelBase.extend({
  tableName: 'users'
});

module.exports = User;

