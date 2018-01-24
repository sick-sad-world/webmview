const _ = require('lodash');
const ShortId = require('id-shorter')({
  isFullId: true
});

class Crud {
  static decodeUrl(req, res, next) {
    if (req.params.id && req.params.id.length < 24) {
      req.params.id = ShortId.decode(req.params.id);
    }
    next();
  }

  static sendData(target) {
    return (req, res) => {
      res.json(_.result(res.locals, target))
    }
  }

  static _writer(res, key, data) {
    res.locals[key] = data;
  }

  static writeData(res, Model) {
    return (data) => {
      this._writer(res, Model.modelName, Model.toJSON(data));
    }
  }

  static readAll (Model, query) {
    return (req, res, next) => {
      Model
        .find(_.result(req, query))
        .lean()
        .exec()
        .then(this.writeData(res, Model))
        .then(next)
        .catch(err => next(err))
    }
  }

  static readOne (Model) {
    return (req, res, next) => {
      Model
        .findById(req.params.id)
        .lean()
        .exec()
        .then(data => (!data) ? next(`${Model.name} with id: ${req.params.id} not found`) : data )
        .then(this.writeData(res, Model))
        .then(next)
        .catch(err => next(err));
    }
  }

  static createOne (Model, props) {
    return (req, res, next) => {
      Model
        .create(_.pick(req.body, props))
        .then(this.writeData(res, Model))
        .then(next)
        .catch(err => next(err));
    }
  }

  static modifyItem(Model) {
    return (req, res, next) => {
      let id = (req.params.id && req.user.role === 'admin') ? req.params.id : req.user.id;
      Model
        .findById(id)
        .then(model => _.assign(model, req.body).save())
        .then(this.writeData(res, Model))
        .then(next)
        .catch(err => next(err));
    }
  }

  static deleteOne (Model) {
    return (req, res, next) => {
      let id = (req.params.id && req.user.role === 'admin') ? req.params.id : req.user.id;
      Model
        .findByIdAndRemove(id)
        .then(() => {
          this._writer(res, Model.modelName, { message: `Document id:${id} successfully deleted.` });
        })
        .then(next)
        .catch(err => next(err));
    }
  }
}
module.exports = Crud;