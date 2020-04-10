const Group = require('../models/group');
const User = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
    .exec()
    .then((groups) => {
      if (!groups) res.notFound('Group not found');
      return res.status(200).json(groups);
    })
    .catch(next);
}

function createGroup(req, res, next) {
  if (req.user) req.body.createdBy = req.user.id;

  Group
    .create(req.body)
    .then((group) => {
      if (!group) return res.notFound('Group was found');
      return res.status(200).json({ message: `${group.groupName} Created` });
    })
    .catch(next);
}

function showGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users properties.images.createdBy properties.comments.createdBy properties.ratings.createdBy')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group was not found');
      return res.json(group);
    })
    .catch(next);
}

function updateGroup(req, res, next) {
  if (req.user) req.body.createdBy = req.user.id;

  var params = req.params.id;
  var update = { $set: { groupName: req.body.groupName } };
  var options = { new: true };

  Group
    .findByIdAndUpdate(params, update, options)
    .populate('users')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group not found');
      return res.json({ group: group, message: `${group.groupName} Updated` });
    })
    .catch(next);
}

function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group not found');
      return group.remove();
    })
    .then((group) => res.status(200).json({ message: `${group.groupName} Deleted` }))
    .catch(next);
}

function addUserToGroup(req, res, next) {
  if (req.user) req.body.createdBy = req.user.id;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group not found');

      var params = req.body.userId;
      var update = { $set: { group: req.params.id } };
      var options = { new: true };

      return User
        .findByIdAndUpdate(params, update, options)
        .populate('group')
        .exec()
        .then((user) => {
          if (!user) res.status(404).json({ message: 'User not found' });

          return user
            .save()
            .then((user) => res.status(200).json(user));
        })
        .catch(next);
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deleteUserFromGroup(req, res, next) {
  if (req.user) req.body.createdBy = req.user.id;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group not found');

      var params = req.params.userId;
      var update = { $set: { group: null } };
      var options = { new: true };

      return User
        .findByIdAndUpdate(params, update, options)
        .populate('group')
        .exec()
        .then((user) => {
          if (!user) res.status(404).json({ message: 'User not found' });

          return user
            .save()
            .then((user) => res.status(200).json(user));
        })
        .catch(next);
    })
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = {
  index: indexGroup,
  create: createGroup,
  show: showGroup,
  update: updateGroup,
  delete: deleteGroup,
  addUser: addUserToGroup,
  deleteUser: deleteUserFromGroup
};
