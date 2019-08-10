const Promise = require('bluebird');
const Group   = require('../models/group');
const User    = require('../models/user');

function indexGroup(req, res, next) {
  Group
    .find()
    // .populate('properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
    .populate('users')
    .exec()
    .then((groups) => {
      return res.json(groups);
    })
    .catch(next);
}

function showGroup(req, res, next) {
  Group
  .findById(req.params.id)
  .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
  .exec()
  .then((group) => {
    if(!group) return res.notFound();
    return res.json(group);
  })
  .catch(next);
}

function createGroup(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .create(req.body)
    .then((group) => {
      return res.json({ group, status: 200, message: `${group.groupName} created successfully` });
    })
    .catch(next);
}

// In Developement
function updateGroup(req, res, next) {
  console.log('req.params.userId', req.params.userId);
  Group
    // .findById(req.params.id)
    // .findByIdAndUpdate(req.user.id, { $pull: { users: req.params.userId } })
    // .findByIdAndUpdate(req.params.id, { $pull: { users: req.params.userId } })
    .findByIdAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    // .findOneAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    .populate('users')
    .exec()
    .then((group) => {
      console.log('group.users ------------>', group.users);
      // if(group.users.includes(req.params.userId)) {}
      const index = group.users.indexOf(req.params.userId);
      console.log('index ------------>', index);
      group.users.splice(index, 1);
      return group.save();
    })
    // .then((group) => {
    //   console.log('group ------------>', group);
    //   console.log('PARAMS ------------>', req.params);
    //   console.log('Joined Group ------------>', req.params.id);
    //   console.log('Logged in user ------------>', req.user.id);
    //
    //   if(!group) return res.notFound();
    //
    //   for(const field in req.body) {
    //     group[field] = req.body[field];
    //   }
    //
    //   // const usersInGroup = group.users.find((user) => {
    //   //   console.log('user ------------>', user.id);
    //   //   return user.id === req.params.userId;
    //   // });
    //
    //   // const selected = usersInGroup.users.id(req.params.userId);
    //
    //   // selected.user.group = null;
    //
    //   // console.log('usersInGroup ------------>', usersInGroup);
    //   // console.log('selected --- server-side --->', selected);
    //
    //   // selected.save();
    //   // selected.remove();
    //   // usersInGroup.remove();
    //
    //   // return group
    //   //   .save()
    //   //   .then(() => {
    //   //     return res.json(group);
    //   //   });
    //   return group.save();
    //   // return group.update({
    //   //   id: req.params.id,
    //   //   user: { $not: { $elemMatch: { id: req.params.userId } } }
    //   // }, {
    //   //   $push: { user: { group: req.params.id, id: req.params.userId } }
    //   // });
    // })
    // .then(() => res.status(204).end())
    .then((group) => {
      return res.json(group);
    })
    .catch(next);
}

// GROUP - DELETE
function deleteGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      return group
        .remove()
        .then(() => {
          return res.json(group);
          // return res.json({ group, status: 200, message: `${group.groupName} successfully deleted` });
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// GROUP - ADD USER TO GROUP
function addUserToGroup(req, res, next) {
  Group
    .findById(req.params.id)
    .then((user) => {
      if(!user.group.includes(req.params.id)) user.group.push(req.params.id);
      return user.save();
    })
    .then((group) => {
      return res.json(group);
    })
    .catch(next);
}

// GROUP - DELETE USER FROM GROUP
function deleteUserFromGroup(req, res, next) {
  Group
    // .findByIdAndUpdate(req.user.id, { $pull: { users: req.params.userId } })
    .findByIdAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    // .findOneAndUpdate(req.params.id, req.user.id, { $pull: { users: req.params.userId } })
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();
      return group
        .save()
        .then(() => {
          return res.json(group);
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// PROPERTY - ADD TO GROUP
function addPropertyRoute(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const property = group.properties.create(req.body);
      group.properties.push(property);

      return group
        .save()
        .then(() => {
          return res.json(property);
        });
    })
    .catch(next);
}

// PROPERTY - DELETE FROM GROUP
function deletePropertyRoute(req, res, next) {
  Group
    .findById(req.user.group)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      prop.remove();

      return group
        .save()
        .then(() => {
          return res.json(prop);
        });
    })
    .then(() => res.status(204).end())
    .catch(next);

}

// PROPERTY - ADD NOTE
function addPropertyNote(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.create(req.body);
      prop.notes.push(note);

      return group
        .save()
        .then(() => {
          return res.json(note);
        });
    })
    .catch(next);
}

// PROPERTY - DELETE NOTE
function deletePropertyNote(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const note = prop.notes.id(req.params.noteId);

      note.remove();

      return group
        .save()
        .then(() => {
          return res.json(note);
        });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// PROPERTY - ADD IMAGE
function addPropertyImage(req, res, next) {
  req.body.createdBy = req.user;
  if(req.file) req.body.file = req.file.filename;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.create(req.body);
      prop.images.push(image);

      return group
        .save()
        .then(() => {
          return res.json(image);
        });
    })
    .catch(next);
}

// PROPERTY - DELETE IMAGE
function deletePropertyImage(req, res, next) {
  Group
    .findById(req.params.id)
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const image = prop.images.id(req.params.imageId);

      return image
        .remove()
        .then(() => {
          return group
          .save()
          .then(() => {
            return res.json(image);
          });
      });
    })
    .then(() => res.status(204).end())
    .catch(next);
}

// PROPERTY - ADD RATING
function addPropertyRating(req, res, next) {
  req.body.createdBy = req.user;

  Group
    .findById(req.params.id)
    .populate('users')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.create(req.body);
      prop.rating.push(rating);

      return group
        .save()
        .then(() => {
          return res.json(rating);
        });
    })
    .catch(next);
}

// PROPERTY - DELETE RATING
function deletePropertyRating(req, res, next) {
  Group
    .findById(req.params.id)
    // .populate('users properties.images.createdBy properties.notes.createdBy properties.rating.createdBy')
    .exec()
    .then((group) => {
      if(!group) return res.notFound();

      const prop = group.properties.find((property) => {
        return property.listingId === req.params.listingId;
      });

      const rating = prop.rating.id(req.params.ratingId);
      rating.remove();

      return group
        .save()
        .then(() => {
          return res.json(rating);
        });
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
