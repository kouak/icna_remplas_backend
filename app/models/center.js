var _ = require('lodash'),
    myBs = require(__dirname + '/db'), // Our Bookshelf Instance
    ModelBase = require('./base')(myBs), // Bookshelf-base model

    Center;

Center = ModelBase.extend({
  tableName: 'centers'
});

module.exports = Center;

