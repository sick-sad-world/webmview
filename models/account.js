const crypto = require('crypto');
const Mongoose = require('helpers/mongoose');
const Schema = Mongoose.Schema;
const ShortId = require('id-shorter')({
  isFullId: true
});

// Set all required properties of model
// ==================================================================
let Account = new Schema({
  username: {
    type: String,
    required: [true, 'You need a username wich will be used as login'],
    unique: [true, '{VALUE} aready used by someone']
  },
  hash: {
    type: String
  },
  salt: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  display_name: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    unique: [true, '{VALUE} aready registered in system'],
    match: [ /^[-\w.]+@([A-z0-9][-A-z0-9]+\.)+[A-z]{2,4}$/, 'Each user should have a valid email']
  },
  role: {
    type: String,
    default: 'user',
    validator: (v) => ['admin', 'user'].indexOf(v) >= 0
  }
});

// Make virtual password property
// ==================================================================
Account.virtual('password')
  .set(function(pass) {
    this._plainPass = pass;
    this.salt = Math.random() + '';
    this.hash = this.encryptPassword(pass);
  })
  .get(function() { return this._plainPass });

// Instance methods
// ==================================================================
Account.methods.encryptPassword = function(pass) { return crypto.createHmac('sha1', this.salt).update(pass).digest('hex') };
Account.methods.checkPassword = function(pass) { return this.encryptPassword(pass) === this.hash };

// JSON transformation function
// ==================================================================
let toJSON = (doc) => {
  doc.id = doc._id;
  doc.url = ShortId.encode(doc.id);
  delete doc.salt;
  delete doc.hash;
  delete doc._id;
  delete doc.__v;
  return doc;
};

// JSON.transform customization
// ==================================================================
Account.options.toJSON = {
  transform (doc, ret) {
    return toJSON(ret);
  }
};

// Make method to process .lean() results to filter our respoce data
// ==================================================================
Account.statics.toJSON = (doc) => {
  if (doc.length) {
    return doc.map(toJSON);
  } else {
    return toJSON(doc);
  }
};

// Set display_name to name value when model instance is created
// ==================================================================
Account.pre('save', function (next) {
  if (!this.display_name) this.display_name = this.username;
  next();
});

module.exports = Mongoose.model('Account', Account);