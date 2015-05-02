var _ = require('lodash'),
    icnaBookshelf = require('./base'),

    User,
    Users;

User = icnaBookshelf.Model.extend({
  tableName: 'users'
});

Users = icnaBookshelf.Collection.extend({
  model: User
});

module.exports = {
  User: User,
  Users: Users
};

