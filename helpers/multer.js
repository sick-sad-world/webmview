const CONFIG = require('config');
const multer = require('multer');
const destination = require('./destination');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Path will be customized based on user source
    // ===========================================================================
    file.directory = destination.getTargetDirectory(req.session.id || '');
    destination.ensureDirectory(file.directory).then(target => cb(null, target)).catch(err => cb(err));
  },
  filename: function (req, file, cb) {
    // Based on file original name and timestamp (base64) 
    // ===========================================================================
    file.created = Date.now();
    file.name = destination.trimFileName(file.originalname);
    cb(null, destination.getTargetName(file.name+file.created))
  }
});

// Create multer instance with provided options
// ===========================================================================
const upload  = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'video/webm') {
      cb(new Error('Only webms allowed'));
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: CONFIG.multer.fileSize * 1024 * 1024 * 8,
    files: CONFIG.multer.files
  }
});

module.exports = upload;