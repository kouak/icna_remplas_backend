var _ = require('lodash'),
    bookshelf = require('bookshelf'),
    knex = require('knex')('../../database/knexfile.js'),

    icnaBookshelf;

icnaBookshelf = bookshelf(knex);

module.exports = icnaBookshelf;
