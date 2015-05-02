var _ = require('lodash'),
    bookshelf = require('bookshelf'),
    knex = require('knex'),
    config = require('../config'),

    icnaBookshelf;

icnaBookshelf = bookshelf(knex(config.dbConfig));

module.exports = icnaBookshelf;
