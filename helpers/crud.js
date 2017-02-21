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
    return (req, res, next) => {
      res.json(_.result(req, target))
    }
  }

  static writeData(req, next, Model) {
    return (data) => {
      console.log(data);
      req[Model.modelName] = Model.toJSON(data);
      next();
    }
  }

  static readAll (Model, query) {
    return (req, res, next) => {
      Model
        .find(_.result(req, query))
        .lean()
        .exec()
        .then(this.writeData(req, next, Model))
        .catch(err => next(err))
    }
  }

  static readOne (Model) {
    return (req, res, next) => {
      if (!req.params.id) {
        next({status: 500, message: 'Please provide id to retrieve something'});
      } else {
        Model
          .findById(req.params.id)
          .lean()
          .exec()
          .then(data => (!data) ? next(`${Model.name} with id: ${req.params.id} not found`) : data )
          .then((this.writeData(req, next, Model)))
          .catch(err => next(err));
      }
    }
  }

  static createOne (Model, props) {
    return (req, res, next) => {
      Model
        .create(_.pick(req.body, props))
        .then(this.writeData(req, next, Model))
        .catch(err => next(err));
    }
  }

  static modifyItem(Model) {
    return (req, res, next) => {
      if (!req.params.id) {
        next({status: 500, message: 'Please provide id to edit something'});
      } else {
        let id = (req.params.id && req.user.role === 'admin') ? req.params.id : req.user.id;
        Model
          .findById(id)
          .then(model => _.assign(model, req.body).save())
          .then(this.writeData(req, next, Model))
          .catch(err => next(err));
      }
    }
  }

  static deleteOne (Model) {
    return (req, res, next) => {
      if (!req.params.id) {
        next({status: 500, message: 'Please provide id to delete something'});
      } else {
        let id = (req.params.id && req.user.role === 'admin') ? req.params.id : req.user.id;
        Model
          .findByIdAndRemove(id)
          .then((model) => {
            console.log(Model.modelName, model);
            req[Model.modelName] = { message: `Document id:${id} successfully deleted.` }
            next();
          })
          .catch(err => next(err));
      }
    }
  }
}
module.exports = Crud;