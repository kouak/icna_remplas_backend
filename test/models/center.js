var should = require('should');
var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;

describe('center model', function() {
  var Center = require(appSettings.ROOTDIR + '/app/models/center');


  it('should load', function(done) {
    should.exist(Center);
    done();
  });

  describe('loaded', function() {
    before(function(done) {
      knex('centers').truncate().then(function() { done(); });
    }); // Init db

    describe('saving', function() {
      it('should save with proper values', function() {
        var c = {
          name: 'bla'
        };

        return Center.forge(c).save().should.be.fulfilled;
      });
    });
  });
});
