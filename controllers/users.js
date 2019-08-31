const User = require('../models/user');

function indexUser(req, res, next) {
  User
    .find()
    .populate('group')
    .exec()
    .then((users) => res.json(users))
    .catch((err, next) => {
      if (err.status) return res.status(err.status).json({ message: err.message });
      else return res.status(500).json({ message: err.message });
    });
}

function showUser(req, res, next) {
  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound('User not found');
      else return res.json(user);
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
      if(!user) return res.notFound('User not found');

      for (const field in req.body) {
        user[field] = req.body[field];
      }

      if (user.group !== null) user.group = req.user.group; // asign user group to user object during update - this could probably be taken care of on the client side

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
