'use strict';

exports.seed = function(knex, Promise) {

  var centers = [
    {
      id: 1,
      name: 'LFEE',
      cycle_period: 12
    },
    {
      id: 2,
      name: 'LFRR',
      cycle_period: 12
    }
  ];
  var insert = function() {

    var p = [];

    // Create teams 1 through 12
    centers.forEach(function(c) { 
      p.push(
         knex('centers')
        .insert(c)
      );
    });

    return p;
  };

  
  return knex('centers').del()
    .then(function() { return Promise.all(insert()).then(console.log) } );

};
