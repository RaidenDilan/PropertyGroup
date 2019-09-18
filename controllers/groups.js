const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    .populate('users')
    // .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
    .exec()
    .then((groups) => {
      if(!groups) res.notFound('Group not found');
      return res.status(200).json(groups);
    })
    .catch(next);
}

function showGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users properties.images.createdBy properties.notes.createdBy properties.ratings.createdBy properties.likes')
    // .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');
      return res.status(200).json(group);
    })
    .catch(next);
}

function createGroup(req, res, next) {
  req.body.owner = req.user;

  Group
    .create(req.body)
    .then((group) => {
      if(!group) return res.notFound('Group was found');
      return res.status(200).json({ group, message: `${group.groupName} created` });
    })
    .catch(next);
    // .catch((err, next) => {
    //   if (err) return res.status(500).json({ message: 'Something went wrong trying update group' });
    //   return next();
    // });
}

function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');
      return group.remove();
    })
    .then((group) => res.status(200).json({ message: `${group.groupName} deleted` }))
    .catch(next);
}

function updateGroup(req, res, next) {
  req.body.owner = req.user;

  Group
    // .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.users } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');
      // Because of CastError: Cast to ObjectId failed for value... So we only want the groupName as add/removing users from group has it's own routes.
      group.groupName = req.body.groupName;
      return group.save();
    })
    .then((group) => res.status(200).json({ group, message: `${group.groupName} updated` }))
    .catch(next);
}

function addUserToGroup(req, res, next) {
  req.body.owner = req.user;

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findByIdAndUpdate(req.params.id, { $set: { users: req.body.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      return User
        .findByIdAndUpdate(req.body.userId, { $set: { group: req.params.id } }, { new: true }) // Using $set to set group to 'null' in user.group Object; after returning our user.
        .populate('group')
        .exec()
        .then((user) => {
          if(!user) res.status(404).json({ message: `User not found` });
          return user
            .save()
            .then((user) => res.status(200).json(user));
            // .then((user) => res.status(200).json({ message: `${user.username} added to ${group.groupName}` }));
        })
        .catch(next);
    })
    // .then(() => res.status(200).json({ message: `Group updated` }))
    .then(() => res.status(204).end())
    .catch(next);
}

function deleteUserFromGroup(req, res, next) {
  req.body.owner = req.user;

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $push: { values: { $each: [2, 3] }}}, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findByIdAndUpdate(req.params.id, { $pullAll: { users: req.params.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .populate('users')
    .exec()
    .then((group) => {
      if (!group) return res.notFound('Group not found'); // if (group.users.indexOf(req.params.userId) > -1) console.log(req.params.userId + ' exists in the group collection.');

      return User
        .findByIdAndUpdate(req.params.userId, { $set: { group: null } }, { new: true }) // Using $set to set group to 'null' in user.group Object; after returning our user.
        .populate('group')
        .exec()
        .then((user) => {
          if(!user) res.status(404).json({ message: `User not found` });
          // user.group = null; // set user group property to null when deleting user during groupsEdit/groupsNew
          return user
            .save()
            .then((user) => res.status(200).json({ message: `${user.username} deleted from ${group.groupName}` }));
        })
        .catch(next);
    })
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = {
  index: indexGroup,
  show: showGroup,
  create: createGroup,
  delete: deleteGroup,
  update: updateGroup,
  addUser: addUserToGroup,
  deleteUser: deleteUserFromGroup
};
