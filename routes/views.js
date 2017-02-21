const express = require('express');
const router = express.Router();
const path = require('path');
const CONFIG = require('config');
const Webm = require('models/webm');
const Crud = require('helpers/crud');

// Simple route to display frontend
// ===========================================================================
router.get('/', (req, res, next) => {
  const public = (req.app.get('env') === 'development') ? CONFIG.paths.frontend[0] : CONFIG.paths.frontend[1];
  res.sendFile('index.html', { root: path.join(CONFIG.paths.root, public) });
});

// Simple route for a single webm display
// ===========================================================================
router.get(`/${CONFIG.routes.view}/:id`, Crud.decodeUrl, Crud.readOne(Webm), (req, res, next) => {
  res.render('webm', Object.assign({host: CONFIG.url}, req[Webm.name]));
});

module.exports = router;