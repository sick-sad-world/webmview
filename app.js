// Basic modules
// ==================================================================
const path = require('path');
const express = require('express');
const mongoose = require('helpers/mongoose');
const bodyParser = require('body-parser');
const app = express();

// Constants & Configs
// ==================================================================
const CONFIG = require('config');
const IS_DEV = (app.get('env') === 'development');
const DIR = path.join(__dirname, (IS_DEV) ? CONFIG.paths.frontend[0] : CONFIG.paths.frontend[1]);

// Utility middlewares connection
// ==================================================================
const morgan = require('morgan');
const favicon = require('serve-favicon');
const HttpError = require('helpers/error');

// Session middlewares connection
// ==================================================================
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('helpers/passport');

// App functionality middlewares connection
// ==================================================================
const views = require('routes/views');
const webm = require('routes/webm');
const account = require('routes/account');

// Set default view engine
// ==================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, CONFIG.paths.views));

// Logging
// ==================================================================
app.use(morgan((IS_DEV) ? 'dev' : 'combined'));

// Query params parsing
// ==================================================================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// Cookies and sessions implementation
// ==================================================================
app.use(cookieParser());
app.use(session({
  name: CONFIG.session.name,
  secret: CONFIG.session.secret,
  key: CONFIG.session.key,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());

// Utility middlewares implementation
// ==================================================================
app.use(favicon(path.join(DIR, '/img/favicon.png')));

// Global middlewares wich used on ALL possible routes
// ==================================================================
// app.use((req, res, next) => {
//   if (req.session) {
//     console.log('session', req.session.id);
//   }
//   if (req.user) {
//     console.log('user', req.user);
//   }
//   if (req.params) {
//     console.log('param', req.params);
//   }
//   next();
// })

// App functionality middlewares implementation
// ==================================================================
app.use(views);
app.use(webm(CONFIG.routes.webm, CONFIG.multer.limit));
app.use(account(CONFIG.routes.account));

// App static content implementation
// ==================================================================
app.use(`/${CONFIG.paths.content}`, express.static(path.join(__dirname, CONFIG.paths.content)));
app.use(express.static(DIR));

// Catch 404 and forward to error handler
// ==================================================================
app.use((req, res, next) => next(`Resource "${req.headers.host+req.url}" not found`));

// Error handling valid options are:
// string -> 404|message
// number -> status|default message
// Object -> status,message,type
// ==================================================================
app.use((err, req, res, next) => {
  console.log(err);
  err = new HttpError(err);
  res.status(err.status || 500).json(err.toJSON());
});

module.exports = app;