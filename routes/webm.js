const _ = require('lodash');
const express = require('express');
const router = express.Router();
const multer = require('helpers/multer');
const upload = require('helpers/upload');
const Crud = require('helpers/crud');
const Permission = require('helpers/permission');
const Webm = require('models/webm');


module.exports = (URL, FILES_LIMIT) => {
  if (typeof URL !== 'string' && !URL.length) throw new Error('Url for route bundle should be a valid, non-empty string');

  router.route(`/${URL}`)
    // Get all webms
    // ===========================================================================
    .get(Crud.decodeUrl, Permission.getByOwner('query'), Crud.readAll(Webm, 'query'), Crud.sendData('Webm'))

    // Create new Webm
    // ===========================================================================
    .post(multer.array('webms', FILES_LIMIT), (req, res, next) => {
      let userId = (req.user) ? req.user.id : req.session.id;
      if (req.body.url) {
        // Download new webm from url -> to Model
        // ===========================================================================
        upload(req.body.url, userId)
          .then(webm => Webm.create(_.assign({owner: userId}, webm)))
          .then(webm => res.json(webm.toJSON()))
          .catch(err => next(err));
      } else if (req.files.length) {
        // Pick files from Client -> to Model
        // ===========================================================================
        Webm.insertMany(req.files.map((file) => _.assign({owner: userId}, file)))
          .then(webms => res.json(Webm.toJSON(webms)))
          .catch(err => next(err));
      } else {
        // Send correct error if nothing provided
        // ===========================================================================
        next({status: 500, error: 'File not provided'});
      }
    });

  // Get one webm
  // ==================================================================
  router.get(`/${URL}/:id`, Crud.decodeUrl, Crud.readOne(Webm), Crud.sendData('Webm'));

  return router;
};