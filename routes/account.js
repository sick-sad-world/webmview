const _ = require('lodash');
const Promise = require('bluebird');
const express = require('express');
const router = express.Router();
const multer = require('helpers/multer');
const Permission = require('helpers/permission');
const Crud = require('helpers/crud');
const Account = require('models/account');
const passport = require('helpers/passport');

module.exports = (URL) => {
  if (typeof URL !== 'string' && !URL.length) throw new Error('Url for route bundle should be a valid, non-empty string');

  router.route(`/${URL}`)
    .get(Permission.isAdmin(), Crud.readAll(Account), Crud.sendData('Account'))
    .post(Crud.createOne(Account, ['email', 'username', 'password']), Permission.login('Account'), Crud.sendData('Account'))
    .put(passport.authenticate('local', {failWithError: true}), Crud.sendData('user'))
    .delete(Permission.logout('local'));

  router.route(`/${URL}/:id`)
    .get(Crud.decodeUrl,  Crud.readOne(Account), Crud.sendData('Account'))
    .put(Crud.decodeUrl, Permission.isOwner(), Crud.modifyItem(Account), Crud.sendData('Account'))
    .delete(Crud.decodeUrl, Permission.isOwner(), Crud.deleteOne(Account), Crud.sendData('Account'));

  return router;
}