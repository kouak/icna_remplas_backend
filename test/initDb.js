var knexConfig = require(__dirname + '/../database/knexfile').test;

var knex = require('knex')(knexConfig);
var bookshelf = require('bookshelf')(knex);


var before = function(done) {
  knex.migrate.latest(); // Migrate the database to the latest state
  done();
};

var ex = {
  before: before,
  knex: knex,
  bookshelf: bookshelf
};

module.exports = ex;

