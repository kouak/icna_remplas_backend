var should = require('should');
var shouldPromised = require('should-promised');

var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;
var User = require(appSettings.ROOTDIR + '/app/models/user');
var Team = require(appSettings.ROOTDIR + '/app/models/team');

var jwt = require('jsonwebtoken');
var Promise = require('bluebird');

var validUser = {
  name: 'bla',
  firstName: 'blabla',
  email: 'a@a.com',
  teamId: 1,
  password: '123456'
};

describe('User login token', function() {
  before(function(done) {
    Promise.try(function() {
      return knex('users').truncate();
    })
    .then(function() {
      return knex('teams').truncate();
    })
    .then(function() {
      return knex('teams').insert({id: 1, name: 'stub-team', center_id: 1});
    })
    .then(function() {
      done();
    });
  });

  // Cleanup after tests
  after(function(done) {
    Promise.all([
      knex('users').truncate(),
      knex('teams').truncate(),
      knex('centers').truncate()
    ]).then(function() {
      done();
    });
  });

  describe('constants', function() {
    it('should have a secret', function() {
      return User.getJwtSecret().should.not.eql('');
    });

    it('should have a valid expiry date', function() {
      return [
        User.getJwtExpiry().should.be.instanceof(Date),
        User.getJwtExpiry().should.be.greaterThan(Date.now())
      ];
    });

    it('should not issue a token for a non existant user', function() {
      return User.forge(validUser).issueToken().should.be.rejectedWith(/non-saved user/);
    });

  });

  describe('given an user in db', function() {
    var savedUser;
    beforeEach(function(done) {
      Promise.try(function() {
        return User.forge(validUser).save();
      })
      .then(function(user) { savedUser = user; done(); });
    });

    afterEach(function(done) {
      return Promise.try(function() {
        return knex('users').truncate();
      }).then(function() { done(); });
    });

    it('should create a token', function() {
      return savedUser.issueToken().should.be.fulfilled;
    });

    it('should create a signed token', function() {
      return savedUser.issueToken().then(function(token) {
        return [
          (function() { jwt.verify(token, 'INVALID') }).should.throw(/invalid/),
          (function() { jwt.verify(token, User.getJwtSecret()) }).should.not.throw
        ];
      });
    });

    it('should embed userId in payload', function() {
      return savedUser.issueToken().then(function(token) {
        var t = jwt.verify(token, User.getJwtSecret());
        return [
          t.should.have.property('userId'),
          t.userId.should.eql(savedUser.get('id'))
        ];
      });
    });
  });
});
