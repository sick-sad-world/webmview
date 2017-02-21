const CONFIG = require('config');
const Account = require('models/account');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Srialize User to session
// ==================================================================
passport.serializeUser((account, cb) => {
  console.log(account);
  cb(null, account.id);
});

// Get User from session
// ==================================================================
passport.deserializeUser((id, cb) => {
  Account.findById(id).then(account => cb(null, account)).catch(err => cb(err));
});

// Configure local auth Strategy
// ==================================================================
passport.use(new LocalStrategy((username, password, cb) => {
  Account
    .findOne({username})
    .then(account => {
      if (account) {
        if (account.checkPassword(password)) {
          cb(null, account)
        } else {
          cb(null, false, 'Incorrect password.')
        }
      } else {
        cb(null, false, 'User not registred in a system.');
      }
    })
    .catch(err => cb(err));
}));

module.exports = passport;