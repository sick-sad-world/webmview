const _ = require('lodash');

class Permission {
  // Check whatever passport.js loaded an account to REQ and it has validID
  // ==================================================================
  static checkAuth (req) {
    return req.user && req.user._id.toString().length === 24;
  }

  // Check whatever passport.js loaded an account to REQ and it's id is the same as session user or it has [role] equal to "admin"
  // ==================================================================
  static checkOwner (req) {
    return (this.checkAuth(req) && req.user._id.toString() === req.params.id) || this.checkAdmin(req);
  }

  // Check whatever passport.js loaded an account to REQ and it has [role] equal to "admin"
  // ==================================================================
  static checkAdmin (req) {
    return this.checkAuth(req) && req.user.role === 'admin';
  }

  static  isAuth (message) {
    message = message || 'Only authenificated user able to do this.';
    return (req, res, next) => next(this.checkAuth(req) ? null : {status: 403, message: message});
  }

  static isOwner (message) {
    message = message || 'You can\'t preform this actions for other users.';
    return (req, res, next) => next(this.checkOwner(req) ? null : {status: 403, message: message});
  }

  static  isAdmin (message) {
    message = message || 'Only admin priviledged users able to preform this action';
    return (req, res, next) => next(this.checkAdmin(req) ? null : {status: 403, message: message});
  }

  static getByOwner(target) {
    return (req, res, next) => {
      let query = null;
      if (req.user) {
        query = { owner: req.user.id }
      }
      if (req.session) {
        query = { owner: req.session.id }
      }
      _.set(req, target, query);
      next();
    }
  }

  static login (target) {
    return (req, res, next) => {
      req.login(_.result(req, target), (err) => next(err));
    }
  }

  static logout () {
    return (req, res) => {
      req.logout();
      res.json({message: 'Logged out successfully.'});
    }
  }
}
module.exports = Permission;