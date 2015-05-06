var _ = require('lodash'),
    myBs = require(__dirname + '/db'); // Our Bookshelf Instance


var ModelBase = require('bookshelf-modelbase')(myBs), // Bookshelf-base model
    Joi = require('joi'),
    Promise = require('bluebird'),
    bcrypt = Promise.promisifyAll(require('bcrypt')),
    crypto = Promise.promisifyAll(require('crypto')),

    User;

myBs.plugin('virtuals');

User = ModelBase.extend({
  tableName: 'users',

  initialize: function() {
    ModelBase.prototype.initialize.call(this); // Call ModelBase initialize
    this.on('creating', this.encryptPassword);
    this.on('saving', this.validateTeamAssociation);
  },

  /* Validation with Joi */
  validate: {
    firstName: Joi.string(),
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    newPassword: Joi.string().optional(),
    teamId: Joi.number().integer(),
    balance: Joi.number().integer().optional(),
    lastLogin: Joi.date().optional(),
    resetPasswordToken: Joi.any().optional().strict(false),
    resetPasswordExpires: Joi.date().optional()
  },

  team: function() {
    return this.belongsTo('Team');
  },


  validateTeamAssociation: function() {
    var self = this;

    return Promise.try(function() {
      return self.related('team').fetch();
    })
    .then(function(team) {
      /* team will be an object if team exists, null otherwise */
      var validation = Joi.validate({team: team}, {team: Joi.object()});
      
      if(validation.error) {
        return Promise.reject(new Error(validation.error));
      }
      return self;
    });
  },

  encryptPassword: function() { // Called before create, encrypt 'password' field
    var self = this;
    if(!self.isNew) { return Promise.reject(new Error('should never happen')); }
    return self.hashPassword(self.get('password'))
    .then(function(hashed) {
      return self.set('password', hashed);
    });
  },


  changePassword: Promise.method(function(oldPassword, newPassword) {
    var self = this;
    

    /* Validate 'newPassword' with 'password' validation rules */
    var validation = Joi.validate({password: newPassword}, this.validate);

    if(validation.error) {
      return Promise.reject(new Error(validation.error));
    }


    // Compare oldPassword with database
    return self.comparePassword(oldPassword)
    // Check if matching
    .then(function(isOldPasswordMatching) {
      if(!isOldPasswordMatching) {
        return Promise.reject(new Error('Old password does not match'));
      } else {
        return Promise.resolve();
      }
    })
    // Encrypt new password
    .then(function() {
      return self.hashPassword(newPassword)
      .then(function(hashed) {
        return self.set('password', hashed);
      });
    });
  }),

  comparePassword: function(plainText) {
    return bcrypt.compareAsync(plainText, this.get('password'));
  },

  hashPassword: function(plainText) {
    return bcrypt.genSaltAsync(10)
      .then(function(result) {
        return bcrypt.hashAsync(plainText, result);
      });
  }
}, {
  /* Request a password token
   * options.email must be set
   */
  requestResetToken: function(options) {
    var self = this;
    var options = _.extend({}, options);
    // Not email supplied, throw error
    if(options.email === undefined) { return Promise.reject(new Error('Please supply a valid email')); }

    // Find user with supplied email
    return self.findOne({email: options.email})
    .bind({})
    .then(function(user) {
      this.user = user; // Bind user to the promise chain
      // User not found, raise error
      if(_.isEmpty(user)) { return Promise.reject(new self.NotFoundError('not found')); }
    })
    // Generate token
    .then(function() {
      return crypto.randomBytesAsync(32);
    })
    .then(function(token) {
      // Set token expiry date
      this.user.set('resetPasswordExpires', new Date(Date.now() + 1000*3600*24*2)); // expires 2 days from now
      this.user.set('resetPasswordToken', token.toString('base64'));

      // Return save promise
      return this.user.save();
    });
  }
});

module.exports = myBs.model('User', User);

