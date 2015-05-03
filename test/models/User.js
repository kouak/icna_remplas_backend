var should = require('should');
var initDb = require(__dirname + '/../initDb');
var appSettings = require(__dirname + '/../settings');

describe('User model', function() {
  var User = require(appSettings.ROOTDIR + '/app/models/user');


  it('should load', function(done) {
    should.exist(User);
    done();
  });

  describe('loaded', function() {
    before(initDb.before); // Init db

    describe('saving', function() {
      it('should save with proper values', function(done) {
        var u = {
          id: 123,
          name: 'bla',
          first_name: 'blabla',
          email: 'a@a.com',
          password: '123456',
          team_id: 2
        };

        User.forge(u).save().finally(function(err) {console.log(err); done(); });

      });
    });
  });
});
