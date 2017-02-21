const CONFIG = require('config');
const path = require('path');
const base64 = require('helpers/base64');
const fs = require('helpers/fs');

const trimFileName = (name) => name.split('.webm')[0];

const getTargetDirectory = (name) => path.join(CONFIG.paths.content, CONFIG.paths.webm, base64.encode(name));

const getTargetName= (name) => base64.encode(name)+'.webm';

const ensureDirectory = (dir, cb) => {
  const target = path.join(CONFIG.paths.root, dir);
  return fs
    .accessAsync(target, fs.constants.R_OK | fs.constants.W_OK)
    .catch(err => (err.code === 'ENOENT') ? fs.mkdirAsync(target) : target)
    .then(() => target);
};

const emulateMulterData = (url, userId) => {
  let name = trimFileName(path.basename(url));
  return {
    path: '',
    size: 0,
    directory: getTargetDirectory(userId || ''),
    created: Date.now(),
    name: name,
    filename: getTargetName(name)
  };
}

module.exports.emulateMulterData = emulateMulterData;
module.exports.trimFileName = trimFileName;
module.exports.getTargetDirectory = getTargetDirectory;
module.exports.getTargetName = getTargetName;
module.exports.ensureDirectory = ensureDirectory;