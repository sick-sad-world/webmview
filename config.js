const port = normalizePort(process.env.PORT || 3000);
const url = `http://localhost:${port}`;

// Normalize a port into a number, string, or false.
// ==================================================================
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

module.exports = {
  url: url,
  port: port,
  db: 'mongodb://webmview:7xz9ogf1@localhost:27017/webmview',
  paths: {
    root: __dirname,
    frontend: ['public', 'production'],
    content: 'content',
    webm: 'webm',
    userpic: 'userpic',
    thumbnail: 'thumb', 
    views: 'views'
  },
  multer: {
    fileSize: 100,
    files: 4
  },
  routes: {
    webm: 'w',
    view: 'view',
    account: 'a'
  },
  session: {
    name: 'webmview_ssn',
    secret: 'webmview',
    key: 'wbms'
  }
};