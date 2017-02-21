const CONFIG = require('config');
const Promise = require('bluebird');
const fs = require('helpers/fs');
const path = require('path');
const destination = require('./destination');
const fetch = require('node-fetch');

const upload = function (url, userId) {
  // Crete respose data -> emulate Multer format
  // ===========================================================================
  let data = destination.emulateMulterData(url, userId);
  let maxFileSize = CONFIG.multer.filesize * 1024 * 1024 * 8;

  return fetch(url, {size: maxFileSize}).then((res) => {
    if (res.ok && res.headers.get('content-type') === 'video/webm') {
      return res.buffer();
    } else {
      throw {status: 404, message: `Requested webm not found by ${url}`}
    }
  }).then((buffer) => {
    return destination.ensureDirectory(data.directory).then((target) => {
      data.path = path.join(target, data.filename);
      return fs.writeFileAsync(data.path, buffer).then(() => {
        data.size = buffer.length;
        return data;
      });
    });
  });
}

module.exports = upload;




// // Get remote file
// // ===========================================================================
// request.get({url: req.body.url, encoding: 'binary'}, (err, response, body) => {
//   upload.ensureDirectory(data.directory, (err, target) => {
//     data.path = path.join(target, data.filename);
//     fs.writeFile(data.path, body, 'binary', (err) => {
//       if(err) {
//         next(err);
//       } else {
//         data.size = body.length;
//         res.json(data);
//       }
//     }); 
//   });
// });