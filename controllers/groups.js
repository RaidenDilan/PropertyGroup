const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');
const mongoose = require('mongoose');

function indexGroup(req, res, next) {
  Group
    .find()
    .populate('users')
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
  .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
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
      // if(!group) return res.status(404).json({ message: 'No group was found' });
      return res.status(200).json({ group, message: `${group.groupName} created` });
    })
    .catch((err, next) => {
      if (err) return res.status(500).json({ message: 'Something went wrong trying update group' });
      return next();
    });
}

function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');
      return group.remove();
    })
    .then(() => res.status(204).end()) // .then((group) => res.status(200).json({ message: `${group.groupName} deleted` }))
    .catch(next);
}

function updateGroup(req, res, next) {
  req.body.owner = req.user;
  // if (mongoose.Types.ObjectId.isValid(req.params.id)) {}

  console.log('PAMARS ------>', req.params);
  console.log('BODY ------>', req.body.users);

  Group
    .findById(req.params.id)
    // .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.users } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      // for(const field in req.body) {
      //   group[field] = req.body[field];
      // }

      group.groupName = req.body.groupName;

      return group.save();
    })
    .then((group) => res.status(200).json({ group, message: `${group.groupName} updated` }))
    .catch(next);
}

function addUserToGroup(req, res, next) {
  console.log('PAMARS ------>>>', req.params);
  console.log('BODY ------>>>', req.body);
  // console.log('USER ------>>>', req.user);

  Group
    // .findById(req.params.id)
    .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.users } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    // .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.params.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      for(const field in req.body) {
        group[field] = req.body[field];
      }

      // group.users = req.body.users;
      // group.markModified('users');

      // if(group.users.indexOf(req.params.userId) === -1) {}
      // group.users.push(req.body.userId); // THIS LINE DOESN'T WORK AND IT PUSHES 'null' TO GROUP.USERS ARRAY

      return User
        .findByIdAndUpdate(req.body.userId, { $set: { group: req.params.id } }, { new: true }) // Using $set to set group to 'null' in user.group Object; after returning our user.
        .populate('group')
        .exec()
        .then((user) => {
          if(!user) res.status(404).json({ message: `User not found` });
          // user.group = null; // set user group property to null when deleting user during groupsEdit/groupsNew
          return user
            .save()
            .then((user) => res.status(200).json({ message: `${user.username} add to ${group.groupName}` }));
        })
        .catch(next);

      // return group.save();
    })
    .then((group) => res.json(group))
    .then(() => res.status(204).end())
    .catch(next);
    // .then((group) => res.status(200).json({ group, message: `User(s) added to group` }))
    // .catch((err, next) => {
    //   if (err) return res.status(500).json({ error: err.message, message: 'Something went wrong' });
    //   else return next();
    // });
}

function deleteUserFromGroup(req, res, next) {
  Group
    .findByIdAndUpdate(req.params.id, { $pullAll: { users: req.params.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
    .populate('users')
    .exec()
    .then((group) => {
      // if(!group) return res.status(404).json({ message: `Group not found` });
      if (!group) return res.notFound('Group not found');
      // if (group.users.indexOf(req.params.userId) > -1) console.log(req.params.userId + ' exists in the group collection.');

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

function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const property = group.properties.create(req.body);
      group.properties.push(property); // group.properties.concat([property]); // this uses $set so no problems

      return group
        .save()
        .then(() => res.json(property));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function deletePropertyRoute(req, res, next) {
  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      prop.remove();

      return group
        .save()
        .then(() => res.json(prop));
    })
    .then(() => res.status(204).end())
    .catch(next);

}

function addPropertyNote(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.create(req.body);
      prop.notes.push(note);

      return group
        .save()
        .then(() => res.json(note));
    })
    .catch(next);
}

function deletePropertyNote(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.id(req.params.noteId);

      note.remove();

      return group
        .save()
        .then(() => res.json(note));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyImage(req, res, next) {
  req.body.createdBy = req.user;
  if(req.file) req.body.file = req.file.filename;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => res.json(image));
    })
    .catch(next);
}

function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.id(req.params.imageId);

      return image
        .remove()
        .then(() => {
          return group
            .save()
            .then(() => res.json(image));
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

function addPropertyRating(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.create(req.body);
      prop.rating.push(rating);

      return group
        .save()
        .then(() => res.json(rating));
    })
    .catch(next);
}

function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound('Group not found');

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.id(req.params.ratingId);
      rating.remove();

      return group
        .save()
        .then(() => res.json(rating));
    })
    .then(() => res.status(204).end())
    .catch(next);
}

module.exports = {
  index: indexGroup,
  create: createGroup,
  show: showGroup,
  update: updateGroup,
  addUser: addUserToGroup,
  deleteUser: deleteUserFromGroup,
  delete: deleteGroup,
  addProperty: addPropertyRoute,
  deleteProperty: deletePropertyRoute,
  addNote: addPropertyNote,
  deleteNote: deletePropertyNote,
  addImage: addPropertyImage,
  deleteImage: deletePropertyImage,
  addRating: addPropertyRating,
  deleteRating: deletePropertyRating
};
