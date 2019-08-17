const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');

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
    .then((user) => res.status(200).json({ message: `${group.groupName} deleted` }))
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
  Group
    // .findById(req.params.id)
    .findByIdAndUpdate(req.params.id, { $addToSet: { users: req.body.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
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
            .then((user) => res.status(200).json({ message: `${user.username} added to ${group.groupName}` }));
        })
        .catch(next);
    })
    .then(() => res.status(200).json({ message: `Group updated` }))
    // .then(() => res.status(204).end())
    .catch(next);
}

function deleteUserFromGroup(req, res, next) {
  Group
    .findByIdAndUpdate(req.params.id, { $pullAll: { users: req.params.userId } }, { new: true }) // The $pullAll operator removes all instances of the specified values from an existing array. Unlike the $pull operator that removes elements by specifying a query, $pullAll removes elements that match the listed values.
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
        .then(() => res.json({ property, message: `Property added` }));
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
        .then(() => res.json({ pop, message: `Property deleted` }));
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
        .then(() => res.json({ note, message: `Note added` }));
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
        .then(() => res.json({ note, message: `Note deleted` }));
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
        .then(() => res.json({ image, message: `Image added` }));
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
            .then(() => res.json({ image, message: `Image deleted` }));
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
        .then(() => res.json({ rating, message: `rating added` }));
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
        .then(() => res.json({ rating, message: `rating deleted` }));
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

// console.log('req.user --------->>>', req.user);
// console.log('req.params --------->>>', req.params);
// console.log('req.body --------->>>', req.body);
// if (mongoose.Types.ObjectId.isValid(req.params.id)) {}
