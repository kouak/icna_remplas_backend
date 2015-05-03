var should = require('should');
var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;

describe('User model', function() {
  var User = require(appSettings.ROOTDIR + '/app/models/user');


  it('should load', function(done) {
    should.exist(User);
    done();
  });

  describe('loaded', function() {
    before(function(done) {
      knex('users').truncate().then(function() { done(); });
    }); // Init db

    describe('saving', function() {
      it('should save with proper values', function(done) {
        var u = {
          name: 'bla',
          first_name: 'blabla',
          email: 'a@a.com',
          password: '123456',
          team_id: 2
        };

        (User.forge(u).save().finally(function(err) {
          if(err) throw err;
          done();
        })).should.not.throw();

        
      });
    });
  });
});
