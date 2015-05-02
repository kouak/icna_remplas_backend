'use strict';

var center_id = 1;

exports.seed = function(knex, Promise) {
  var insert = function() {

    var p = [];

    // Create teams 1 through 12
    for(var i = 1; i <= 12; i++) {
      p.push(
         knex('teams')
        .insert({id: i, name: i, center_id: center_id})
      );
    }

    return p;
  };

  
  return knex('teams').del()
    .then(function() { return Promise.all(insert()).then(console.log) } );

};
