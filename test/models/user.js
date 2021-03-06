var should = require('should');
var shouldPromised = require('should-promised');

var _ = require('lodash');

var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');
var knex = initDb.knex;
var User = require(appSettings.ROOTDIR + '/app/models/user');
var Team = require(appSettings.ROOTDIR + '/app/models/team');

var Promise = require('bluebird');

describe('User model', function() {
  it('should load', function(done) {
    should.exist(User);
    done();
  });

  describe('loaded', function() {
    describe('saving', function() {

      beforeEach(function(done) {
        Promise.try(function() {
          return knex('users').truncate();
        })
        .then(function() {
          // Remove teams
          return knex('teams').truncate();
        })
        .then(function() {
          // Add stub team
          return knex('teams').insert({id: 2, name: 'bla', center_id: 1});
        })
        .then(function() {
          done();
        });
      }); // Init db

      afterEach(function(done) {
        Promise.all([
          knex('users').truncate(),
          knex('teams').truncate()
        ]).then(function() { done(); });
      });

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

        var u2 = {
          name: 'bla'
        };
        
        return Promise.all([
          User.forge(u).save().should.be.rejectedWith(/ValidationError.*email/),
          User.forge(u2).save().should.be.rejectedWith(/ValidationError.*firstName/),
          true
        ]);
      });

      it('should reject saving with invalid teamid', function() {
        var u = {
          name: 'bla',
          firstName: 'blabla',
          email: 'b@b.com',
          password: '123456',
          teamId: 4
        };
        
        return User.forge(u).save().should.be.rejectedWith(/ValidationError.*Team/);

      });

    });
    
    describe('given a proper user in database', function() {
      var u = {
        name: 'bla',
        firstName: 'blabla',
        email: 'a@a.com',
        password: '123456',
        teamId: 2
      };

      before(function(done) {
        Promise.try(function() {
          return knex('teams').truncate();
        })
        .then(function() {
          return knex('teams').insert({id: 2, name: 'team', center_id: 1});
        })
        .then(function() {
          return User.forge(u).save();
        })
        .then(function() { done(); });
      });

      after(function(done) {
        Promise.try(function() {
          return knex('teams').truncate();
        })
        .then(function() {
          return knex('users').truncate();
        })
        .then(function() {
          done();
        });
      });

      it('should reject registration of duplicate email', function() {
        var u1 = _.clone(u);
        var u2 = _.clone(u);
        u2.email = 'A@A.COM';
        return Promise.all([
          User.forge(u1).save().should.be.rejectedWith(/ValidationError.*Email.*taken/),
          User.forge(u2).save().should.be.rejectedWith(/ValidationError.*Email.*taken/)
        ]);
      });

      it('should not have a password field in json', function() {
        return User.findOne({email: u.email})
          .then(function(user) {
            return user.toJSON().should.not.have.properties('password');
          });
      });

      it('should not have a resetPasswordToken field in json', function() {
        return User.findOne({email: u.email})
          .then(function(user) {
            return [
              user.toJSON().should.not.have.properties('resetPasswordToken'),
              user.toJSON().should.not.have.properties('resetPasswordExpires'),
              user.toJSON({showResetToken: true}).should.have.properties('resetPasswordToken'),
              user.toJSON({showResetToken: true}).should.have.properties('resetPasswordExpires')
            ];
          });
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
        Promise.try(function() {
          return knex('teams').truncate();
        })
        .then(function() {
          return knex('teams').insert({id: 2, name: 'team', center_id: 1});
        })
        .then(function() {
          return User.forge(u).save();
        })
        .then(function() { done(); });
      });

      after(function(done) {
        return knex('users').truncate().then(function() { done(); });
      });


      it('should encrypt password', function() {
        return User.findOne({email: u.email}).then(function(ret) {
          return ret.get('password').should.not.be.equal('123456');
        });
      });

      it('should not reencrypt password', function() {
        var enc;
        return User.findOne({email: u.email}).then(function(ret) {
          enc = ret.get('password');
          return ret.set('name', 'blabla').save();
        })
        .then(function(saved) {
          return User.findOne({email: u.email});
        })
        .then(function(ret) {
          return ret.get('password').should.be.equal(enc);
        });
      });

      it('should compare passwords', function() {
        return User.findOne({email: u.email}).then(function(ret) {
          return ret.comparePassword(u.password).should.finally.equal(true);
        });
      });

      it('should reject password change with invalid old password', function() {
        return User.findOne({email: u.email}).then(function(user) {
          return user.changePassword('invalidpassword', '23534252').should.be.rejectedWith(/does not match/);
        });
      });

      it('should reject password change with invalid new password', function() {
        return User.findOne({email: u.email}).then(function(user) {
          return Promise.all([
            user.changePassword(u.password, 'shrt').should.be.rejectedWith(/ValidationError.*password/),
            user.changePassword(u.password, '').should.be.rejectedWith(/ValidationError.*password/)
          ]);
        });
      });

      it('should allow password changes', function() {
        return User.findOne({email: u.email}).then(function(user) {
          return user.changePassword(u.password, 'newpassword')
        })
        .then(function(user) {
          return user.comparePassword('newpassword').should.finally.equal(true);
        });
      });

    });
  });
});
