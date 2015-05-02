var _ = require('lodash'),
    myBs = require(__dirname + '/db'), // Our Bookshelf Instance
    ModelBase = require('bookshelf-modelbase')(myBs), // Bookshelf-base model

    Team;

Team = ModelBase.extend({
  tableName: 'teams'
});

module.exports = Team;

