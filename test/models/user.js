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
          name: 'bla',
          firstName: 'blabla',
          email: 'a',
          password: '123456',
          teamId: 2
        };

        
        return User.forge(u).save().should.be.rejectedWith(/ValidationError/);
      });

    });
    
    describe('password', function() {
      var u = {
        name: 'bla',
        firstName: 'blabla',
        email: 'a@a.com',
        password: '123456',
        teamId: 2
      };
      
      before(function(done) {
        User.forge(u).save().then(function() { done(); });
      });

      after(function(done) {
        return knex('users').truncate().then(function() { done(); });
      });


      it('should encrypt password', function() {
        return User.findOne({email: u.email}).then(function(ret) {
          return ret.get('password').should.not.be.equal('123456');
        });
      });

      it('should compare passwords', function() {
        return User.findOne({email: u.email}).then(function(ret) {
          return ret.comparePassword(u.password).should.finally.equal(true);
        });
      });
    });
  });
});
