var should = require('should');
var shouldPromised = require('should-promised');

var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;
var User = require(appSettings.ROOTDIR + '/app/models/user');

describe('User model', function() {


  it('should load', function(done) {
    should.exist(User);
    done();
  });

  describe('loaded', function() {

    describe('saving', function() {

      beforeEach(function(done) {
        knex('users').truncate().then(function() { done(); });
      }); // Init db

      it('should save with proper values', function() {
        var u = {
          name: 'bla',
          firstName: 'blabla',
          email: 'a@a.com',
          password: '123456',
          teamId: 2
        };

        return User.forge(u).save().then(function(user) { return user.id.should.eql(1); });
      });

      it('should reject saving with improper values', function() {
        var u = {
          name : 'bla',
          firstName: 'blabla',
          email: 'a',
          password: '123456',
          teamId: 2
        };

        
        return User.forge(u).save().should.be.rejectedWith(/ValidationError/);
      });
    });
  });
});
