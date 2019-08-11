const User = require('../models/user');

function indexUser(req, res, next) {
  User
    .find()
    .populate('group')
    .exec()
    .then((users) => {
      return res.json(users);
    })
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
      if(!user) return res.notFound();
      else return res.json(user);
    })
    .catch(next);
}

function updateUser(req, res, next) {
  if(req.file) req.body.profileImage = req.file.filename;

  User
    .findById(req.params.id)
    // .select('-group')
    // .select('+group')
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();

      for (const field in req.body) {
        user[field] = req.body[field];
      }

      // asign our ggroup to user obkect during update - this could probably be taken care of on the client side
      if (user.group !== null) user.group = req.user.group;

      return user
        .save()
        .then((user) => {
          return res.json(user);
          // return res.status(302).json(user);
        });
    })
    // .then((user) => {
    //   return res.json(user);
    // })
    .then(() => {
      return res.status(204).end();
    })
    .catch(next);
}

function deleteUser(req, res, next) {
  User
    .findById(req.params.id)
    .populate('group')
    .exec()
    .then((user) => {
      if(!user) return res.notFound();

      return user
        .remove()
        .then(() => {
          return res.json(user);
          // return res.json({ user, status: 200, message: `${user.username} successfully deleted` });
        });
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
