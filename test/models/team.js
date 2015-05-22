var should = require('should');
var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;

describe('team model', function() {
  var Team = require(appSettings.ROOTDIR + '/app/models/team');


  it('should load', function(done) {
    should.exist(Team);
    done();
  });

  describe('loaded', function() {
    before(function(done) {
      knex('teams').truncate().then(function() { done(); });
    }); // Init db

    describe('saving', function() {
      it('should save with proper values', function() {
        var c = {
          name: 'bla',
          centerId: 1
        };

        return Team.forge(c).save().should.be.fulfilled;
      });
    });
  });
});
