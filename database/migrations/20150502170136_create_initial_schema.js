'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(t) {
    t.increments('id').primary().unique();
    t.string('email').notNullable().unique().index();
    t.string('first_name').notNullable();
    t.string('name').notNullable();
    t.string('password').notNullable();
    t.integer('balance').notNullable().defaultTo(0);
    t.dateTime('last_login').notNullable().defaultTo(new Date(0));
    
    // reset password stuff
    t.string('reset_password_token');
    t.dateTime('reset_password_expires').notNullable().defaultTo(new Date(0));

    // Timestamps
    t.timestamps();

    // Associations
    t.integer('team_id').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
