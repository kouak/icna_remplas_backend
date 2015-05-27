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
          (function() { jwt.verify(token, 'INVALID'); }).should.throw(/invalid/),
          (function() { jwt.verify(token, User.getJwtSecret()); }).should.not.throw
        ];
      });
    });

    it('should verify a valid token', function() {
      return savedUser.issueToken().then(function(token) {
        return [
          (function() { User.checkTokenValidity(); }).should.throw(/must pass a token/),
          (function() { User.checkTokenValidity(token); }).should.not.throw
        ];
      });
    });

    it('should embed data in payload', function() {
      return savedUser.issueToken().then(function(token) {
        var t = User.checkTokenValidity(token);
        return [
          t.should.have.property('userId'),
          t.userId.should.eql(savedUser.get('id')),
          t.should.have.property('team'),
          t.team.id.should.eql(savedUser.related('team').get('id')),
          t.should.have.property('firstName'),
          t.firstName.should.eql(savedUser.get('firstName')),
          t.should.have.property('name'),
          t.name.should.eql(savedUser.get('name'))
        ];
      });
    });

    it('should find the correct user given a token', function() {
      return savedUser.issueToken().then(function(t) {
        return User.findByToken(t).then(function(user) {
          return user.get('id').should.eql(savedUser.get('id'));
        });
      });
    });

    it('should throw an error given an expired token', function() {
      return savedUser.issueToken(-10).then(function(t) { // Issue an already expired token
        return (function() { User.findByToken(t); }).should.throw(/expired/);
      });
    });
  });
});
