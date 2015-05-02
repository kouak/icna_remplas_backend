var _ = require('lodash'),
    bookshelf = require('bookshelf'),
    knex = require('knex')(require('../../database/knexfile.js').development),

    icnaBookshelf;

icnaBookshelf = bookshelf(knex);

module.exports = icnaBookshelf;
