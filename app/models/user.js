var _ = require('lodash'),
    myBs = require(__dirname + '/db'); // Our Bookshelf Instance


var ModelBase = require('./base')(myBs), // Bookshelf-base model
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
    // Encrypt Password
    this.on('creating', this.encryptPassword);
    // Validate existence of team parent
    this.on('saving', this.validateTeamAssociation);
    // Validate uniqueness of email
    this.on('saving', this.validateEmailUniqueness);
  },

  /* Validation with Joi */
  validation: {
    firstName: Joi.string().min(1),
    name: Joi.string().min(1),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    teamId: Joi.number().integer(),
    balance: Joi.number().integer(),
    lastLogin: Joi.date(),
    resetPasswordToken: Joi.any().strict(false),
    resetPasswordExpires: Joi.date()
  },

  validationCreate: {
    firstName: Joi.any().required(),
    name: Joi.any().required(),
    email: Joi.any().required(),
    password: Joi.any().required(),
    teamId: Joi.any().required()
  },

  validationUpdate: {
    id: Joi.number().integer()
  },

  /* Team association */
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
        return Promise.reject(new Error('ValidationError: Team doesn\'t exist'));
      }
      return self;
    });
  },

  /* Email uniqueness */
  validateEmailUniqueness: function() {
    var self = this;
    
    if(!self.get('email')) { return self; } // No email set, nothing to see here
    if(!self.hasChanged('email')) { return self; } // Our email hasn't changed, don't query

    self.set('email', self.get('email').toLowerCase()); // lower case the email
    

    return User.findOne({email: self.get('email')})
    .then(function(user) {
      // No user found
      if(!user) {
        return self;
      }
      /* User exists, invalidate email field */
      return Promise.reject(new Error('ValidationError: Email "' + self.get('email') + '" is already taken'));
    });
  },

  /* toJSON */
  toJSON: function(options) {
    // Defaults to showResetToken: false
    var options = _.extend({showResetToken: false}, options);

    var attrs = ModelBase.prototype.toJSON.call(this, options);

    delete attrs.password;

    if(!options.showResetToken) {
      delete attrs.resetPasswordToken;
      delete attrs.resetPasswordExpires;
    }

    return attrs;
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
    var validation = Joi.validate({password: newPassword}, this.validation);

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
  },

  updatePasswordViaResetToken: function(token, newPassword) {
    var self = this;
    var validation = Joi.validate({password: newPassword}, (new User).validation); // Access prototype from class methods
    if(validation.error) {
      return Promise.reject(new Error(validation.error));
    }

    return self.findOne({resetPasswordToken: token})
    .bind({})
    .then(function(user) {
      if(_.isEmpty(user)) {
        console.log('User not found with this token');
        return Promise.reject(new self.NotFoundError('not found'));
      }
      this.user = user;
      return Promise.resolve();
    })
    // Encrypt new password
    .then(function() {
      var user = this.user;
      return user.hashPassword(newPassword);
    })
    // Set hashed password and save
    .then(function(hashed) {
      var user = this.user;
      user.set('resetPasswordToken', ''); // Consume token
      user.set('resetPasswordExpires', new Date(0));
      return user.set('password', hashed).save();
    });
  }

});

module.exports = myBs.model('User', User);

