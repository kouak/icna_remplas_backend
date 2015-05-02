'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('centers', function(t) {
      t.increments('id').primary().unique();
      t.string('name').notNullable();
      t.integer('cycle_period').notNullable().defaultTo(0);

      // Time stamps
      t.timestamps();
    }
  ), knex.schema.createTable('teams', function(t) {
      t.increments('id').primary().unique();
      t.string('name').notNullable();

      // Timestamps
      t.timestamps();

      // Associations
      t.integer('center_id').unsigned().index().notNullable();
    }
  )]);
};

exports.down = function(knex, Promise) {
  return Promise.all([knex.schema.dropTable('centers'), knex.schema.dropTable('teams')]);
};
