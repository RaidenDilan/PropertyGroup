const User = require('../models/user');

function indexUser(req, res, next) {
  User
    .find()
    .exec()
    .then((users) => res.json(users))
    .catch((err, next) => {
      if (err.status) return res.status(err.status).json({ message: err.message });
      return res.status(500).json({ message: err.message });
    });
}

function showUser(req, res, next) {
  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound('User not found');
      return res.json(user);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;
  if(typeof req.user.group === 'object' || req.user.group instanceof Object) req.body.group = req.user.group;

  User
    .findById(req.params.id)
    .exec()
    .then((user) => {
      if(!user) return res.notFound('User not found');

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
    .exec()
    .then((user) => {
      if(!user) return res.notFound('User not found');
      return user.remove();
    })
    .then((user) => res.status(200).json({ message: `${user.username} deleted` }))
    .catch(next);
}

module.exports = {
  index: indexUser,
  show: showUser,
  update: updateUser,
  delete: deleteUser
};
