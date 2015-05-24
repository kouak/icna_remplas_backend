/**
 * Auth controller
 */

var User        = require('../models/user.js');
var _           = require('lodash');
var Promise     = require('bluebird');

authController = {
  createReset: function(req, res) { },
  getByToken: function(req, res) { },
  resetPassword: function(req, res) { },
  
  login: function(req, res) {
    // if(req.user) { return res.send({error: 'Already logged in'}); }

    // Check parameters
    if(!req.body.email || !req.body.password) {
      return res.send({error: 'Must provide username and password !'});
    }
    User.findOne({email: req.body.email}).bind({})
    .then(function(user) {
      if(!user) { return Promise.reject(new Error('Invalid email/password')); }
      this.user = user;
      return user.comparePassword(req.body.password);
    })
    .then(function(passwordOk) {
      if(passwordOk) { 
        return this.user.issueToken().then(function(t) {
          res.send({token: t});
        });
      }
       return Promise.reject(new Error('Invalid email/password'));
    })
    .catch(function(err) {
      console.log(err);
      res.send(err.message);
    });
  },

  refreshToken: function(req, res) { }
};

module.exports = authController;
