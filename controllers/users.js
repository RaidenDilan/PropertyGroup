const User = require('../models/user');

function indexUser(req, res, next) {
  User
    .find()
    .populate('group')
    .exec()
    .then((users) => res.json(users))
    .catch(next);
}

function showUser(req, res, next) {
  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();
      res.json(user);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;

  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();

      for (const field in req.body) {
        user[field] = req.body[field];
      }

      return user.save();
    })
    .then((user) => res.json(user))
    .catch(next);
}

function deleteUser(req, res, next) {
  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();
      return user.remove();
    })
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = {
  index: indexUser,
  show: showUser,
  update: updateUser,
  delete: deleteUser
};
