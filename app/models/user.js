var _ = require('lodash'),
    icnaBookshelf = require('./base'),

    User;

User = icnaBookshelf.Model.extend({

  tableName: 'users'

});


module.exports = {
  User: User
};

