const Mongoose = require('helpers/mongoose');
const Schema = Mongoose.Schema;
const path = require('path');
const fs = require('helpers/fs');
const CONFIG = require('config');
const ShortId = require('id-shorter')({
  isFullId: true
});

// Set all required properties of model
// ==================================================================
let Webm = new Schema({
    name: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    path: {
      type: String,
      required: true
    },
    created: {
      type: Date,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      required: true
    },
    directory: {
      type: String,
      required: true
    },
    owner: {
      type: String,
      required: true
    }
});

// Remove apropriate file on model destruction
// ===========================================================================
Webm.pre('remove', function(done) {
  fs.unlink(this.path).then(() => done()).catch(err => done(err))
});

// JSON transformation function
// ==================================================================
let toJSON = (doc) => {
  doc.id = doc._id;
  doc.url = path.join(CONFIG.url, CONFIG.routes.view, ShortId.encode(doc.id));
  delete doc._id;
  delete doc.__v;
  return doc;
};

// JSON.transform customization
// ==================================================================
Webm.options.toJSON = {
  transform (doc, ret, options) {
    return toJSON(ret);
  }
};

// Make method to process .lean() results to filter our respoce data
// ==================================================================
Webm.statics.toJSON = (doc) => {
  if (doc.length) {
    return doc.map(toJSON);
  } else {
    return toJSON(doc);
  }
};

module.exports = Mongoose.model('Webm', Webm);