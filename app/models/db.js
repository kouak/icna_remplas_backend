var _ = require('lodash'),
    bookshelf = require('bookshelf'),

    icnaBookshelf;



function knexfile() {
  var def = 'development';

  var knexfile = require('../../database/knexfile.js');
  
  var env = process.env.NODE_ENV || def;

  return knexfile[env.toLowerCase()] || knexfile[def];
}


knex = require('knex')(knexfile());
icnaBookshelf = bookshelf(knex);

icnaBookshelf.plugin('registry');

module.exports = icnaBookshelf;
