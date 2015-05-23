'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('users', function(t) {
    t.string('login_token');
    t.dateTime('login_token_expires').notNullable().defaultTo(new Date(0));
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('users', function(t) {
    t.dropColumns('login_token', 'login_token_expires');
  });
};
