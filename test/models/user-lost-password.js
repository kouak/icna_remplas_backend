var should = require('should');
var shouldPromised = require('should-promised');

var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;
var User = require(appSettings.ROOTDIR + '/app/models/user');
var Team = require(appSettings.ROOTDIR + '/app/models/team');

var Promise = require('bluebird');

var validUser = {
  name: 'bla',
  firstName: 'blabla',
  email: 'a@a.com',
  teamId: 1,
  password: '123456'
};

describe('User lost password', function() {
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

  describe('given an user in db', function() {
    beforeEach(function(done) {
      Promise.try(function() {
        return User.forge(validUser).save();
      })
      .then(function() { done(); });
    });

    afterEach(function(done) {
      return Promise.try(function() {
        return knex('users').truncate();
      }).then(function() { done(); });
    });

    describe('requestResetToken', function() {
      it('should throw an error with invalid data', function() {
        return Promise.all([
          User.requestResetToken().should.be.rejectedWith(/valid email/),
          User.requestResetToken({email: 'wrong@email.com'}).should.be.rejectedWith(/not found/)
        ]);
      });

      it('should generate a proper password token with correct email supplied', function() {
        return Promise.try(function() {
          return User.requestResetToken({email: validUser.email}).should.not.be.rejected; // First test
        }).then(function() {
          return User.findOne({email: validUser.email}).then(function(user) {
            return [user.get('resetPasswordToken').should.not.equal(''),
                    user.get('resetPasswordExpires').should.be.a.Date,
                    user.get('resetPasswordExpires').should.not.equal(new Date)]
          });
        });
      });
    });

    describe('updatePasswordViaResetToken', function() {
      it('should throw an error with invalid token', function() {
        return User.updatePasswordViaResetToken('invalidtoken', '123456').should.be.rejectedWith(/not found/);
      });

      describe('given user with request token', function() {
        var validToken;

        beforeEach(function(done) {
          Promise.try(function() {
            return User.requestResetToken({email: validUser.email});
          }).then(function(user) {
            validToken = user.get('resetPasswordToken');
            done();
          });
        });

        it('should throw an error with invalid password', function() {
          return User.updatePasswordViaResetToken(validToken, '').should.be.rejectedWith(/ValidationError/);
        });

        it('should update password for given user', function() {
          var newPassword = '654321';
          return Promise.try(function() { 
            return User.updatePasswordViaResetToken(validToken, newPassword).should.be.fulfilled;
          }).then(function() {
            return User.findOne({email: validUser.email});
          }).then(function(user) {
            return user.comparePassword(newPassword).should.finally.eql(true);
          });
        });

      });
    });
  });
});
