var knexConfig = require(__dirname + '/../database/knexfile').test;

var knex = require('knex')(knexConfig);
var bookshelf = require('bookshelf')(knex);
var Promise = require('bluebird');

knex.migrate.latest(); // Migrate the database to the latest state

var ex = {
  knex: knex,
  bookshelf: bookshelf
};

module.exports = ex;

